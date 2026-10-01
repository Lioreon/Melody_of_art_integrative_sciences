import type {
  BodyCalibration,
  DualPalmState,
  FingerGeometry,
  GestureState,
  HandPoint,
  PalmData,
} from '../types';
import { mapBodyToMusic } from '../data/musicalScaleData';
import { applyBodyCalibration, isValidBodyCalibration } from './bodyCalibration';

export type ReplayBackend = 'simulation' | 'mediapipe-hands' | 'color-markers';
export type ReplayStateV1 = Omit<DualPalmState, 'timestampMs'>;

export interface ReplayFrameV1 {
  tMs: number;
  state: ReplayStateV1;
}

export interface ReplaySessionV1 {
  schemaVersion: 1;
  backend: ReplayBackend;
  context: {
    recordedCalibration: BodyCalibration | null;
    viewport?: { width: number; height: number };
  };
  frames: ReplayFrameV1[];
}

export interface ReplayMusicalResult {
  tMs: number;
  trackingValid: boolean;
  noteId: string | null;
  figureId: string | null;
  leftGesture: GestureState | null;
  rightGesture: GestureState | null;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(path: string, detail: string): never {
  throw new Error(`Invalid replay session at ${path}: ${detail}`);
}

function finiteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(path, 'expected a finite number');
  return value;
}

function boundedNumber(value: unknown, path: string, min: number, max: number): number {
  const number = finiteNumber(value, path);
  if (number < min || number > max) fail(path, `expected ${min}..${max}`);
  return number;
}

function validatePoint(value: unknown, path: string): asserts value is HandPoint {
  if (!isRecord(value)) fail(path, 'expected a point object');
  boundedNumber(value.x, `${path}.x`, 0, 1);
  boundedNumber(value.y, `${path}.y`, 0, 1);
  if (value.z !== undefined) finiteNumber(value.z, `${path}.z`);
}

function validateFingerGeometry(value: unknown, expectedName: string, path: string): asserts value is FingerGeometry {
  if (!isRecord(value)) fail(path, 'expected finger geometry');
  if (value.name !== expectedName) fail(`${path}.name`, `expected ${expectedName}`);
  boundedNumber(value.straightness, `${path}.straightness`, 0, 1);
  const extensionRatio = finiteNumber(value.extensionRatio, `${path}.extensionRatio`);
  if (extensionRatio < 0) fail(`${path}.extensionRatio`, 'expected a non-negative value');
  if (typeof value.extended !== 'boolean') fail(`${path}.extended`, 'expected a boolean');
}

function validatePalm(value: unknown, path: string): asserts value is PalmData | null {
  if (value === null) return;
  if (!isRecord(value)) fail(path, 'expected a palm object or null');
  if (typeof value.present !== 'boolean') fail(`${path}.present`, 'expected a boolean');
  if (!['OPEN_HAND', 'CLOSED_FIST', 'UNKNOWN'].includes(String(value.gestureState))) {
    fail(`${path}.gestureState`, 'unknown gesture state');
  }
  validatePoint(value.center, `${path}.center`);
  validatePoint(value.wrist, `${path}.wrist`);
  validatePoint(value.indexMcp, `${path}.indexMcp`);
  validatePoint(value.pinkyMcp, `${path}.pinkyMcp`);

  if (value.landmarks !== undefined) {
    if (!Array.isArray(value.landmarks) || value.landmarks.length !== 21) {
      fail(`${path}.landmarks`, 'expected exactly 21 points');
    }
    value.landmarks.forEach((point, index) => validatePoint(point, `${path}.landmarks[${index}]`));
  }
  if (value.handedness !== undefined && !['Left', 'Right', 'Unknown'].includes(String(value.handedness))) {
    fail(`${path}.handedness`, 'unknown handedness');
  }
  if (value.confidence !== undefined) boundedNumber(value.confidence, `${path}.confidence`, 0, 1);

  if (value.geometry !== undefined) {
    if (!isRecord(value.geometry)) fail(`${path}.geometry`, 'expected geometry object');
    boundedNumber(value.geometry.opennessScore, `${path}.geometry.opennessScore`, 0, 1);
    const palmSpan = finiteNumber(value.geometry.palmSpan, `${path}.geometry.palmSpan`);
    if (palmSpan < 0) fail(`${path}.geometry.palmSpan`, 'expected a non-negative value');
    if (!isRecord(value.geometry.fingers)) fail(`${path}.geometry.fingers`, 'expected finger map');
    for (const name of ['thumb', 'index', 'middle', 'ring', 'pinky'] as const) {
      validateFingerGeometry(value.geometry.fingers[name], name, `${path}.geometry.fingers.${name}`);
    }
  }

  if (value.bbox !== undefined) {
    if (!isRecord(value.bbox)) fail(`${path}.bbox`, 'expected bounding box');
    boundedNumber(value.bbox.x, `${path}.bbox.x`, 0, 1);
    boundedNumber(value.bbox.y, `${path}.bbox.y`, 0, 1);
    boundedNumber(value.bbox.width, `${path}.bbox.width`, 0, 1);
    boundedNumber(value.bbox.height, `${path}.bbox.height`, 0, 1);
  }
}

function validateCalibration(value: unknown, path: string): asserts value is BodyCalibration | null {
  if (value === null) return;
  if (!isRecord(value)) fail(path, 'expected calibration object or null');
  const calibration = value as unknown as BodyCalibration;
  if (!isValidBodyCalibration(calibration)) fail(path, 'invalid body calibration');
  const capturedAt = finiteNumber(calibration.capturedAt, `${path}.capturedAt`);
  if (capturedAt < 0) fail(`${path}.capturedAt`, 'expected a non-negative value');
}

function validateState(value: unknown, path: string): asserts value is ReplayStateV1 {
  if (!isRecord(value)) fail(path, 'expected state object');
  validatePalm(value.leftPalm, `${path}.leftPalm`);
  validatePalm(value.rightPalm, `${path}.rightPalm`);
  const distancePx = finiteNumber(value.distancePx, `${path}.distancePx`);
  if (distancePx < 0) fail(`${path}.distancePx`, 'expected a non-negative value');
  boundedNumber(value.distanceNormalized, `${path}.distanceNormalized`, 0, 1);
  const distanceCm = finiteNumber(value.distanceCm, `${path}.distanceCm`);
  if (distanceCm < 0) fail(`${path}.distanceCm`, 'expected a non-negative value');
  boundedNumber(value.angleDegrees, `${path}.angleDegrees`, -180, 180);
}

export function validateReplaySession(value: unknown): asserts value is ReplaySessionV1 {
  if (!isRecord(value)) fail('$', 'expected an object');
  if (value.schemaVersion !== 1) fail('$.schemaVersion', 'unsupported schema version');
  if (!['simulation', 'mediapipe-hands', 'color-markers'].includes(String(value.backend))) {
    fail('$.backend', 'unknown backend');
  }
  if (!isRecord(value.context)) fail('$.context', 'expected context object');
  validateCalibration(value.context.recordedCalibration, '$.context.recordedCalibration');
  if (value.context.viewport !== undefined) {
    if (!isRecord(value.context.viewport)) fail('$.context.viewport', 'expected viewport object');
    const width = finiteNumber(value.context.viewport.width, '$.context.viewport.width');
    const height = finiteNumber(value.context.viewport.height, '$.context.viewport.height');
    if (width <= 0 || height <= 0) fail('$.context.viewport', 'dimensions must be positive');
  }
  if (!Array.isArray(value.frames) || value.frames.length === 0) {
    fail('$.frames', 'expected at least one frame');
  }

  let previousTime = -1;
  value.frames.forEach((frame, index) => {
    const path = `$.frames[${index}]`;
    if (!isRecord(frame)) fail(path, 'expected frame object');
    const tMs = finiteNumber(frame.tMs, `${path}.tMs`);
    if (tMs < 0) fail(`${path}.tMs`, 'expected a non-negative time');
    if (tMs < previousTime) fail(`${path}.tMs`, 'timestamps must be monotonic');
    previousTime = tMs;
    validateState(frame.state, `${path}.state`);
  });
}

export function deserializeReplaySession(json: string): ReplaySessionV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch (error) {
    throw new Error(`Invalid replay JSON: ${error instanceof Error ? error.message : 'parse failed'}`);
  }
  validateReplaySession(parsed);
  return parsed;
}

export function serializeReplaySession(session: ReplaySessionV1): string {
  validateReplaySession(session);
  return JSON.stringify(session, null, 2);
}

export class NumericSessionRecorder {
  private readonly frames: ReplayFrameV1[] = [];
  private firstTimestampMs: number | null = null;
  private previousTimestampMs: number | null = null;

  constructor(
    private readonly backend: ReplayBackend,
    private readonly recordedCalibration: BodyCalibration | null = null,
    private readonly viewport?: { width: number; height: number },
  ) {}

  capture(input: DualPalmState): void {
    const timestampMs = finiteNumber(input.timestampMs, 'DualPalmState.timestampMs');
    if (this.previousTimestampMs !== null && timestampMs < this.previousTimestampMs) {
      throw new Error('Replay source timestamps must be monotonic');
    }
    if (this.firstTimestampMs === null) this.firstTimestampMs = timestampMs;
    this.previousTimestampMs = timestampMs;
    const snapshot = structuredClone(input);
    const { timestampMs: _timestampMs, ...state } = snapshot;
    this.frames.push({ tMs: timestampMs - this.firstTimestampMs, state });
  }

  finish(): ReplaySessionV1 {
    const session: ReplaySessionV1 = {
      schemaVersion: 1,
      backend: this.backend,
      context: {
        recordedCalibration: structuredClone(this.recordedCalibration),
        ...(this.viewport ? { viewport: structuredClone(this.viewport) } : {}),
      },
      frames: structuredClone(this.frames),
    };
    validateReplaySession(session);
    return session;
  }
}

export function replayMusicalSession(
  session: ReplaySessionV1,
  calibration: BodyCalibration | null = session.context.recordedCalibration,
): ReplayMusicalResult[] {
  validateReplaySession(session);
  if (calibration !== null) validateCalibration(calibration, 'replay calibration');

  let currentNoteId: string | undefined;
  let currentFigureId: string | undefined;

  return session.frames.map((frame) => {
    const rawState: DualPalmState = {
      ...structuredClone(frame.state),
      timestampMs: frame.tMs,
    };
    const leftGesture = rawState.leftPalm?.gestureState ?? null;
    const rightGesture = rawState.rightPalm?.gestureState ?? null;
    const trackingValid = Boolean(rawState.leftPalm?.present && rawState.rightPalm?.present);

    if (!trackingValid) {
      return {
        tMs: frame.tMs,
        trackingValid: false,
        noteId: null,
        figureId: null,
        leftGesture,
        rightGesture,
      };
    }

    const musicalState = applyBodyCalibration(rawState, calibration);
    const averageY = (musicalState.leftPalm!.center.y + musicalState.rightPalm!.center.y) / 2;
    const mapped = mapBodyToMusic(
      averageY,
      musicalState.distanceCm,
      {},
      { noteId: currentNoteId, figureId: currentFigureId },
    );
    currentNoteId = mapped.note.id;
    currentFigureId = mapped.figure.id;

    return {
      tMs: frame.tMs,
      trackingValid: true,
      noteId: currentNoteId,
      figureId: currentFigureId,
      leftGesture,
      rightGesture,
    };
  });
}
