import type { HandPoint, PalmData } from '../types';
import { classifyGesture } from './gestureClassifier';
import { analyzeHandGeometry } from './handGeometry';

export interface HandednessObservation {
  label?: string;
  score?: number;
}

const REQUIRED_LANDMARKS = 21;
const PALM_ANCHORS = [0, 5, 9, 17] as const;

export function palmDataFromLandmarks(
  points: readonly HandPoint[],
  handedness?: HandednessObservation,
): PalmData | null {
  if (points.length < REQUIRED_LANDMARKS) return null;

  const copied = points.slice(0, REQUIRED_LANDMARKS).map((point) => ({
    x: point.x,
    y: point.y,
    z: point.z,
  }));

  if (copied.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    return null;
  }

  const anchors = PALM_ANCHORS.map((index) => copied[index]);
  const label = handedness?.label;
  const normalizedHandedness: PalmData['handedness'] =
    label === 'Left' || label === 'Right' ? label : 'Unknown';

  return {
    present: true,
    gestureState: classifyGesture(copied),
    center: {
      x: anchors.reduce((sum, point) => sum + point.x, 0) / anchors.length,
      y: anchors.reduce((sum, point) => sum + point.y, 0) / anchors.length,
    },
    wrist: copied[0],
    indexMcp: copied[5],
    pinkyMcp: copied[17],
    landmarks: copied,
    handedness: normalizedHandedness,
    confidence: Number.isFinite(handedness?.score) ? handedness?.score : undefined,
    geometry: analyzeHandGeometry(copied) ?? undefined,
  };
}
