import { INSTRUMENT_TIMBRE_OPTIONS, type InstrumentTimbre } from './instrumentSamples';

const TIMBRE_KEY = 'melody-motion.instrument-timbre';
const LIVE_SOUND_KEY = 'melody-motion.live-sound-feedback';

const validTimbres = new Set<InstrumentTimbre>(
  INSTRUMENT_TIMBRE_OPTIONS.map((option) => option.id),
);

export function parseStoredInstrumentTimbre(value: string | null): InstrumentTimbre {
  return value && validTimbres.has(value as InstrumentTimbre)
    ? value as InstrumentTimbre
    : 'synth';
}

export function parseStoredLiveSoundFeedback(value: string | null): boolean {
  return value === 'true';
}

export function loadInstrumentTimbre(): InstrumentTimbre {
  if (typeof window === 'undefined') return 'synth';
  try {
    return parseStoredInstrumentTimbre(window.localStorage.getItem(TIMBRE_KEY));
  } catch {
    return 'synth';
  }
}

export function saveInstrumentTimbre(timbre: InstrumentTimbre): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TIMBRE_KEY, timbre);
  } catch {
    // Storage can be unavailable in private/restricted browsing. The in-memory
    // preference still remains active for the current page session.
  }
}

export function loadLiveSoundFeedback(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return parseStoredLiveSoundFeedback(window.localStorage.getItem(LIVE_SOUND_KEY));
  } catch {
    return false;
  }
}

export function saveLiveSoundFeedback(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIVE_SOUND_KEY, String(enabled));
  } catch {
    // Keep the current in-memory setting even if persistence is unavailable.
  }
}
