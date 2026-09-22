import type { MusicalFigureId } from '../types';

export type RhythmLevel = 0 | 1 | 2;

export interface RhythmEvaluation {
  level: RhythmLevel;
  sequence: MusicalFigureId[];
  position: number;
  completed: boolean;
}

const LEVEL_SEQUENCES: Record<RhythmLevel, MusicalFigureId[]> = {
  0: ['negra'],
  1: ['negra', 'blanca'],
  2: ['negra', 'blanca', 'negra'],
};

export function getRhythmSequence(level: RhythmLevel): MusicalFigureId[] {
  return [...LEVEL_SEQUENCES[level]];
}

export function createRhythmEvaluation(level: RhythmLevel): RhythmEvaluation {
  return { level, sequence: getRhythmSequence(level), position: 0, completed: false };
}

export function evaluateRhythmGesture(
  evaluation: RhythmEvaluation,
  gesture: MusicalFigureId | null,
): RhythmEvaluation {
  if (evaluation.completed || gesture !== evaluation.sequence[evaluation.position]) return evaluation;

  const position = evaluation.position + 1;
  return {
    ...evaluation,
    position,
    completed: position === evaluation.sequence.length,
  };
}
