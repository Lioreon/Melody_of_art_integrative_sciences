/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { MUSICAL_FIGURES } from '../data/scorePresets';
import type { AppTheme, DualPalmState, MusicalFigure } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import {
  beatDurationMs,
  buildCompasTimeline,
  compasGuidance,
  COMPAS_PATTERNS,
  getCompasFrame,
} from '../services/compasAccordion';

interface CompasAccordionViewProps {
  palmState: DualPalmState;
  isSimulation: boolean;
  onSimulatedDistanceChange: (distCm: number) => void;
  theme?: AppTheme;
}

const rhythmFigures = MUSICAL_FIGURES.filter((figure) => figure.type === 'note');
const PUBLISHED_COMPAS_PATTERNS = COMPAS_PATTERNS.filter(
  (pattern) => pattern.id !== 'sonido_silencio',
);

export const CompasAccordionView: React.FC<CompasAccordionViewProps> = ({
  palmState,
  isSimulation,
  onSimulatedDistanceChange,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const [patternId, setPatternId] = useState(COMPAS_PATTERNS[0].id);
  const initialPattern = PUBLISHED_COMPAS_PATTERNS[0];
  const [bpm, setBpm] = useState(initialPattern.defaultBpm);
  const [elapsedBeats, setElapsedBeats] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const lastClickedBeatRef = useRef(0);

  const pattern = PUBLISHED_COMPAS_PATTERNS.find((candidate) => candidate.id === patternId) ?? initialPattern;
  const timeline = useMemo(
    () => buildCompasTimeline(pattern, MUSICAL_FIGURES),
    [pattern],
  );
  const frame = getCompasFrame(timeline, elapsedBeats);

  const hasTracking = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const detectedFigure: MusicalFigure | undefined = hasTracking
    ? rhythmFigures.find((figure) =>
      palmState.distanceCm >= figure.targetDistanceMinCm
      && palmState.distanceCm <= figure.targetDistanceMaxCm)
    : undefined;

  const guidance = compasGuidance(
    frame.currentStep.figure,
    detectedFigure,
    hasTracking,
    palmState.distanceCm,
  );

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const stepMs = beatDurationMs(bpm);

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = Math.max(0, timestamp - lastTimestampRef.current);
      lastTimestampRef.current = timestamp;

      if (hasTracking) {
        setElapsedBeats((previous) => {
          const totalBeats = timeline[timeline.length - 1].endBeat;
          const next = Math.min(totalBeats, previous + deltaMs / stepMs);
          const crossedBeat = Math.floor(next);

          if (crossedBeat > lastClickedBeatRef.current && crossedBeat <= totalBeats) {
            for (let beat = lastClickedBeatRef.current + 1; beat <= crossedBeat; beat += 1) {
              if (beat < totalBeats) audioSynthesizer.playClick(beat % 4 === 0);
            }
            lastClickedBeatRef.current = crossedBeat;
          }

          if (next >= totalBeats) {
            window.setTimeout(() => setIsPlaying(false), 0);
          }
          return next;
        });
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [bpm, hasTracking, isPlaying, timeline]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const resetPattern = () => {
    setIsPlaying(false);
    setElapsedBeats(0);
    lastClickedBeatRef.current = 0;
    lastTimestampRef.current = null;
  };

  const changePattern = (nextId: string) => {
    const next = PUBLISHED_COMPAS_PATTERNS.find((candidate) => candidate.id === nextId);
    if (!next) return;
    setPatternId(next.id);
    setBpm(next.defaultBpm);
    setElapsedBeats(0);
    setIsPlaying(false);
    lastClickedBeatRef.current = 0;
    lastTimestampRef.current = null;
  };

  const togglePlay = () => {
    if (frame.complete) {
      setElapsedBeats(0);
      lastClickedBeatRef.current = 0;
    }
    setIsPlaying((value) => {
      const next = !value;
      if (next) audioSynthesizer.playClick(true);
      return next;
    });
  };

  const currentBeatInMeasure = Math.min(
    4,
    Math.max(1, Math.floor(frame.elapsedBeats) % 4 + 1),
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-[var(--ui-shadow)]">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Compás · Nivel 1
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--ui-text)]">Acordeón corporal</h2>
          <p className="mt-1 text-sm text-slate-500">
            La apertura de tus manos sigue una frase rítmica dentro de un pulso estable.
            Si se pierde el seguimiento, el tiempo se congela y continúa al recuperar ambas manos.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {PUBLISHED_COMPAS_PATTERNS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => changePattern(candidate.id)}
              aria-pressed={candidate.id === pattern.id}
              className={`rounded-xl border p-3 text-left transition-colors ${
                candidate.id === pattern.id
                  ? 'border-cyan-600 bg-cyan-500/10'
                  : isWhite
                  ? 'border-slate-200'
                  : 'border-slate-800'
              }`}
            >
              <div className="text-sm font-semibold">{candidate.title}</div>
              <div className="mt-1 text-xs text-slate-500">{candidate.description}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 shadow-[var(--ui-shadow)]">
        <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row">
          <div>
            <div className="text-sm font-semibold">{pattern.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {pattern.timeSignature} · {bpm} BPM · {frame.totalBeats} tiempos
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
                isPlaying
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  : 'bg-cyan-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pausar' : frame.complete ? 'Repetir' : 'Iniciar'}
            </button>
            <button
              type="button"
              onClick={resetPattern}
              aria-label="Reiniciar patrón"
              className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Flujo temporal</span>
            <span>Tiempo {currentBeatInMeasure} / 4</span>
          </div>
          <div className="flex h-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            {timeline.map((step, index) => {
              const isPast = index < frame.currentIndex || frame.complete;
              const isCurrent = index === frame.currentIndex && !frame.complete;
              const width = (step.durationBeats / frame.totalBeats) * 100;
              return (
                <div
                  key={`${step.figure.id}:${index}`}
                  style={{ width: `${width}%` }}
                  className={`relative flex min-w-0 flex-col items-center justify-center border-r border-slate-200 px-1 text-center last:border-r-0 dark:border-slate-800 ${
                    isCurrent
                      ? 'bg-cyan-500/10'
                      : isPast
                      ? 'bg-emerald-500/10'
                      : ''
                  }`}
                >
                  {isCurrent && (
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-cyan-500"
                      style={{ width: `${Math.round(frame.stepProgress * 100)}%` }}
                    />
                  )}
                  <div className="text-3xl">{step.figure.symbol}</div>
                  <div className="mt-1 truncate text-[10px] font-semibold">{step.figure.name}</div>
                </div>
              );
            })}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-cyan-500 transition-[width] duration-75"
              style={{ width: `${Math.round(frame.patternProgress * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ahora</p>
            <div className="my-2 text-6xl text-[var(--music-rhythm-accent)]">
              {frame.currentStep.figure.symbol}
            </div>
            <div className="text-xl font-bold">{frame.currentStep.figure.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              Meta: {frame.currentStep.figure.targetDistanceIdealCm} u.
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tus manos</p>
            <div className="my-2 text-6xl text-[var(--music-rhythm-accent)]">
              {detectedFigure?.symbol ?? '—'}
            </div>
            <div className="text-xl font-bold">{detectedFigure?.name ?? 'Sin figura'}</div>
            <div className="mt-1 text-xs text-slate-500">
              Apertura: {palmState.distanceCm} u.
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anticipa</p>
            <div className="my-2 text-6xl text-slate-400">
              {frame.nextStep?.figure.symbol ?? '✓'}
            </div>
            <div className="text-xl font-bold">
              {frame.nextStep?.figure.name ?? 'Fin del patrón'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {frame.nextStep
                ? `Después: ${frame.nextStep.durationBeats} tiempo(s)`
                : 'La frase está por completarse.'}
            </div>
          </section>
        </div>

        <div className={`rounded-xl border p-4 text-center ${
          guidance.status === 'aligned'
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : guidance.status === 'tracking-paused'
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-cyan-500/30 bg-cyan-500/10'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Feedback temporal
          </div>
          <div className="mt-1 font-medium">
            {frame.complete
              ? 'Patrón completado. Repite la frase para consolidar la relación entre apertura y tiempo.'
              : guidance.feedback}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="space-y-1.5 text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wide">Tempo · {bpm} BPM</span>
            <input
              aria-label="Tempo del acordeón corporal"
              type="range"
              min="50"
              max="120"
              step="2"
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
              className="w-full accent-cyan-600"
            />
            <div className="flex justify-between text-[10px]">
              <span>50 · lento</span>
              <span>120 · fluido</span>
            </div>
          </label>

          {isSimulation && (
            <button
              type="button"
              onClick={() => onSimulatedDistanceChange(frame.currentStep.figure.targetDistanceIdealCm)}
              className="rounded-lg border border-cyan-600 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-400"
            >
              Ajustar simulación a la meta
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Nivel 1 integra Ritmo dentro del tiempo. La altura musical se incorporará en una etapa posterior.
        </p>
      </section>
    </div>
  );
};
