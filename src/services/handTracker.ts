/** @license SPDX-License-Identifier: Apache-2.0 */
import type { Hands, Results } from '@mediapipe/hands';
import type { DualPalmState, PalmData, TrackingDiagnostics, TrackingModeType } from '../types';
import { ColorTracker } from './colorTracker';
import { palmDataFromLandmarks, type HandednessObservation } from './handObservation';
import { palmAt, trackingState, SEPARATION_SCALE } from './trackingGeometry';
import { TrackingDiagnosticsRecorder, type TrackingBackendId } from './trackingDiagnostics';

export type HandTrackerCallback = (state: DualPalmState) => void;

export class HandTracker {
  public readonly colors = new ColorTracker();
  private hands: Hands | null = null;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private callback: HandTrackerCallback | null = null;
  private onError: (() => void) | null = null;
  private frameId: number | null = null;
  private pending: Promise<void> | null = null;
  private generation = 0;
  private lastError = '';
  private isRunning = false;
  private isSimulationMode = false;
  private lastFrameTime = -1;
  private lastVideoTime = -1;
  private simLeftX = 0.32;
  private simLeftY = 0.5;
  private simRightX = 0.68;
  private simRightY = 0.5;
  private currentBackend: TrackingBackendId = 'simulation';
  private lastState: DualPalmState | undefined;
  private diagnostics = new TrackingDiagnosticsRecorder();

  public async initialize(
    video: HTMLVideoElement,
    onResults: HandTrackerCallback,
    mode: TrackingModeType = 'hands',
    onError?: () => void,
    deviceId = '',
  ): Promise<boolean> {
    this.stop();
    this.lastError = '';
    this.currentBackend = mode === 'colored_balls' ? 'color-markers' : 'mediapipe-hands';
    this.diagnostics.reset(this.currentBackend);

    const generation = this.generation;
    this.callback = onResults;
    this.onError = onError ?? null;
    this.videoElement = video;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      if (generation !== this.generation) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }

      this.stream = stream;
      video.srcObject = stream;
      await video.play();
      if (generation !== this.generation) return false;

      for (const track of stream.getVideoTracks()) {
        track.onended = () => {
          if (generation !== this.generation) return;
          this.lastError = 'La fuente de video se desconectó. Elige otra cámara o vuelve a conectarla.';
          this.stop();
          this.emitState(trackingState(null, null), this.currentBackend);
          this.onError?.();
        };
      }

      if (mode === 'colored_balls') {
        this.isRunning = true;
        this.colors.start(video, state => {
          if (generation === this.generation) this.emitState(state, 'color-markers');
        });
        return true;
      }

      const { Hands } = await import('@mediapipe/hands');
      if (generation !== this.generation) return false;

      const hands = new Hands({ locateFile: file => `/mediapipe/hands/${file}` });
      this.hands = hands;
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });
      hands.onResults(results => {
        if (generation === this.generation && this.isRunning) this.processResults(results);
      });

      this.pending = hands.initialize();
      await this.pending;
      if (generation !== this.generation) return false;

      this.isRunning = true;
      this.frameId = requestAnimationFrame(this.loop);
      return true;
    } catch (error) {
      if (generation === this.generation) {
        const name = error instanceof Error ? error.name : '';
        this.lastError = name === 'NotAllowedError'
          ? 'El navegador o Windows bloqueó la cámara. Revisa los permisos de cámara e inténtalo de nuevo.'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
          ? 'La cámara elegida no está disponible. Actualiza la lista y selecciona otra fuente.'
          : name === 'NotReadableError'
          ? 'No se pudo abrir la cámara. Puede estar ocupada por otra aplicación.'
          : 'No se pudo iniciar la cámara o el modelo de seguimiento. Prueba otra fuente o los marcadores de color.';
        console.warn('No se pudo iniciar el seguimiento:', error);
        this.stop();
      }
      return false;
    }
  }

  private loop = async (now: number) => {
    this.frameId = null;
    if (!this.isRunning || this.isSimulationMode || !this.hands || !this.videoElement) return;

    const generation = this.generation;
    const video = this.videoElement;

    if (
      !document.hidden
      && video.readyState >= 2
      && video.currentTime !== this.lastVideoTime
      && now - this.lastFrameTime >= 1000 / 30
    ) {
      this.lastFrameTime = now;
      this.lastVideoTime = video.currentTime;

      try {
        const processingStarted = performance.now();
        this.pending = this.hands.send({ image: video });
        await this.pending;
        this.diagnostics.recordProcessing(performance.now() - processingStarted);
      } catch (error) {
        if (generation === this.generation) {
          this.lastError = 'El seguimiento se detuvo. Puedes reintentar la cámara o usar el simulador.';
          console.warn('Seguimiento detenido:', error);
          this.stop();
          this.emitState(trackingState(null, null), this.currentBackend);
          this.onError?.();
        }
        return;
      }
    }

    if (generation === this.generation && this.isRunning) {
      this.frameId = requestAnimationFrame(this.loop);
    }
  };

  private processResults(results: Results) {
    const handedness = (results.multiHandedness ?? []) as HandednessObservation[];

    const palms: PalmData[] = (results.multiHandLandmarks ?? [])
      .slice(0, 2)
      .map((points, index) => palmDataFromLandmarks(points, handedness[index]))
      .filter((palm): palm is PalmData => palm !== null);

    // Phase T1 keeps the current spatial slots for backward compatibility.
    // The model-provided handedness is persisted separately for future identity work (T5).
    palms.sort((a, b) => a.center.x - b.center.x);

    const state = trackingState(
      palms[0] ?? null,
      palms[1] ?? null,
      this.videoElement?.videoWidth || 640,
      this.videoElement?.videoHeight || 480,
    );
    this.emitState(state, 'mediapipe-hands');
  }

  private emitState(
    state: DualPalmState,
    backend: TrackingBackendId = this.currentBackend,
  ) {
    this.currentBackend = backend;
    this.lastState = state;
    this.diagnostics.record(
      state,
      backend,
      this.videoElement?.videoWidth || 640,
      this.videoElement?.videoHeight || 480,
    );
    this.callback?.(state);
  }

  public enableSimulationMode(onResults?: HandTrackerCallback) {
    this.stop();
    if (onResults) this.callback = onResults;
    this.currentBackend = 'simulation';
    this.diagnostics.reset('simulation');
    this.isSimulationMode = true;
    this.isRunning = true;
    this.emitSimulationState();
  }

  public setSimulatedPalmPositions(lx: number, ly: number, rx: number, ry: number) {
    this.simLeftX = Math.max(0.02, Math.min(0.49, lx));
    this.simRightX = Math.max(0.51, Math.min(0.98, rx));
    this.simLeftY = Math.max(0.1, Math.min(0.9, ly));
    this.simRightY = Math.max(0.1, Math.min(0.9, ry));
    if (this.isSimulationMode) this.emitSimulationState();
  }

  public setSimulatedDistanceCm(distance: number) {
    const half = Math.max(0.08, Math.min(0.8, distance / SEPARATION_SCALE)) / 2;
    this.setSimulatedPalmPositions(
      0.5 - half,
      this.simLeftY,
      0.5 + half,
      this.simRightY,
    );
  }

  private emitSimulationState() {
    this.emitState(
      trackingState(
        palmAt({ x: this.simLeftX, y: this.simLeftY }),
        palmAt({ x: this.simRightX, y: this.simRightY }),
      ),
      'simulation',
    );
  }

  public stop() {
    this.generation += 1;
    this.isRunning = false;
    this.isSimulationMode = false;
    this.colors.stop();

    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;

    this.stream?.getTracks().forEach(track => {
      track.onended = null;
      track.stop();
    });
    this.stream = null;

    if (this.videoElement) this.videoElement.srcObject = null;
    this.videoElement = null;

    const hands = this.hands;
    this.hands = null;
    if (hands) {
      void (this.pending ?? Promise.resolve())
        .catch(() => {})
        .then(() => hands.close())
        .catch(() => {});
    }

    this.pending = null;
    this.lastFrameTime = -1;
    this.lastVideoTime = -1;
  }

  public getDiagnostics(): TrackingDiagnostics {
    return this.diagnostics.snapshot(this.lastState);
  }

  public getIsSimulation() { return this.isSimulationMode; }
  public getLastError() { return this.lastError; }
  public getIsRunning() { return this.isRunning; }
}
