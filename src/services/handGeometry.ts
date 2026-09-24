import type { FingerGeometry, FingerName, HandGeometry, HandPoint } from '../types';

const FINGER_CHAINS: Record<FingerName, readonly [number, number, number, number]> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

const MCP_INDEX: Record<FingerName, number> = {
  thumb: 2,
  index: 5,
  middle: 9,
  ring: 13,
  pinky: 17,
};

const TIP_INDEX: Record<FingerName, number> = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

function distance(a: HandPoint, b: HandPoint): number {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y,
    (a.z ?? 0) - (b.z ?? 0),
  );
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function valid(point: HandPoint | undefined): point is HandPoint {
  return Boolean(point)
    && Number.isFinite(point.x)
    && Number.isFinite(point.y)
    && (point.z === undefined || Number.isFinite(point.z));
}

function fingerGeometry(
  name: FingerName,
  landmarks: readonly HandPoint[],
): FingerGeometry {
  const chain = FINGER_CHAINS[name].map((index) => landmarks[index]);
  const pathLength =
    distance(chain[0], chain[1])
    + distance(chain[1], chain[2])
    + distance(chain[2], chain[3]);
  const directLength = distance(chain[0], chain[3]);
  const straightness = pathLength > 0 ? clamp01(directLength / pathLength) : 0;

  const wrist = landmarks[0];
  const mcp = landmarks[MCP_INDEX[name]];
  const tip = landmarks[TIP_INDEX[name]];
  const wristToMcp = distance(wrist, mcp);
  const extensionRatio = wristToMcp > 0 ? distance(wrist, tip) / wristToMcp : 0;

  const ratioThreshold = name === 'thumb' ? 1.18 : 1.26;
  const extended = straightness >= 0.78 && extensionRatio >= ratioThreshold;

  return {
    name,
    straightness,
    extensionRatio,
    extended,
  };
}

/**
 * Derives normalized hand geometry from MediaPipe's 21 landmarks.
 *
 * This is interpretation data, not musical meaning. It deliberately does not
 * decide whether a hand shape represents a rest, accidental, articulation, etc.
 */
export function analyzeHandGeometry(
  landmarks: readonly HandPoint[],
): HandGeometry | null {
  if (landmarks.length < 21 || landmarks.slice(0, 21).some((point) => !valid(point))) {
    return null;
  }

  const fingers = {
    thumb: fingerGeometry('thumb', landmarks),
    index: fingerGeometry('index', landmarks),
    middle: fingerGeometry('middle', landmarks),
    ring: fingerGeometry('ring', landmarks),
    pinky: fingerGeometry('pinky', landmarks),
  };

  const values = Object.values(fingers);
  const opennessScore = values.reduce((sum, finger) => {
    const straightComponent = clamp01((finger.straightness - 0.45) / 0.5);
    const ratioFloor = finger.name === 'thumb' ? 0.9 : 0.95;
    const ratioCeiling = finger.name === 'thumb' ? 1.45 : 1.75;
    const ratioComponent = clamp01(
      (finger.extensionRatio - ratioFloor) / (ratioCeiling - ratioFloor),
    );
    return sum + straightComponent * 0.55 + ratioComponent * 0.45;
  }, 0) / values.length;

  return {
    opennessScore: clamp01(opennessScore),
    palmSpan: distance(landmarks[4], landmarks[20]),
    fingers,
  };
}

export function countExtendedFingers(geometry: HandGeometry | undefined): number {
  if (!geometry) return 0;
  return Object.values(geometry.fingers).filter((finger) => finger.extended).length;
}
