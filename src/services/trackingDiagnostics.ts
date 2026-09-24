import type { DualPalmState, HandPoint, TrackingDiagnostics } from '../types';

export type TrackingBackendId = TrackingDiagnostics['backend'];

const WINDOW = 120;
const JITTER_MAX_STEP_PX = 20;

function pushWindow(values: number[], value: number) {
  values.push(value);
  if (values.length > WINDOW) values.shift();
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pointDistancePx(
  a: HandPoint,
  b: HandPoint,
  width: number,
  height: number,
): number {
  return Math.hypot(
    (a.x - b.x) * width,
    (a.y - b.y) * height,
  );
}

export class TrackingDiagnosticsRecorder {
  private backend: TrackingBackendId = 'simulation';
  private frameIntervals: number[] = [];
  private processingTimes: number[] = [];
  private jitterSamples: number[] = [];
  private confidenceSamples: number[] = [];
  private lastTimestampMs: number | null = null;
  private previousCenters: [HandPoint | null, HandPoint | null] = [null, null];
  private previousPointCount = 0;

  private totalFrames = 0;
  private zeroPointFrames = 0;
  private onePointFrames = 0;
  private twoPointFrames = 0;
  private recoveryCount = 0;

  reset(backend: TrackingBackendId = this.backend) {
    this.backend = backend;
    this.frameIntervals = [];
    this.processingTimes = [];
    this.jitterSamples = [];
    this.confidenceSamples = [];
    this.lastTimestampMs = null;
    this.previousCenters = [null, null];
    this.previousPointCount = 0;
    this.totalFrames = 0;
    this.zeroPointFrames = 0;
    this.onePointFrames = 0;
    this.twoPointFrames = 0;
    this.recoveryCount = 0;
  }

  record(
    state: DualPalmState,
    backend: TrackingBackendId,
    width = 640,
    height = 480,
    processingMs?: number,
  ) {
    if (backend !== this.backend) this.reset(backend);

    this.totalFrames += 1;

    const points = [state.leftPalm, state.rightPalm].filter(Boolean).length;
    if (points === 0) this.zeroPointFrames += 1;
    else if (points === 1) this.onePointFrames += 1;
    else this.twoPointFrames += 1;

    if (this.previousPointCount < 2 && points === 2 && this.totalFrames > 1) {
      this.recoveryCount += 1;
    }
    this.previousPointCount = points;

    if (this.lastTimestampMs !== null) {
      const interval = state.timestampMs - this.lastTimestampMs;
      if (Number.isFinite(interval) && interval > 0 && interval < 1000) {
        pushWindow(this.frameIntervals, interval);
      }
    }
    this.lastTimestampMs = state.timestampMs;

    if (processingMs !== undefined && Number.isFinite(processingMs) && processingMs >= 0) {
      pushWindow(this.processingTimes, processingMs);
    }

    const centers: [HandPoint | null, HandPoint | null] = [
      state.leftPalm?.center ?? null,
      state.rightPalm?.center ?? null,
    ];

    for (let index = 0; index < 2; index += 1) {
      const current = centers[index];
      const previous = this.previousCenters[index];
      if (current && previous) {
        const displacement = pointDistancePx(current, previous, width, height);
        // Small frame-to-frame motion is a useful baseline proxy for jitter.
        // Larger displacement is treated as intentional learner movement.
        if (displacement <= JITTER_MAX_STEP_PX) {
          pushWindow(this.jitterSamples, displacement);
        }
      }
    }
    this.previousCenters = centers;

    for (const palm of [state.leftPalm, state.rightPalm]) {
      if (palm?.confidence !== undefined && Number.isFinite(palm.confidence)) {
        pushWindow(this.confidenceSamples, palm.confidence);
      }
    }
  }

  snapshot(state?: DualPalmState): TrackingDiagnostics {
    const avgInterval = mean(this.frameIntervals);
    const confidence = this.confidenceSamples.length > 0
      ? mean(this.confidenceSamples)
      : null;

    return {
      backend: this.backend,
      fps: avgInterval > 0 ? 1000 / avgInterval : 0,
      avgFrameIntervalMs: avgInterval,
      avgProcessingMs: this.processingTimes.length > 0 ? mean(this.processingTimes) : null,
      jitterPx: mean(this.jitterSamples),
      confidence,
      totalFrames: this.totalFrames,
      zeroPointFrames: this.zeroPointFrames,
      onePointFrames: this.onePointFrames,
      twoPointFrames: this.twoPointFrames,
      recoveryCount: this.recoveryCount,
      marker1Present: Boolean(state?.leftPalm?.present),
      marker2Present: Boolean(state?.rightPalm?.present),
      landmarkCount1: state?.leftPalm?.landmarks?.length ?? 0,
      landmarkCount2: state?.rightPalm?.landmarks?.length ?? 0,
    };
  }
}
