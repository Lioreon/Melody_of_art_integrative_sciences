import { INSTRUMENT_TIMBRE_OPTIONS, type InstrumentTimbre } from './instrumentSamples';

const TIMBRE_KEY = 'melody-motion.instrument-timbre';
const LIVE_SOUND_KEY = 'melody-motion.live-sound-feedback';

export const DEFAULT_INSTRUMENT_TIMBRE: InstrumentTimbre = 'violin_pizzicato';
export const DEFAULT_LIVE_SOUND_FEEDBACK = true;

const validTimbres = new Set<InstrumentTimbre>(
  INSTRUMENT_TIMBRE_OPTIONS.map((option) => option.id),
);

export function parseStoredInstrumentTimbre(value: string | null): InstrumentTimbre {
  return value && validTimbres.has(value as InstrumentTimbre)
    ? value as InstrumentTimbre
    : DEFAULT_INSTRUMENT_TIMBRE;
}

export function parseStoredLiveSoundFeedback(value: string | null): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return DEFAULT_LIVE_SOUND_FEEDBACK;
}

export function loadInstrumentTimbre(): InstrumentTimbre {
  if (typeof window === 'undefined') return DEFAULT_INSTRUMENT_TIMBRE;
  try {
    return parseStoredInstrumentTimbre(window.localStorage.getItem(TIMBRE_KEY));
  } catch {
    return DEFAULT_INSTRUMENT_TIMBRE;
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
  if (typeof window === 'undefined') return DEFAULT_LIVE_SOUND_FEEDBACK;
  try {
    return parseStoredLiveSoundFeedback(window.localStorage.getItem(LIVE_SOUND_KEY));
  } catch {
    return DEFAULT_LIVE_SOUND_FEEDBACK;
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
