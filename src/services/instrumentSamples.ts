/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * External instrument samples are loaded on demand from the pinned
 * nbrosowsky/tonejs-instruments repository. The upstream code is MIT and
 * the samples are published as CC BY 3.0. See docs/AUDIO_SOURCES.md.
 */

export type SampledInstrumentId = 'piano' | 'guitar' | 'violin';
export type InstrumentTimbre = 'synth' | SampledInstrumentId;

export interface InstrumentTimbreOption {
  id: InstrumentTimbre;
  label: string;
  description: string;
}

export interface InstrumentSampleAnchor {
  instrument: SampledInstrumentId;
  note: string;
  frequency: number;
  url: string;
}

const TONEJS_INSTRUMENTS_COMMIT = '622c2f1c32c8cfce4158ddc3eb26e518ddef37e5';
const SAMPLE_ROOT =
  `https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/${TONEJS_INSTRUMENTS_COMMIT}/samples`;

export const INSTRUMENT_TIMBRE_OPTIONS: InstrumentTimbreOption[] = [
  {
    id: 'synth',
    label: 'Sintetizador',
    description: 'Timbre interno de Melody Motion. Funciona sin descargar muestras.',
  },
  {
    id: 'piano',
    label: 'Piano',
    description: 'Muestras de piano acústico cargadas bajo demanda.',
  },
  {
    id: 'guitar',
    label: 'Guitarra nylon',
    description: 'Muestras de guitarra clásica cargadas bajo demanda.',
  },
  {
    id: 'violin',
    label: 'Violín',
    description: 'Muestras de violín cargadas bajo demanda.',
  },
];

const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  Cs: 1,
  D: 2,
  Ds: 3,
  E: 4,
  F: 5,
  Fs: 6,
  G: 7,
  Gs: 8,
  A: 9,
  As: 10,
  B: 11,
};

export function noteNameToMidi(note: string): number {
  const match = /^([A-G](?:s)?)(-?\d+)$/.exec(note);
  if (!match) throw new Error(`Unsupported note name: ${note}`);
  const [, pitchClass, octaveText] = match;
  const octave = Number(octaveText);
  const offset = NOTE_OFFSETS[pitchClass];
  if (offset === undefined || !Number.isFinite(octave)) {
    throw new Error(`Unsupported note name: ${note}`);
  }
  return (octave + 1) * 12 + offset;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function anchor(instrument: SampledInstrumentId, folder: string, note: string): InstrumentSampleAnchor {
  return {
    instrument,
    note,
    frequency: midiToFrequency(noteNameToMidi(note)),
    url: `${SAMPLE_ROOT}/${folder}/${note}.mp3`,
  };
}

// Sparse anchor sets keep initial/network cost low. Playback rate fills the
// diatonic positions between anchors. All anchors cover Melody Motion's
// current Sol3–Si5 body register without requiring a full SoundFont.
export const SAMPLE_ANCHORS: Record<SampledInstrumentId, InstrumentSampleAnchor[]> = {
  piano: ['G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'B5'].map((note) =>
    anchor('piano', 'piano', note),
  ),
  guitar: ['G3', 'Cs4', 'E4', 'A4', 'D5', 'Fs5', 'A5', 'As5'].map((note) =>
    anchor('guitar', 'guitar-nylon', note),
  ),
  violin: ['G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'A5', 'C6'].map((note) =>
    anchor('violin', 'violin', note),
  ),
};

export function nearestInstrumentSample(
  instrument: SampledInstrumentId,
  targetFrequency: number,
): InstrumentSampleAnchor {
  const anchors = SAMPLE_ANCHORS[instrument];
  if (!Number.isFinite(targetFrequency) || targetFrequency <= 0) return anchors[0];

  let best = anchors[0];
  let bestDistance = Math.abs(Math.log2(targetFrequency / best.frequency));
  for (const candidate of anchors.slice(1)) {
    const distance = Math.abs(Math.log2(targetFrequency / candidate.frequency));
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export const SAMPLE_SOURCE_INFO = {
  repository: 'nbrosowsky/tonejs-instruments',
  commit: TONEJS_INSTRUMENTS_COMMIT,
  sampleLicense: 'CC BY 3.0',
  codeLicense: 'MIT',
} as const;
