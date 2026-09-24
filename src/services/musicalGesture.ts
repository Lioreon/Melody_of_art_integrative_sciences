import type {
  BimanualMusicalMode,
  DualPalmState,
  MusicalAccidental,
  MusicalFigure,
} from '../types';

export interface BimanualMusicalInterpretation {
  mode: BimanualMusicalMode;
  accidental: MusicalAccidental;
  supportsHandShape: boolean;
  label: string;
  description: string;
}

export function supportsHandShapeTracking(state: DualPalmState): boolean {
  return Boolean(
    state.leftPalm?.landmarks?.length === 21
    && state.rightPalm?.landmarks?.length === 21,
  );
}

/**
 * Interprets the two tracked hand-shape states as a musical modifier.
 *
 * IMPORTANT: "left" and "right" currently refer to Melody Motion's spatial
 * slots (screen-left / screen-right), not stable anatomical identities.
 * T5 will add persistent identity. This keeps the current architecture
 * backward-compatible while making the rule explicit.
 */
export function interpretBimanualMusicalGesture(
  state: DualPalmState,
): BimanualMusicalInterpretation {
  const left = state.leftPalm;
  const right = state.rightPalm;
  const bothPresent = Boolean(left?.present && right?.present);
  const supportsShape = supportsHandShapeTracking(state);

  if (!bothPresent) {
    return {
      mode: 'unknown',
      accidental: 'natural',
      supportsHandShape: supportsShape,
      label: 'Seguimiento incompleto',
      description: 'Muestra ambas manos para interpretar la forma gestual.',
    };
  }

  // Color markers and simulation do not have finger landmarks. Preserve their
  // position-only behavior as natural sound instead of making them unusable.
  if (!supportsShape) {
    return {
      mode: 'sound',
      accidental: 'natural',
      supportsHandShape: false,
      label: 'Sonido natural',
      description: 'Modo posicional: la forma de los dedos no está disponible.',
    };
  }

  const leftState = left?.gestureState ?? 'UNKNOWN';
  const rightState = right?.gestureState ?? 'UNKNOWN';

  if (leftState === 'OPEN_HAND' && rightState === 'OPEN_HAND') {
    return {
      mode: 'sound',
      accidental: 'natural',
      supportsHandShape: true,
      label: 'Natural',
      description: 'Ambas manos abiertas: nota o figura sonora natural.',
    };
  }

  if (leftState === 'CLOSED_FIST' && rightState === 'CLOSED_FIST') {
    return {
      mode: 'rest',
      accidental: 'natural',
      supportsHandShape: true,
      label: 'Silencio',
      description: 'Ambos puños cerrados: silencio equivalente a la duración espacial.',
    };
  }

  if (leftState === 'CLOSED_FIST' && rightState === 'OPEN_HAND') {
    return {
      mode: 'sharp',
      accidental: 'sharp',
      supportsHandShape: true,
      label: 'Sostenido ♯',
      description: 'Slot izquierdo cerrado + slot derecho abierto.',
    };
  }

  if (leftState === 'OPEN_HAND' && rightState === 'CLOSED_FIST') {
    return {
      mode: 'flat',
      accidental: 'flat',
      supportsHandShape: true,
      label: 'Bemol ♭',
      description: 'Slot izquierdo abierto + slot derecho cerrado.',
    };
  }

  return {
    mode: 'unknown',
    accidental: 'natural',
    supportsHandShape: true,
    label: 'Gesto transitorio',
    description: 'La forma de las manos aún no es estable o concluyente.',
  };
}

export function applyAccidentalToFrequency(
  frequency: number,
  accidental: MusicalAccidental,
): number {
  if (accidental === 'sharp') return frequency * Math.pow(2, 1 / 12);
  if (accidental === 'flat') return frequency * Math.pow(2, -1 / 12);
  return frequency;
}

export function accidentalSymbol(accidental: MusicalAccidental): string {
  if (accidental === 'sharp') return '♯';
  if (accidental === 'flat') return '♭';
  return '';
}

export function equivalentRestForFigure(
  noteFigure: MusicalFigure | undefined,
  figures: MusicalFigure[],
): MusicalFigure | undefined {
  if (!noteFigure) return undefined;
  return figures.find(
    (figure) =>
      figure.type === 'rest'
      && figure.durationBeats === noteFigure.durationBeats,
  );
}

export function equivalentNoteForRest(
  restFigure: MusicalFigure | undefined,
  figures: MusicalFigure[],
): MusicalFigure | undefined {
  if (!restFigure) return undefined;
  return figures.find(
    (figure) =>
      figure.type === 'note'
      && figure.durationBeats === restFigure.durationBeats,
  );
}
