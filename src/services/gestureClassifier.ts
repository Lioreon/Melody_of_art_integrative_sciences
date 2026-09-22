import { MUSICAL_FIGURES } from '../data/scorePresets';
import type { MusicalFigure, MusicalFigureId } from '../types';

const RHYTHM_FIGURE_IDS: MusicalFigureId[] = ['semicorchea', 'corchea', 'negra', 'blanca', 'redonda'];

export function classifyGesture(distanceCm: number): MusicalFigure | null {
  return MUSICAL_FIGURES.find(
    (figure) =>
      figure.type === 'note' &&
      figure.targetDistanceMinCm <= distanceCm &&
      figure.targetDistanceMaxCm >= distanceCm,
  ) ?? null;
}

export function classifyRhythmGesture(distanceCm: number): MusicalFigureId | null {
  const figure = classifyGesture(distanceCm);
  return figure && RHYTHM_FIGURE_IDS.includes(figure.id as MusicalFigureId)
    ? figure.id as MusicalFigureId
    : null;
}
