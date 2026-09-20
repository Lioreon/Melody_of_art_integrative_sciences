import type { DualPalmState, HandPoint, PalmData } from '../types';

// Legacy exercise thresholds use this virtual scale, not measured centimetres.
export const SEPARATION_SCALE = 125;
export function palmAt(center: HandPoint): PalmData {
  return { present: true, center, wrist: center, indexMcp: center, pinkyMcp: center };
}

export function trackingState(leftPalm: PalmData | null, rightPalm: PalmData | null,
  width = 640, height = 480, timestampMs = performance.now()): DualPalmState {
  const dx = leftPalm && rightPalm ? rightPalm.center.x - leftPalm.center.x : 0;
  const dy = leftPalm && rightPalm ? rightPalm.center.y - leftPalm.center.y : 0;
  const separation = Math.abs(dx);
  return { leftPalm, rightPalm, distanceNormalized: separation,
    distanceCm: Math.round(separation * SEPARATION_SCALE),
    distancePx: Math.round(separation * width),
    angleDegrees: Math.atan2(dy * height, dx * width) * 180 / Math.PI, timestampMs };
}
