import type { GestureState } from '../types';
import { analyzeHandGeometry, countExtendedFingers } from './handGeometry';

export interface GestureLandmark {
  x: number;
  y: number;
  z?: number;
}

const REQUIRED_LANDMARKS = 21;
const LONG_FINGER_INDICES = [
  { mcp: 5, tip: 8 },
  { mcp: 9, tip: 12 },
  { mcp: 13, tip: 16 },
  { mcp: 17, tip: 20 },
];

function distance(a: GestureLandmark, b: GestureLandmark): number {
  const zA = a.z ?? 0;
  const zB = b.z ?? 0;
  return Math.hypot(a.x - b.x, a.y - b.y, zA - zB);
}

function isValidLandmark(point: GestureLandmark | undefined): point is GestureLandmark {
  return Boolean(point) && Number.isFinite(point.x) && Number.isFinite(point.y)
    && (point.z === undefined || Number.isFinite(point.z));
}

/**
 * Classifies a single hand from MediaPipe's normalized landmarks.
 * Ratios against the palm avoid assumptions about image resolution or hand size.
 */
export function classifyGesture(landmarks: readonly GestureLandmark[]): GestureState {
  if (landmarks.length < REQUIRED_LANDMARKS || landmarks.some(point => !isValidLandmark(point))) {
    return 'UNKNOWN';
  }

  const wrist = landmarks[0];
  const palmSize = distance(wrist, landmarks[9]);
  if (palmSize === 0) return 'UNKNOWN';

  const fingerBaseDistances = LONG_FINGER_INDICES.map(({ mcp }) => distance(wrist, landmarks[mcp]));
  const thumbBaseDistance = distance(wrist, landmarks[5]);
  if (fingerBaseDistances.some(value => value === 0) || thumbBaseDistance === 0) return 'UNKNOWN';

  const extensionRatios = LONG_FINGER_INDICES.map(({ mcp, tip }) =>
    distance(wrist, landmarks[tip]) / distance(wrist, landmarks[mcp]));
  const thumbRatio = distance(wrist, landmarks[4]) / distance(wrist, landmarks[5]);
  const geometry = analyzeHandGeometry(landmarks);
  const extendedFingers = countExtendedFingers(geometry ?? undefined);

  const ratioOpen = extensionRatios.every(ratio => ratio >= 1.35) && thumbRatio >= 1.25;
  const ratioClosed = extensionRatios.every(ratio => ratio <= 1.15) && thumbRatio <= 1.2;

  // Prefer agreement between fingertip reach and phalange geometry when the
  // latter is informative. Fall back to the legacy ratio classifier for
  // synthetic/incomplete-shape fixtures that still contain 21 valid points.
  if (geometry && extendedFingers >= 4 && geometry.opennessScore >= 0.62 && ratioOpen) {
    return 'OPEN_HAND';
  }
  if (geometry && extendedFingers <= 1 && geometry.opennessScore <= 0.48 && ratioClosed) {
    return 'CLOSED_FIST';
  }
  if (ratioOpen) return 'OPEN_HAND';
  if (ratioClosed) return 'CLOSED_FIST';
  return 'UNKNOWN';
}
