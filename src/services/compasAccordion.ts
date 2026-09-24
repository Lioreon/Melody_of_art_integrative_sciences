import type { MusicalFigure } from '../types';

export interface CompasPatternDefinition {
  id: string;
  title: string;
  description: string;
  timeSignature: '4/4';
  defaultBpm: number;
  figureIds: string[];
}

export interface CompasTimelineStep {
  figure: MusicalFigure;
  startBeat: number;
  endBeat: number;
  durationBeats: number;
}

export interface CompasFrame {
  complete: boolean;
  currentIndex: number;
  currentStep: CompasTimelineStep;
  nextStep: CompasTimelineStep | null;
  totalBeats: number;
  elapsedBeats: number;
  stepProgress: number;
  patternProgress: number;
}

export const COMPAS_PATTERNS: CompasPatternDefinition[] = [
  {
    id: 'pulso_base',
    title: 'Pulso base',
    description: 'Negra · Negra · Blanca. Una frase completa de 4 tiempos.',
    timeSignature: '4/4',
    defaultBpm: 72,
    figureIds: ['negra', 'negra', 'blanca'],
  },
  {
    id: 'respuesta_binaria',
    title: 'Respuesta binaria',
    description: 'Blanca · Negra · Negra. Cambia de apertura larga a dos pulsos breves.',
    timeSignature: '4/4',
    defaultBpm: 76,
    figureIds: ['blanca', 'negra', 'negra'],
  },
  {
    id: 'movimiento_mixto',
    title: 'Movimiento mixto',
    description: 'Negra · Corchea · Corchea · Blanca. Introduce una subdivisión dentro del compás.',
    timeSignature: '4/4',
    defaultBpm: 68,
    figureIds: ['negra', 'corchea', 'corchea', 'blanca'],
  },
];

export function buildCompasTimeline(
  pattern: CompasPatternDefinition,
  figures: MusicalFigure[],
): CompasTimelineStep[] {
  const noteFigures = new Map(
    figures
      .filter((figure) => figure.type === 'note')
      .map((figure) => [figure.id, figure] as const),
  );

  let beatCursor = 0;
  return pattern.figureIds.map((id) => {
    const figure = noteFigures.get(id);
    if (!figure) throw new Error(`Missing compás figure: ${id}`);
    const startBeat = beatCursor;
    const endBeat = startBeat + figure.durationBeats;
    beatCursor = endBeat;
    return {
      figure,
      startBeat,
      endBeat,
      durationBeats: figure.durationBeats,
    };
  });
}

export function totalCompasBeats(timeline: CompasTimelineStep[]): number {
  return timeline.length ? timeline[timeline.length - 1].endBeat : 0;
}

export function beatDurationMs(bpm: number): number {
  const safeBpm = Math.max(40, Math.min(200, bpm));
  return 60_000 / safeBpm;
}

export function getCompasFrame(
  timeline: CompasTimelineStep[],
  elapsedBeats: number,
): CompasFrame {
  if (timeline.length === 0) {
    throw new Error('Compás timeline cannot be empty');
  }

  const totalBeats = totalCompasBeats(timeline);
  const safeElapsed = Math.max(0, Math.min(totalBeats, elapsedBeats));
  const complete = safeElapsed >= totalBeats;

  let currentIndex = timeline.length - 1;
  if (!complete) {
    const found = timeline.findIndex((step) => safeElapsed < step.endBeat);
    currentIndex = found === -1 ? timeline.length - 1 : found;
  }

  const currentStep = timeline[currentIndex];
  const nextStep = currentIndex < timeline.length - 1 ? timeline[currentIndex + 1] : null;
  const localElapsed = Math.max(0, Math.min(
    currentStep.durationBeats,
    safeElapsed - currentStep.startBeat,
  ));

  return {
    complete,
    currentIndex,
    currentStep,
    nextStep,
    totalBeats,
    elapsedBeats: safeElapsed,
    stepProgress: currentStep.durationBeats > 0
      ? localElapsed / currentStep.durationBeats
      : 1,
    patternProgress: totalBeats > 0 ? safeElapsed / totalBeats : 1,
  };
}

export function compasGuidance(
  target: MusicalFigure,
  detected: MusicalFigure | undefined,
  hasTracking: boolean,
  distanceCm: number,
): { status: 'tracking-paused' | 'aligned' | 'adjust'; feedback: string } {
  if (!hasTracking) {
    return {
      status: 'tracking-paused',
      feedback: 'Seguimiento pausado. El compás espera hasta recuperar ambas manos.',
    };
  }

  if (!detected) {
    return {
      status: 'adjust',
      feedback: 'Ajusta la apertura hasta entrar en una figura reconocible.',
    };
  }

  const inRange = distanceCm >= target.targetDistanceMinCm
    && distanceCm <= target.targetDistanceMaxCm;

  if (detected.id === target.id && inRange) {
    return {
      status: 'aligned',
      feedback: 'Alineado. Mantén esta apertura mientras avanza la figura.',
    };
  }

  return {
    status: 'adjust',
    feedback: distanceCm < target.targetDistanceMinCm
      ? 'Abre un poco más las manos.'
      : 'Cierra un poco más las manos.',
  };
}
