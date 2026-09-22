import type { MusicalFigure } from '../types';

export type RhythmEvaluationStatus = 'explore' | 'tracking-paused' | 'correct' | 'incorrect';

export interface RhythmEvaluation {
  status: RhythmEvaluationStatus;
  feedback: string;
}

export function exploreRhythm(hasTracking = true): RhythmEvaluation {
  return {
    status: 'explore',
    feedback: hasTracking
      ? 'Explora qué ocurre al cambiar la distancia entre tus manos.'
      : 'Muestra ambas manos para comenzar a explorar.',
  };
}

export function evaluateRhythmTarget(
  target: MusicalFigure,
  detected: MusicalFigure | undefined,
  hasTracking: boolean,
  distanceCm: number,
): RhythmEvaluation {
  if (!hasTracking) {
    return { status: 'tracking-paused', feedback: 'Muestra ambas manos para continuar.' };
  }
  if (!detected) {
    return { status: 'incorrect', feedback: 'Separa o acerca las manos hasta encontrar una figura.' };
  }
  const inTargetRange = distanceCm >= target.targetDistanceMinCm
    && distanceCm <= target.targetDistanceMaxCm;
  if (detected.id === target.id && inTargetRange) {
    return { status: 'correct', feedback: 'Correcto. Mantén esa posición.' };
  }
  return {
    status: 'incorrect',
    feedback: distanceCm < target.targetDistanceMinCm
      ? 'Separa las manos un poco más.'
      : 'Acerca las manos un poco más.',
  };
}

export function advanceRhythmSequence(
  sequenceIndex: number,
  evaluation: RhythmEvaluationStatus,
  sequenceLength: number,
): number {
  if (evaluation !== 'correct' || sequenceIndex >= sequenceLength - 1) return sequenceIndex;
  return sequenceIndex + 1;
}
