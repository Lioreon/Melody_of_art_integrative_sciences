import type { BodyCalibration, DualPalmState, PalmData } from '../types';
import { DEFAULT_PITCH_Y_MAX, DEFAULT_PITCH_Y_MIN } from '../data/musicalScaleData';

const BODY_CALIBRATION_KEY = 'melody-motion.body-calibration.v1';
export const BODY_CALIBRATION_VERSION = 1;
export const STANDARD_OPENING_MIN = 15;
export const STANDARD_OPENING_MAX = 85;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function isValidBodyCalibration(value: BodyCalibration | null | undefined): value is BodyCalibration {
  if (!value) return false;
  return Number.isFinite(value.minOpening)
    && Number.isFinite(value.maxOpening)
    && Number.isFinite(value.lowY)
    && Number.isFinite(value.highY)
    && value.maxOpening - value.minOpening >= 10
    && value.lowY - value.highY >= 0.12
    && value.lowY <= 1
    && value.highY >= 0
    && value.version === BODY_CALIBRATION_VERSION;
}

export function normalizeOpening(opening: number, calibration: BodyCalibration): number {
  if (!isValidBodyCalibration(calibration)) return 0.5;
  return clamp01((opening - calibration.minOpening) / (calibration.maxOpening - calibration.minOpening));
}

export function normalizeHeight(y: number, calibration: BodyCalibration): number {
  if (!isValidBodyCalibration(calibration)) return 0.5;
  return clamp01((calibration.lowY - y) / (calibration.lowY - calibration.highY));
}

export function rawOpeningToMusical(opening: number, calibration: BodyCalibration | null): number {
  if (!calibration || !isValidBodyCalibration(calibration)) return opening;
  return STANDARD_OPENING_MIN + normalizeOpening(opening, calibration) * (STANDARD_OPENING_MAX - STANDARD_OPENING_MIN);
}

export function rawYToMusical(y: number, calibration: BodyCalibration | null): number {
  if (!calibration || !isValidBodyCalibration(calibration)) return y;
  const height = normalizeHeight(y, calibration);
  return DEFAULT_PITCH_Y_MAX - height * (DEFAULT_PITCH_Y_MAX - DEFAULT_PITCH_Y_MIN);
}

export function musicalOpeningToRaw(opening: number, calibration: BodyCalibration | null): number {
  if (!calibration || !isValidBodyCalibration(calibration)) return opening;
  const fraction = clamp01((opening - STANDARD_OPENING_MIN) / (STANDARD_OPENING_MAX - STANDARD_OPENING_MIN));
  return calibration.minOpening + fraction * (calibration.maxOpening - calibration.minOpening);
}

export function musicalYToRaw(y: number, calibration: BodyCalibration | null): number {
  if (!calibration || !isValidBodyCalibration(calibration)) return y;
  const fraction = clamp01((DEFAULT_PITCH_Y_MAX - y) / (DEFAULT_PITCH_Y_MAX - DEFAULT_PITCH_Y_MIN));
  return calibration.lowY - fraction * (calibration.lowY - calibration.highY);
}

function transformPalm(palm: PalmData | null, calibration: BodyCalibration | null): PalmData | null {
  if (!palm || !calibration || !isValidBodyCalibration(calibration)) return palm;
  return { ...palm, center: { ...palm.center, y: rawYToMusical(palm.center.y, calibration) } };
}

export function applyBodyCalibration(state: DualPalmState, calibration: BodyCalibration | null): DualPalmState {
  if (!calibration || !isValidBodyCalibration(calibration)) return state;
  const musicalOpening = rawOpeningToMusical(state.distanceCm, calibration);
  return {
    ...state,
    leftPalm: transformPalm(state.leftPalm, calibration),
    rightPalm: transformPalm(state.rightPalm, calibration),
    distanceCm: musicalOpening,
    distanceNormalized: clamp01((musicalOpening - STANDARD_OPENING_MIN) / (STANDARD_OPENING_MAX - STANDARD_OPENING_MIN)),
  };
}

export function loadBodyCalibration(): BodyCalibration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BODY_CALIBRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BodyCalibration;
    return isValidBodyCalibration(parsed) ? parsed : null;
  } catch { return null; }
}

export function saveBodyCalibration(calibration: BodyCalibration | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!calibration) { window.localStorage.removeItem(BODY_CALIBRATION_KEY); return; }
    window.localStorage.setItem(BODY_CALIBRATION_KEY, JSON.stringify(calibration));
  } catch {
    // Calibration remains active in memory if local persistence is unavailable.
  }
}
