import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppTheme, DualPalmState } from '../types';
import { MusicalInstrumentView } from './MusicalInstrumentView';
import { TREBLE_TRAINING_RANGE, MUSICAL_FIGURES, mapHeightToNote, mapSeparationToFigure, calculateRealDurationSec, DEFAULT_PITCH_Y_MIN, DEFAULT_PITCH_Y_MAX } from '../data/musicalScaleData';
import { audioSynthesizer } from '../services/audioSynthesizer';

export function InstrumentPanel({ palmState, theme }: { palmState: DualPalmState; theme: AppTheme }) {
  const [bpm, setBpm] = useState(120);
  const [note, setNote] = useState(TREBLE_TRAINING_RANGE.find((item) => item.id === 'sol4') ?? TREBLE_TRAINING_RANGE[0]);
  const [figure, setFigure] = useState(MUSICAL_FIGURES[2]);
  const [range, setRange] = useState({ top: DEFAULT_PITCH_Y_MIN, bottom: DEFAULT_PITCH_Y_MAX, close: 15, far: 85 });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const playingRef = useRef(false);
  const trackingLost = !palmState.leftPalm?.present || !palmState.rightPalm?.present;
  const avgY = trackingLost ? 0.5 : (palmState.leftPalm!.center.y + palmState.rightPalm!.center.y) / 2;
  const duration = calculateRealDurationSec(figure.beats, bpm);

  useEffect(() => {
    if (trackingLost || playing) return;
    setNote(current => mapHeightToNote(avgY, range.top, range.bottom, current.id));
    setFigure(current => mapSeparationToFigure(palmState.distanceCm, range.close, range.far, current.id));
  }, [avgY, palmState.distanceCm, trackingLost, playing, range]);

  const play = useCallback(() => {
    if (trackingLost || playingRef.current) return;
    audioSynthesizer.playPitchNote(note.frequency, duration);
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
  }, [trackingLost, note, duration]);

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
      separationCm={palmState.distanceCm} avgYNorm={avgY} theme={theme} />
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
