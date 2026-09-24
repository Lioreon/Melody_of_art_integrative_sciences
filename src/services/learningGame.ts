export type LearningGameArea = 'rhythm' | 'pentagram';

export interface LearningScoreBreakdown {
  rhythm: number;
  pentagram: number;
}

export const RANKING_UNLOCK_POINTS = 300;

export const EMPTY_LEARNING_SCORE: LearningScoreBreakdown = {
  rhythm: 0,
  pentagram: 0,
};

export function totalLearningPoints(score: LearningScoreBreakdown): number {
  return score.rhythm + score.pentagram;
}

export function addLearningPoints(
  score: LearningScoreBreakdown,
  area: LearningGameArea,
  points: number,
): LearningScoreBreakdown {
  const safePoints = Math.max(0, Math.trunc(points));
  return {
    ...score,
    [area]: score[area] + safePoints,
  };
}

export function isRankingUnlocked(score: LearningScoreBreakdown): boolean {
  return totalLearningPoints(score) >= RANKING_UNLOCK_POINTS;
}

export function rhythmGameAward(level: 0 | 1 | 2, isSequenceComplete: boolean): number {
  if (level === 0) return 0;
  if (level === 1) return 25;
  return 30 + (isSequenceComplete ? 60 : 0);
}

export function pentagramGameAward(kind: 'note' | 'piece'): number {
  return kind === 'note' ? 30 : 100;
}
