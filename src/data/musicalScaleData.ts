/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FigureDuration, ScaleNote } from '../types';

// Escala de Do Mayor (1 Octava: Do4 a Do5)
// Ordenadas de grave (abajo en el espacio físico, mayor Y en coordenadas de pantalla)
// a agudo (arriba en el espacio físico, menor Y en coordenadas de pantalla).
export const C_MAJOR_SCALE: ScaleNote[] = [
  {
    id: 'do4',
    name: 'DO',
    octaveName: 'Do 4',
    frequency: 261.63,
    pitchIndex: 0,
    staffLineIndex: 0, // Primera línea adicional inferior
    isLedgerLine: true,
  },
  {
    id: 're4',
    name: 'RE',
    octaveName: 'Re 4',
    frequency: 293.66,
    pitchIndex: 1,
    staffLineIndex: 1, // Espacio inferior bajo la primera línea
    isLedgerLine: false,
  },
  {
    id: 'mi4',
    name: 'MI',
    octaveName: 'Mi 4',
    frequency: 329.63,
    pitchIndex: 2,
    staffLineIndex: 2, // Primera línea del pentagrama
    isLedgerLine: false,
  },
  {
    id: 'fa4',
    name: 'FA',
    octaveName: 'Fa 4',
    frequency: 349.23,
    pitchIndex: 3,
    staffLineIndex: 3, // Primer espacio
    isLedgerLine: false,
  },
  {
    id: 'sol4',
    name: 'SOL',
    octaveName: 'Sol 4',
    frequency: 392.00,
    pitchIndex: 4,
    staffLineIndex: 4, // Segunda línea
    isLedgerLine: false,
  },
  {
    id: 'la4',
    name: 'LA',
    octaveName: 'La 4',
    frequency: 440.00,
    pitchIndex: 5,
    staffLineIndex: 5, // Segundo espacio
    isLedgerLine: false,
  },
  {
    id: 'si4',
    name: 'SI',
    octaveName: 'Si 4',
    frequency: 493.88,
    pitchIndex: 6,
    staffLineIndex: 6, // Tercera línea
    isLedgerLine: false,
  },
  {
    id: 'do5',
    name: 'DO 5',
    octaveName: 'Do 5',
    frequency: 523.25,
    pitchIndex: 7,
    staffLineIndex: 7, // Tercer espacio
    isLedgerLine: false,
  },
];

// Figuras musicales seleccionadas por la separación entre las manos
// Menor separación -> figuras cortas; Mayor separación -> figuras largas
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
 * Calcula la duración real de la figura en segundos según el tempo en BPM
 * En un compás de 4/4:
 * 1 pulso (Negra) = 60 / BPM segundos
 */
export function calculateRealDurationSec(beats: number, bpm: number): number {
  const safeBpm = Math.max(30, Math.min(240, bpm));
  const beatDurationSec = 60 / safeBpm;
  return Number((beats * beatDurationSec).toFixed(3));
}

/**
 * Mapea la altura promedio de las manos al tono de la escala con histéresis anti-temblores.
 * En pantalla:
 * yNorm = 0 es la parte superior (arriba en el mundo físico = sonido agudo Do5)
 * yNorm = 1 es la parte inferior (abajo en el mundo físico = sonido grave Do4)
 */
export function mapHeightToNote(
  avgYNorm: number,
  yMin: number = 0.20,
  yMax: number = 0.80,
  currentNoteId?: string
): ScaleNote {
  // Rango normalizado invertido: 0 = abajo (grave), 1 = arriba (agudo)
  const clampedY = Math.max(yMin, Math.min(yMax, avgYNorm));
  const pitchFraction = (yMax - clampedY) / (yMax - yMin); // 0 (grave/abajo) a 1 (agudo/arriba)

  const numNotes = C_MAJOR_SCALE.length; // 8
  const rawIndex = pitchFraction * (numNotes - 1);

  // Si ya tenemos una nota actual, aplicamos un margen de histéresis de ±0.15 notas
  // para evitar saltos y vibraciones en los bordes
  if (currentNoteId) {
    const currentIndex = C_MAJOR_SCALE.findIndex((n) => n.id === currentNoteId);
    if (currentIndex !== -1) {
      const diff = rawIndex - currentIndex;
      if (Math.abs(diff) < 0.60) {
        return C_MAJOR_SCALE[currentIndex];
      }
    }
  }

  const noteIndex = Math.max(0, Math.min(numNotes - 1, Math.round(rawIndex)));
  return C_MAJOR_SCALE[noteIndex];
}

/**
 * Mapea la separación entre las dos manos a una figura musical con histéresis anti-temblores.
 */
export function mapSeparationToFigure(
  separationCm: number,
  sepMinCm: number = 15,
  sepMaxCm: number = 85,
  currentFigureId?: string
): FigureDuration {
  const clampedSep = Math.max(sepMinCm, Math.min(sepMaxCm, separationCm));
  const sepFraction = (clampedSep - sepMinCm) / (sepMaxCm - sepMinCm); // 0 (juntas) a 1 (separadas)

  const numFigures = MUSICAL_FIGURES.length; // 5
  const rawIndex = sepFraction * (numFigures - 1);

  // Histéresis para estabilidad
  if (currentFigureId) {
    const currentIndex = MUSICAL_FIGURES.findIndex((f) => f.id === currentFigureId);
    if (currentIndex !== -1) {
      const diff = rawIndex - currentIndex;
      if (Math.abs(diff) < 0.60) {
        return MUSICAL_FIGURES[currentIndex];
      }
    }
  }

  const figIndex = Math.max(0, Math.min(numFigures - 1, Math.round(rawIndex)));
  return MUSICAL_FIGURES[figIndex];
}
