/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FigureDuration, ScaleNote } from '../types';

// Registro diatónico extendido para clave de Sol.
// Cubre desde Sol3 (debajo del pentagrama) hasta Si5 (encima del pentagrama).
// staffLineIndex usa pasos diatónicos relativos a Do4:
// Do4 = 0, Mi4 = 2 (primera línea), Fa5 = 10 (quinta línea).
export const TREBLE_TRAINING_RANGE: ScaleNote[] = [
  { id: 'sol3', name: 'SOL', octaveName: 'Sol 3', frequency: 196.00, pitchIndex: 0, staffLineIndex: -3, isLedgerLine: true },
  { id: 'la3', name: 'LA', octaveName: 'La 3', frequency: 220.00, pitchIndex: 1, staffLineIndex: -2, isLedgerLine: true },
  { id: 'si3', name: 'SI', octaveName: 'Si 3', frequency: 246.94, pitchIndex: 2, staffLineIndex: -1, isLedgerLine: true },
  { id: 'do4', name: 'DO', octaveName: 'Do 4', frequency: 261.63, pitchIndex: 3, staffLineIndex: 0, isLedgerLine: true },
  { id: 're4', name: 'RE', octaveName: 'Re 4', frequency: 293.66, pitchIndex: 4, staffLineIndex: 1, isLedgerLine: false },
  { id: 'mi4', name: 'MI', octaveName: 'Mi 4', frequency: 329.63, pitchIndex: 5, staffLineIndex: 2, isLedgerLine: false },
  { id: 'fa4', name: 'FA', octaveName: 'Fa 4', frequency: 349.23, pitchIndex: 6, staffLineIndex: 3, isLedgerLine: false },
  { id: 'sol4', name: 'SOL', octaveName: 'Sol 4', frequency: 392.00, pitchIndex: 7, staffLineIndex: 4, isLedgerLine: false },
  { id: 'la4', name: 'LA', octaveName: 'La 4', frequency: 440.00, pitchIndex: 8, staffLineIndex: 5, isLedgerLine: false },
  { id: 'si4', name: 'SI', octaveName: 'Si 4', frequency: 493.88, pitchIndex: 9, staffLineIndex: 6, isLedgerLine: false },
  { id: 'do5', name: 'DO', octaveName: 'Do 5', frequency: 523.25, pitchIndex: 10, staffLineIndex: 7, isLedgerLine: false },
  { id: 're5', name: 'RE', octaveName: 'Re 5', frequency: 587.33, pitchIndex: 11, staffLineIndex: 8, isLedgerLine: false },
  { id: 'mi5', name: 'MI', octaveName: 'Mi 5', frequency: 659.25, pitchIndex: 12, staffLineIndex: 9, isLedgerLine: false },
  { id: 'fa5', name: 'FA', octaveName: 'Fa 5', frequency: 698.46, pitchIndex: 13, staffLineIndex: 10, isLedgerLine: false },
  { id: 'sol5', name: 'SOL', octaveName: 'Sol 5', frequency: 783.99, pitchIndex: 14, staffLineIndex: 11, isLedgerLine: false },
  { id: 'la5', name: 'LA', octaveName: 'La 5', frequency: 880.00, pitchIndex: 15, staffLineIndex: 12, isLedgerLine: true },
  { id: 'si5', name: 'SI', octaveName: 'Si 5', frequency: 987.77, pitchIndex: 16, staffLineIndex: 13, isLedgerLine: true },
];

// Escala de Do Mayor histórica del prototipo, conservada para ejercicios de una octava.
export const C_MAJOR_SCALE: ScaleNote[] = TREBLE_TRAINING_RANGE
  .filter((note) => note.staffLineIndex >= 0 && note.staffLineIndex <= 7)
  .map((note, index) => ({ ...note, pitchIndex: index }));

export const DEFAULT_PITCH_Y_MIN = 0.08;
export const DEFAULT_PITCH_Y_MAX = 0.92;

/**
 * Devuelve la altura corporal objetivo de una nota dentro del registro extendido.
 * y=0 es la parte superior del fotograma; y=1 la parte inferior.
 */
export function noteHeightForId(
  noteId: string,
  yMin: number = DEFAULT_PITCH_Y_MIN,
  yMax: number = DEFAULT_PITCH_Y_MAX,
): number {
  const index = TREBLE_TRAINING_RANGE.findIndex((note) => note.id === noteId.toLowerCase());
  if (index < 0 || yMax <= yMin) return (yMin + yMax) / 2;
  const fraction = index / (TREBLE_TRAINING_RANGE.length - 1);
  return yMax - fraction * (yMax - yMin);
}

/**
 * Líneas adicionales necesarias para representar una nota fuera del pentagrama.
 * Los pasos 2..10 corresponden a Mi4..Fa5, las cinco líneas normales.
 */
export function ledgerLineStepsForStaffStep(staffStep: number): number[] {
  const lines: number[] = [];
  if (staffStep < 1) {
    for (let step = 0; step >= staffStep; step -= 2) lines.push(step);
  } else if (staffStep > 11) {
    for (let step = 12; step <= staffStep; step += 2) lines.push(step);
  }
  return lines;
}

// Figuras musicales seleccionadas por la separación entre las manos.
// Menor separación -> figuras cortas; mayor separación -> figuras largas.
export const MUSICAL_FIGURES: FigureDuration[] = [
  {
    id: 'semicorchea',
    name: 'Semicorchea',
    symbol: '𝅘𝅥𝅯',
    beats: 0.25,
    fractionStr: '1/16',
    defaultMinCm: 10,
    defaultMaxCm: 25,
    description: 'Separación mínima · Muy rápida',
  },
  {
    id: 'corchea',
    name: 'Corchea',
    symbol: '♪',
    beats: 0.5,
    fractionStr: '1/8',
    defaultMinCm: 25,
    defaultMaxCm: 40,
    description: 'Separación corta · Medio pulso',
  },
  {
    id: 'negra',
    name: 'Negra',
    symbol: '♩',
    beats: 1.0,
    fractionStr: '1/4',
    defaultMinCm: 40,
    defaultMaxCm: 60,
    description: 'Separación media · 1 pulso de compás',
  },
  {
    id: 'blanca',
    name: 'Blanca',
    symbol: '𝅗𝅥',
    beats: 2.0,
    fractionStr: '1/2',
    defaultMinCm: 60,
    defaultMaxCm: 78,
    description: 'Separación amplia · 2 pulsos',
  },
  {
    id: 'redonda',
    name: 'Redonda',
    symbol: '𝅝',
    beats: 4.0,
    fractionStr: '1',
    defaultMinCm: 78,
    defaultMaxCm: 105,
    description: 'Separación máxima · 4 pulsos enteros',
  },
];

/**
 * Calcula la duración real de la figura en segundos según el tempo en BPM.
 * En un compás de 4/4, una negra = 60 / BPM segundos.
 */
export function calculateRealDurationSec(beats: number, bpm: number): number {
  const safeBpm = Math.max(30, Math.min(240, bpm));
  const beatDurationSec = 60 / safeBpm;
  return Number((beats * beatDurationSec).toFixed(3));
}

/**
 * Mapea la altura promedio de las dos manos al registro Sol3–Si5.
 * La altura se obtiene del centro vertical del par de manos y es independiente
 * de la apertura horizontal, que conserva su función rítmica.
 */
export function mapHeightToNote(
  avgYNorm: number,
  yMin: number = DEFAULT_PITCH_Y_MIN,
  yMax: number = DEFAULT_PITCH_Y_MAX,
  currentNoteId?: string,
): ScaleNote {
  const safeMin = Math.min(yMin, yMax - 0.01);
  const safeMax = Math.max(yMax, safeMin + 0.01);
  const clampedY = Math.max(safeMin, Math.min(safeMax, avgYNorm));
  const pitchFraction = (safeMax - clampedY) / (safeMax - safeMin);

  const numNotes = TREBLE_TRAINING_RANGE.length;
  const rawIndex = pitchFraction * (numNotes - 1);

  // Histéresis de ±0.60 pasos para evitar oscilación en fronteras.
  if (currentNoteId) {
    const currentIndex = TREBLE_TRAINING_RANGE.findIndex((note) => note.id === currentNoteId.toLowerCase());
    if (currentIndex !== -1 && Math.abs(rawIndex - currentIndex) < 0.60) {
      return TREBLE_TRAINING_RANGE[currentIndex];
    }
  }

  const noteIndex = Math.max(0, Math.min(numNotes - 1, Math.round(rawIndex)));
  return TREBLE_TRAINING_RANGE[noteIndex];
}

/**
 * Mapea la separación horizontal entre las dos manos a una figura musical.
 */
export function mapSeparationToFigure(
  separationCm: number,
  sepMinCm: number = 15,
  sepMaxCm: number = 85,
  currentFigureId?: string,
): FigureDuration {
  const clampedSep = Math.max(sepMinCm, Math.min(sepMaxCm, separationCm));
  const sepFraction = (clampedSep - sepMinCm) / (sepMaxCm - sepMinCm);

  const numFigures = MUSICAL_FIGURES.length;
  const rawIndex = sepFraction * (numFigures - 1);

  if (currentFigureId) {
    const currentIndex = MUSICAL_FIGURES.findIndex((figure) => figure.id === currentFigureId);
    if (currentIndex !== -1 && Math.abs(rawIndex - currentIndex) < 0.60) {
      return MUSICAL_FIGURES[currentIndex];
    }
  }

  const figIndex = Math.max(0, Math.min(numFigures - 1, Math.round(rawIndex)));
  return MUSICAL_FIGURES[figIndex];
}

/**
 * Coordenadas musicales corporales en dos ejes:
 * - eje Y del centro de las manos -> nota;
 * - diámetro/apertura horizontal -> figura/duración.
 *
 * Los ejes son deliberadamente ortogonales: abrir las manos no cambia la nota,
 * y subir/bajar ambas manos sin cambiar su apertura no cambia la figura.
 */
export function mapBodyToMusic(
  avgYNorm: number,
  separationCm: number,
  range: { yMin?: number; yMax?: number; sepMinCm?: number; sepMaxCm?: number } = {},
  current?: { noteId?: string; figureId?: string },
) {
  return {
    note: mapHeightToNote(
      avgYNorm,
      range.yMin ?? DEFAULT_PITCH_Y_MIN,
      range.yMax ?? DEFAULT_PITCH_Y_MAX,
      current?.noteId,
    ),
    figure: mapSeparationToFigure(
      separationCm,
      range.sepMinCm ?? 15,
      range.sepMaxCm ?? 85,
      current?.figureId,
    ),
  };
}
