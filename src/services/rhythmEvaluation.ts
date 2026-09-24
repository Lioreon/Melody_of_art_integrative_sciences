import type { MusicalFigure } from '../types';

export type RhythmEvaluationStatus = 'explore' | 'tracking-paused' | 'correct' | 'incorrect';
export type RhythmDifficulty = 'initial' | 'intermediate' | 'full';

export interface RhythmEvaluation {
  status: RhythmEvaluationStatus;
  feedback: string;
}

export interface RhythmPick {
  figure: MusicalFigure;
  nextSeed: number;
}

export interface RhythmSequencePlan {
  figures: MusicalFigure[];
  nextSeed: number;
}

const DIFFICULTY_IDS: Record<RhythmDifficulty, string[]> = {
  initial: ['negra', 'blanca'],
  intermediate: ['corchea', 'negra', 'blanca'],
  full: ['corchea', 'negra', 'blanca', 'redonda'],
};

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

  if (
    inTargetRange
    && detected.durationBeats === target.durationBeats
    && detected.type !== target.type
  ) {
    return {
      status: 'incorrect',
      feedback: target.type === 'rest'
        ? 'Mantén la misma distancia y cierra ambos puños para convertirla en silencio.'
        : 'Mantén la misma distancia y abre ambas manos para convertirla en figura sonora.',
    };
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

export function getRhythmVocabulary(
  figures: MusicalFigure[],
  difficulty: RhythmDifficulty,
): MusicalFigure[] {
  const allowed = new Set(DIFFICULTY_IDS[difficulty]);
  const vocabulary = figures.filter((figure) => figure.type === 'note' && allowed.has(figure.id));
  if (vocabulary.length === 0) {
    throw new Error(`No rhythm figures available for difficulty: ${difficulty}`);
  }
  return vocabulary;
}


export function getRhythmSoundSilenceVocabulary(
  figures: MusicalFigure[],
  difficulty: RhythmDifficulty,
): MusicalFigure[] {
  const noteVocabulary = getRhythmVocabulary(figures, difficulty);
  const durations = new Set(noteVocabulary.map((figure) => figure.durationBeats));
  const rests = figures.filter(
    (figure) => figure.type === 'rest' && durations.has(figure.durationBeats),
  );
  return [...noteVocabulary, ...rests];
}

function nextRandom(seed: number): { value: number; nextSeed: number } {
  // LCG determinista: suficiente para generar retos reproducibles, no para criptografía.
  const normalizedSeed = Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 1;
  const nextSeed = (Math.imul(normalizedSeed || 1, 1664525) + 1013904223) >>> 0;
  return { value: nextSeed / 0x100000000, nextSeed };
}

export function pickRhythmTarget(
  figures: MusicalFigure[],
  difficulty: RhythmDifficulty,
  seed: number,
  avoidId?: string,
): RhythmPick {
  const vocabulary = getRhythmVocabulary(figures, difficulty);
  const filtered = vocabulary.length > 1 && avoidId
    ? vocabulary.filter((figure) => figure.id !== avoidId)
    : vocabulary;
  const random = nextRandom(seed);
  const index = Math.min(filtered.length - 1, Math.floor(random.value * filtered.length));
  return { figure: filtered[index], nextSeed: random.nextSeed };
}


export function pickRhythmSoundSilenceTarget(
  figures: MusicalFigure[],
  difficulty: RhythmDifficulty,
  seed: number,
  avoidId?: string,
): RhythmPick {
  const vocabulary = getRhythmSoundSilenceVocabulary(figures, difficulty);
  const filtered = vocabulary.length > 1 && avoidId
    ? vocabulary.filter((figure) => figure.id !== avoidId)
    : vocabulary;
  const random = nextRandom(seed);
  const index = Math.min(filtered.length - 1, Math.floor(random.value * filtered.length));
  return { figure: filtered[index], nextSeed: random.nextSeed };
}

export function sequenceLengthForDifficulty(difficulty: RhythmDifficulty): number {
  if (difficulty === 'initial') return 3;
  if (difficulty === 'intermediate') return 4;
  return 5;
}

export function generateRhythmSequence(
  figures: MusicalFigure[],
  difficulty: RhythmDifficulty,
  length: number,
  seed: number,
): RhythmSequencePlan {
  const safeLength = Math.max(2, Math.min(6, Math.trunc(length)));
  const generated: MusicalFigure[] = [];
  let currentSeed = seed;

  for (let index = 0; index < safeLength; index += 1) {
    const previousId = generated[index - 1]?.id;
    const pick = pickRhythmTarget(figures, difficulty, currentSeed, previousId);
    generated.push(pick.figure);
    currentSeed = pick.nextSeed;
  }

  return { figures: generated, nextSeed: currentSeed };
}
