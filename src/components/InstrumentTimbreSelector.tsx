import { useEffect, useState } from 'react';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { INSTRUMENT_TIMBRE_OPTIONS, type InstrumentTimbre } from '../services/instrumentSamples';

interface InstrumentTimbreSelectorProps {
  timbre: InstrumentTimbre;
  onChange: (timbre: InstrumentTimbre) => void;
  currentFrequency: number;
  compact?: boolean;
}

export function InstrumentTimbreSelector({
  timbre,
  onChange,
  currentFrequency,
  compact = false,
}: InstrumentTimbreSelectorProps) {
  const [sampleReady, setSampleReady] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const selectedOption = INSTRUMENT_TIMBRE_OPTIONS.find((option) => option.id === timbre);

  useEffect(() => {
    if (timbre === 'synth') {
      setSampleReady('idle');
      return;
    }

    setSampleReady('loading');
    let cancelled = false;
    void audioSynthesizer.preloadInstrument(timbre, currentFrequency).then((ok) => {
      if (!cancelled) setSampleReady(ok ? 'ready' : 'fallback');
    });

    return () => {
      cancelled = true;
    };
  }, [timbre, currentFrequency]);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Timbre del instrumento
        </span>
        <select
          aria-label="Timbre del instrumento"
          value={timbre}
          onChange={(event) => onChange(event.target.value as InstrumentTimbre)}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          {INSTRUMENT_TIMBRE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>
          {timbre === 'synth'
            ? 'Sintetizador local · sin descarga externa.'
            : sampleReady === 'loading'
            ? 'Preparando muestra…'
            : sampleReady === 'ready'
            ? 'Muestra preparada · las siguientes notas se cargan bajo demanda.'
            : sampleReady === 'fallback'
            ? 'No se pudo cargar la muestra; se usará el sintetizador como respaldo.'
            : 'Muestras cargadas bajo demanda.'}
        </span>
        {timbre !== 'synth' && selectedOption?.sourceLabel && (
          <span>Fuente: {selectedOption.sourceLabel}.</span>
        )}
      </div>
    </div>
  );
}
