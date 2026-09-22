/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HandPoint {
  x: number;
  y: number;
  z?: number;
}

export type GestureState = 'OPEN_HAND' | 'CLOSED_FIST' | 'UNKNOWN';

export interface PalmData {
  present: boolean;
  gestureState: GestureState;
  center: HandPoint;
  wrist: HandPoint;
  indexMcp: HandPoint;
  pinkyMcp: HandPoint;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface DualPalmState {
  leftPalm: PalmData | null;
  rightPalm: PalmData | null;
  distancePx: number;
  distanceNormalized: number; // 0 to 1 scale
  distanceCm: number; // Estimated calibrated distance in cm
  angleDegrees: number;
  timestampMs: number;
}

export type TempoPreset = 'Largo' | 'Andante' | 'Allegro' | 'Presto' | 'Custom';

export type CueType = 'crescendo' | 'decrescendo' | 'staccato' | 'fermata' | 'sforzando' | 'hold';

export interface ScoreCue {
  id: string;
  type: CueType;
  title: string;
  description: string;
  targetDistanceCm: number; // Target distance in cm (e.g. 15 to 90 cm)
  toleranceMarginCm: number; // e.g. ±5 cm
  durationBeats: number;
  startBeat: number;
  accentNote?: string;
  expectedSpeedCmPerSec?: number;
}

export interface ReactionAttempt {
  cueId: string;
  cueType: CueType;
  targetDistanceCm: number;
  actualDistanceCm: number;
  reactionTimeMs: number; // Latency from cue trigger to start of movement
  targetHitTimeMs: number; // Time from cue trigger until target range reached
  precisionAccuracy: number; // 0% to 100%
  beatDriftMs: number; // Timing error relative to exact beat pulse (+ or - ms)
  timestamp: number;
}

export interface SessionStats {
  totalCues: number;
  completedCues: number;
  avgReactionTimeMs: number;
  bestReactionTimeMs: number;
  avgPrecisionAccuracy: number;
  avgBeatDriftMs: number;
  staccatoResponseMs: number;
  fermataStabilityScore: number;
  totalScore: number;
  streak: number;
  attempts: ReactionAttempt[];
  conductorGrade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export type TrainingMode = 'free_practice' | 'partitura_score' | 'sforzando_reflex' | 'fermata_stability' | 'module1_practice' | 'module1_challenge' | 'module2_pentagram' | 'module2_gallery';

export interface MusicalFigure {
  id: string;
  name: string;
  type: 'note' | 'rest';
  symbol: string;
  durationBeats: number;
  durationSeconds: number;
  targetDistanceMinCm: number;
  targetDistanceMaxCm: number;
  targetDistanceIdealCm: number;
  description: string;
  color: string;
}

export interface PentagramNoteItem {
  id: string;
  noteName: 'Do4' | 'Re4' | 'Mi4' | 'Fa4' | 'Sol4' | 'La4' | 'Si4' | 'Do5';
  spanishNote: string;
  frequency: number; // Hz
  staffLineIndex: number; // 0 to 7
  figureName: 'Redonda' | 'Blanca' | 'Negra' | 'Corchea';
  figureSymbol: string;
  durationBeats: number;
  targetDistanceCm: number;
  targetHeightYNorm: number; // 0.1 (high pitch C5) to 0.85 (low pitch C4)
}

export interface GalleryItem {
  id: string;
  title: string;
  composerOrType: string;
  category: 'escala' | 'cancion';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  bpm: number;
  notes: PentagramNoteItem[];
}

export interface ModuleInfo {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  active: boolean;
  iconName: string;
}

export type AppTheme = 'white' | 'dark_cyan';

export type TrackingModeType = 'hands' | 'colored_balls';

export interface ScaleNote {
  id: string;
  name: string; // e.g. 'DO', 'RE', 'MI', etc.
  octaveName: string; // e.g. 'Do4', 'Sol4', 'Do5'
  frequency: number; // in Hz
  pitchIndex: number; // 0 (lowest, Do4) to 7 (highest, Do5)
  staffLineIndex: number; // 0 for Do4 ledger line, 1 for Re4, etc.
  isLedgerLine?: boolean;
}

export type MusicalFigureId = 'semicorchea' | 'corchea' | 'negra' | 'blanca' | 'redonda';

export interface FigureDuration {
  id: MusicalFigureId;
  name: string;
  symbol: string;
  beats: number;
  fractionStr: string;
  defaultMinCm: number;
  defaultMaxCm: number;
  description: string;
}

export interface ColorMarkerConfig {
  color1Hex: string;
  color2Hex: string;
  color1Label: string;
  color2Label: string;
  tolerance: number; // Euclidean RGB tolerance (20 - 90)
}

export interface RangeCalibration {
  yMin: number; // Top boundary (high pitch Do5, e.g. 0.20)
  yMax: number; // Bottom boundary (low pitch Do4, e.g. 0.80)
  sepMinCm: number; // Minimum separation in cm (Semicorchea, e.g. 12)
  sepMaxCm: number; // Maximum separation in cm (Redonda, e.g. 80)
}

export interface TrackingDiagnostics {
  fps: number;
  jitterPx: number;
  confidence: number;
  marker1Present: boolean;
  marker2Present: boolean;
}
