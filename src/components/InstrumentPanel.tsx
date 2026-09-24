import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppTheme, DualPalmState } from '../types';
import { MusicalInstrumentView } from './MusicalInstrumentView';
import { TREBLE_TRAINING_RANGE, MUSICAL_FIGURES, mapHeightToNote, mapSeparationToFigure, calculateRealDurationSec, DEFAULT_PITCH_Y_MIN, DEFAULT_PITCH_Y_MAX } from '../data/musicalScaleData';
import { audioSynthesizer } from '../services/audioSynthesizer';
import type { InstrumentTimbre } from '../services/instrumentSamples';
import { InstrumentTimbreSelector } from './InstrumentTimbreSelector';
import {
  applyAccidentalToFrequency,
  interpretBimanualMusicalGesture,
} from '../services/musicalGesture';

interface InstrumentPanelProps {
  palmState: DualPalmState;
  theme: AppTheme;
  timbre: InstrumentTimbre;
  onTimbreChange: (timbre: InstrumentTimbre) => void;
}

export function InstrumentPanel({ palmState, theme, timbre, onTimbreChange }: InstrumentPanelProps) {
  const [bpm, setBpm] = useState(120);
  const [note, setNote] = useState(TREBLE_TRAINING_RANGE.find((item) => item.id === 'sol4') ?? TREBLE_TRAINING_RANGE[0]);
  const [figure, setFigure] = useState(MUSICAL_FIGURES[2]);
  const [range, setRange] = useState({ top: DEFAULT_PITCH_Y_MIN, bottom: DEFAULT_PITCH_Y_MAX, close: 15, far: 85 });
  const [playing, setPlaying] = useState(false);
  const [liveSoundFeedback, setLiveSoundFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const playingRef = useRef(false);
  const lastFeedbackNoteRef = useRef<string | null>(null);
  const trackingLost = !palmState.leftPalm?.present || !palmState.rightPalm?.present;
  const avgY = trackingLost ? 0.5 : (palmState.leftPalm!.center.y + palmState.rightPalm!.center.y) / 2;
  const duration = calculateRealDurationSec(figure.beats, bpm);
  const bimanualGesture = interpretBimanualMusicalGesture(palmState);
  const isSilentGesture = bimanualGesture.mode === 'rest';
  const effectiveFrequency = applyAccidentalToFrequency(note.frequency, bimanualGesture.accidental);

  useEffect(() => {
    if (trackingLost || playing) return;
    setNote(current => mapHeightToNote(avgY, range.top, range.bottom, current.id));
    setFigure(current => mapSeparationToFigure(palmState.distanceCm, range.close, range.far, current.id));
  }, [avgY, palmState.distanceCm, trackingLost, playing, range]);

  const play = useCallback(() => {
    if (trackingLost || playingRef.current || isSilentGesture) return;
    void audioSynthesizer.playInstrumentNote(effectiveFrequency, duration, timbre);
    playingRef.current = true;
    setPlaying(true);
    const start = performance.now();
    const tick = (now: number) => {
      const value = Math.min(1, (now - start) / (duration * 1000));
      setProgress(value);
      if (value < 1) frame.current = requestAnimationFrame(tick);
      else { playingRef.current = false; setPlaying(false); frame.current = null; }
    };
    frame.current = requestAnimationFrame(tick);
  }, [trackingLost, isSilentGesture, effectiveFrequency, duration, timbre]);


  useEffect(() => {
    if (!liveSoundFeedback || trackingLost || playing || isSilentGesture) {
      if (trackingLost) lastFeedbackNoteRef.current = null;
      return;
    }
    const feedbackKey = `${note.id}:${bimanualGesture.accidental}`;
    if (lastFeedbackNoteRef.current === feedbackKey) return;
    lastFeedbackNoteRef.current = feedbackKey;
    const feedbackDuration = Math.min(0.45, Math.max(0.18, duration));
    void audioSynthesizer.playInstrumentNote(effectiveFrequency, feedbackDuration, timbre);
  }, [note.id, bimanualGesture.accidental, effectiveFrequency, duration, timbre, liveSoundFeedback, trackingLost, playing, isSilentGesture]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.code !== 'Space' || event.repeat || target?.closest('input, select, textarea, button, [contenteditable]')) return;
      event.preventDefault(); play();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [play]);

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  return <div className="space-y-4">
    <MusicalInstrumentView selectedNote={note} selectedFigure={figure} realDurationSec={duration}
      bpm={bpm} trackingLost={trackingLost} isPlaying={playing} playProgress={progress} onPlayNote={play}
      separationCm={palmState.distanceCm} avgYNorm={avgY} theme={theme}
      accidental={bimanualGesture.accidental}
      isSilentGesture={isSilentGesture}
      gestureLabel={bimanualGesture.label} />

    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 text-sm shadow-[var(--ui-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gramática gestual</div>
          <div className="mt-1 text-base font-semibold">{bimanualGesture.label}</div>
          <div className="mt-1 text-xs text-slate-500">{bimanualGesture.description}</div>
        </div>
        <div className="text-right text-xs text-slate-500">
          {bimanualGesture.supportsHandShape
            ? 'Manos libres · falanges activas'
            : 'Modo posicional · sin forma de dedos'}
        </div>
      </div>
    </section>

    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 text-sm shadow-[var(--ui-shadow)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <InstrumentTimbreSelector
            timbre={timbre}
            onChange={(next) => {
              onTimbreChange(next);
              lastFeedbackNoteRef.current = null;
            }}
            currentFrequency={note.frequency}
          />
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
          <input
            type="checkbox"
            checked={liveSoundFeedback}
            onChange={(event) => {
              setLiveSoundFeedback(event.target.checked);
              lastFeedbackNoteRef.current = null;
            }}
          />
          <span>Respuesta sonora al mover las manos</span>
        </label>
      </div>

    </section>

    <details className="rounded-xl border border-slate-300 p-4 text-sm">
      <summary className="cursor-pointer">Tempo y rango cómodo</summary>
      <div className="pt-4 space-y-4">
        <label className="block">Tempo: {bpm} BPM
          <input aria-label="Tempo del instrumento" className="block w-full" type="range" min="30" max="240"
            value={bpm} disabled={playing} onChange={e => setBpm(Number(e.target.value))} />
        </label>
        <p className="text-xs">Coloca las manos y guarda cada extremo de tu movimiento. La apertura es una escala relativa, no centímetros físicos.</p>
        <div className="flex flex-wrap gap-2">
          <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={trackingLost || avgY >= range.bottom - 0.1}
            onClick={() => setRange(r => ({ ...r, top: avgY }))}>Guardar altura aguda</button>
          <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={trackingLost || avgY <= range.top + 0.1}
            onClick={() => setRange(r => ({ ...r, bottom: avgY }))}>Guardar altura grave</button>
          <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={trackingLost || palmState.distanceCm >= range.far - 10}
            onClick={() => setRange(r => ({ ...r, close: palmState.distanceCm }))}>Guardar apertura mínima</button>
          <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={trackingLost || palmState.distanceCm <= range.close + 10}
            onClick={() => setRange(r => ({ ...r, far: palmState.distanceCm }))}>Guardar apertura máxima</button>
          <button className="border rounded px-3 py-2" onClick={() => setRange({ top: DEFAULT_PITCH_Y_MIN, bottom: DEFAULT_PITCH_Y_MAX, close: 15, far: 85 })}>Restablecer rango</button>
        </div>
      </div>
    </details>
  </div>;
}
