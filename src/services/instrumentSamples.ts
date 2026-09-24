/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * External instrument samples are loaded on demand from pinned public
 * repositories. See docs/AUDIO_SOURCES.md for provenance and licenses.
 */

export type SampledInstrumentId = 'piano' | 'guitar' | 'violin' | 'violin_pizzicato';
export type InstrumentTimbre = 'synth' | SampledInstrumentId;

export interface InstrumentTimbreOption {
  id: InstrumentTimbre;
  label: string;
  description: string;
  sourceLabel?: string;
}

export interface InstrumentSampleAnchor {
  instrument: SampledInstrumentId;
  note: string;
  frequency: number;
  url: string;
}

const TONEJS_INSTRUMENTS_COMMIT = '622c2f1c32c8cfce4158ddc3eb26e518ddef37e5';
const TONEJS_SAMPLE_ROOT =
  `https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/${TONEJS_INSTRUMENTS_COMMIT}/samples`;

const SSO_COMMIT = '32bbdb169aef636b8216029a2e056424ba7c2abb';
const SSO_PIZZICATO_ROOT =
  `https://raw.githubusercontent.com/peastman/sso/${SSO_COMMIT}/Sonatina%20Symphonic%20Orchestra/Samples/Violin%202`;

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
    sourceLabel: 'tonejs-instruments · CC BY 3.0',
  },
  {
    id: 'guitar',
    label: 'Guitarra nylon',
    description: 'Muestras de guitarra clásica cargadas bajo demanda.',
    sourceLabel: 'tonejs-instruments · CC BY 3.0',
  },
  {
    id: 'violin',
    label: 'Violín · arco',
    description: 'Violín sostenido con arco, cargado bajo demanda.',
    sourceLabel: 'tonejs-instruments · CC BY 3.0',
  },
  {
    id: 'violin_pizzicato',
    label: 'Violín · pizzicato',
    description: 'Violín pulsado con los dedos, cargado bajo demanda.',
    sourceLabel: 'Sonatina Symphonic Orchestra · CC Sampling Plus 1.0',
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

function toneAnchor(
  instrument: Exclude<SampledInstrumentId, 'violin_pizzicato'>,
  folder: string,
  note: string,
): InstrumentSampleAnchor {
  return {
    instrument,
    note,
    frequency: midiToFrequency(noteNameToMidi(note)),
    url: `${TONEJS_SAMPLE_ROOT}/${folder}/${note}.mp3`,
  };
}

function pizzicatoAnchor(note: string, fileStem: string): InstrumentSampleAnchor {
  return {
    instrument: 'violin_pizzicato',
    note,
    frequency: midiToFrequency(noteNameToMidi(note)),
    url: `${SSO_PIZZICATO_ROOT}/violin_pizz_non_vib_${fileStem.toLowerCase()}.wav`,
  };
}

// Sparse anchor sets keep initial/network cost low. Playback-rate transposition
// fills positions between anchors. The pizzicato mapping follows the pitch
// centers declared in SSO's "Violin Solo 1 Pizzicato.sfz".
export const SAMPLE_ANCHORS: Record<SampledInstrumentId, InstrumentSampleAnchor[]> = {
  piano: ['G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'B5'].map((note) =>
    toneAnchor('piano', 'piano', note),
  ),
  guitar: ['G3', 'Cs4', 'E4', 'A4', 'D5', 'Fs5', 'A5', 'As5'].map((note) =>
    toneAnchor('guitar', 'guitar-nylon', note),
  ),
  violin: ['G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'A5', 'C6'].map((note) =>
    toneAnchor('violin', 'violin', note),
  ),
  violin_pizzicato: [
    pizzicatoAnchor('G3', 'G2'),
    pizzicatoAnchor('C4', 'C3'),
    pizzicatoAnchor('E4', 'E3'),
    pizzicatoAnchor('G4', 'G3'),
    pizzicatoAnchor('C5', 'C4'),
    pizzicatoAnchor('E5', 'E4'),
    pizzicatoAnchor('G5', 'G4'),
    pizzicatoAnchor('B5', 'B4'),
  ],
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
  tonejs: {
    repository: 'nbrosowsky/tonejs-instruments',
    commit: TONEJS_INSTRUMENTS_COMMIT,
    sampleLicense: 'CC BY 3.0',
    codeLicense: 'MIT',
  },
  sonatinaPizzicato: {
    repository: 'peastman/sso',
    commit: SSO_COMMIT,
    sampleLicense: 'Creative Commons Sampling Plus 1.0',
    articulation: 'Solo Violin 1 Pizzicato (non-vibrato sample layer)',
  },
} as const;
