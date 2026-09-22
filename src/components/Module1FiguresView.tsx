/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useHoldProgress } from '../hooks/useHoldProgress';
import { MUSICAL_FIGURES } from '../data/scorePresets';
import type { AppTheme, DualPalmState, MusicalFigure } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { advanceRhythmSequence, evaluateRhythmTarget, exploreRhythm } from '../services/rhythmEvaluation';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

type RhythmLevel = 0 | 1 | 2;
type RhythmPhase = 'READY' | 'ACTIVE' | 'FEEDBACK' | 'SUCCESS';

interface Module1FiguresViewProps {
  palmState: DualPalmState;
  // Retained for App compatibility; Rhythm MVP no longer awards global score.
  onScoreGain: (points: number) => void;
  isSimulation: boolean;
  onSimulatedDistanceChange: (distCm: number) => void;
  theme?: AppTheme;
}

const sequenceIds = ['negra', 'blanca', 'negra'] as const;
const rhythmFigures = MUSICAL_FIGURES.filter(figure => figure.type === 'note');
const sequence = sequenceIds.map(id => {
  const figure = MUSICAL_FIGURES.find(candidate => candidate.id === id);
  if (!figure) throw new Error(`Missing rhythm figure: ${id}`);
  return figure;
});

export const Module1FiguresView: React.FC<Module1FiguresViewProps> = ({
  palmState,
  isSimulation,
  onSimulatedDistanceChange,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const [level, setLevel] = useState<RhythmLevel>(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [phase, setPhase] = useState<RhythmPhase>('READY');
  const [feedback, setFeedback] = useState('Explora qué ocurre al cambiar la distancia entre tus manos.');
  const [showCatalog, setShowCatalog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
  }, []);

  const hasTracking = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const detectedFigure: MusicalFigure | undefined = hasTracking
    ? MUSICAL_FIGURES.find(figure =>
      palmState.distanceCm >= figure.targetDistanceMinCm &&
      palmState.distanceCm <= figure.targetDistanceMaxCm)
    : undefined;
  const targetFigure = level === 2
    ? sequence[sequenceIndex]
    : rhythmFigures[challengeIndex % rhythmFigures.length];
  const evaluation = level === 0
    ? exploreRhythm(hasTracking)
    : evaluateRhythmTarget(targetFigure, detectedFigure, hasTracking, palmState.distanceCm);
  const isHoldingCorrect = level !== 0 && phase !== 'SUCCESS' && evaluation.status === 'correct';

  const triggerSuccess = () => {
    audioSynthesizer.playHitSound(100);
    setPhase('SUCCESS');
    setFeedback('¡Correcto! Has relacionado la separación con la figura.');
    successTimerRef.current = window.setTimeout(() => {
      successTimerRef.current = null;
      setCompletedCount(count => count + 1);
      if (level === 2) {
        const nextIndex = advanceRhythmSequence(sequenceIndex, 'correct', sequence.length);
        if (nextIndex === sequenceIndex) {
          setFeedback('¡Secuencia completada! Puedes repetirla o explorar otra figura.');
        } else {
          setSequenceIndex(nextIndex);
          setPhase('ACTIVE');
          setFeedback('Siguiente figura: ajusta la separación y mantén la posición.');
        }
      } else {
        setChallengeIndex(index => (index + 1) % rhythmFigures.length);
        setPhase('ACTIVE');
        setFeedback('Nueva figura: ajusta la separación y mantén la posición.');
      }
    }, 1200);
  };

  const [holdProgress, setHoldProgress] = useHoldProgress(
    `${level}:${targetFigure.id}:${sequenceIndex}`,
    isHoldingCorrect,
    targetFigure.durationSeconds * 1000,
    triggerSuccess,
  );

  useEffect(() => {
    if (level === 0 || phase === 'SUCCESS') return;
    setPhase(evaluation.status === 'tracking-paused' ? 'ACTIVE' : 'FEEDBACK');
    setFeedback(evaluation.feedback);
  }, [evaluation.feedback, evaluation.status, level, phase]);

  const resetSuccessTimer = () => {
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const selectLevel = (nextLevel: RhythmLevel) => {
    resetSuccessTimer();
    setLevel(nextLevel);
    setSequenceIndex(0);
    setPhase(nextLevel === 0 ? 'READY' : 'ACTIVE');
    setFeedback(nextLevel === 0
      ? 'Explora qué ocurre al cambiar la distancia entre tus manos.'
      : 'Ajusta la separación hasta la figura objetivo y mantén la posición.');
    setHoldProgress(0);
  };

  const selectFigure = (index: number) => {
    resetSuccessTimer();
    setChallengeIndex(index);
    setLevel(1);
    setPhase('ACTIVE');
    setFeedback('Ajusta la separación hasta la figura objetivo y mantén la posición.');
    setHoldProgress(0);
    if (isSimulation) onSimulatedDistanceChange(rhythmFigures[index].targetDistanceIdealCm);
  };

  const displayedFigure = level === 0 ? (detectedFigure ?? rhythmFigures[2]) : targetFigure;
  const gestureLabel = palmState.leftPalm?.gestureState === 'OPEN_HAND' && palmState.rightPalm?.gestureState === 'OPEN_HAND'
    ? 'Manos abiertas'
    : palmState.leftPalm?.gestureState === 'CLOSED_FIST' && palmState.rightPalm?.gestureState === 'CLOSED_FIST'
    ? 'Puños cerrados'
    : !hasTracking
    ? 'Sin gesto detectado'
    : palmState.leftPalm?.gestureState !== palmState.rightPalm?.gestureState
    ? 'Gestos mixtos'
    : 'Gesto no concluyente';
  const phaseLabel = phase === 'READY' ? 'Listo' : phase === 'ACTIVE' ? 'En curso' : phase === 'FEEDBACK' ? 'Feedback' : 'Éxito';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)]">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ritmo</span>
        {([
          [0, 'Explorar'],
          [1, 'Una figura'],
          [2, 'Secuencia'],
        ] as const).map(([value, label]) => (
          <button key={value} onClick={() => selectLevel(value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${level === value ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            Nivel {value}: {label}
          </button>
        ))}
      </div>

      <div className="relative space-y-5 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors md:p-6">
        {phase === 'SUCCESS' && (
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <span>{level === 2 && sequenceIndex === sequence.length - 1 ? 'Secuencia completada' : 'Objetivo completado'}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wide text-slate-500">Nivel {level} · {phaseLabel}</span>
            <span className="text-slate-500">Completados: {completedCount}</span>
          </div>
          {level === 2 && <span className="font-mono text-cyan-600">{sequenceIndex + 1} / {sequence.length}</span>}
        </div>

        <div className="grid gap-4 text-center md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{level === 0 ? 'Interpretación' : 'Objetivo'}</p>
            <div aria-hidden="true" className="my-3 text-7xl text-[var(--music-rhythm-accent)]">{displayedFigure.symbol}</div>
            <h2 className="text-2xl font-bold">{displayedFigure.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{displayedFigure.description}</p>
          </section>
          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lo que detecta Melody Motion</p>
            <div aria-hidden="true" className="my-3 text-7xl text-[var(--music-rhythm-accent)]">{detectedFigure?.symbol ?? '—'}</div>
            <h2 className="text-2xl font-bold">{detectedFigure?.name ?? 'Sin figura'}</h2>
            <p className="mt-2 text-sm text-slate-500">Separación: {palmState.distanceCm} u. · {gestureLabel}</p>
          </section>
        </div>

        <div className={`rounded-xl border p-4 text-center ${evaluation.status === 'correct' || phase === 'SUCCESS' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-cyan-500/30 bg-cyan-500/10'}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feedback</p>
          <p className="mt-1 font-medium">{hasTracking || level === 0 ? feedback : 'Seguimiento pausado: muestra ambas manos para continuar.'}</p>
        </div>

        {level !== 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500"><span>Mantén la posición</span><span>{Math.round(holdProgress)}%</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${holdProgress}%` }} />
            </div>
            {isSimulation && <button onClick={() => onSimulatedDistanceChange(targetFigure.targetDistanceIdealCm)} className="block mx-auto pt-1 text-xs font-medium text-cyan-600 hover:underline">Ajustar simulación a {targetFigure.targetDistanceIdealCm} u.</button>}
          </div>
        )}

        {level === 2 && phase === 'SUCCESS' && sequenceIndex === sequence.length - 1 && (
          <button
            onClick={() => {
              resetSuccessTimer();
              setSequenceIndex(0);
              setPhase('ACTIVE');
              setFeedback('Siguiente figura: ajusta la separación y mantén la posición.');
              setHoldProgress(0);
            }}
            className="mx-auto block rounded-lg border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
          >
            Repetir secuencia
          </button>
        )}

        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <button onClick={() => setShowCatalog(!showCatalog)} className="flex w-full items-center justify-between py-1 text-xs text-slate-500">
            <span>Ver catálogo de figuras ({rhythmFigures.length})</span>
            {showCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showCatalog && <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-4">
            {MUSICAL_FIGURES.map(figure => (
              <button
                key={figure.id}
                disabled={figure.type !== 'note'}
                onClick={() => {
                  const index = rhythmFigures.findIndex(candidate => candidate.id === figure.id);
                  if (index >= 0) selectFigure(index);
                }}
                className={`rounded-xl border p-2.5 text-center disabled:cursor-not-allowed disabled:opacity-50 ${displayedFigure.id === figure.id ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30' : isWhite ? 'border-slate-200' : 'border-slate-800'}`}
              >
                <div className="text-4xl">{figure.symbol}</div><div className="mt-2 text-sm font-semibold">{figure.name}</div>
              </button>
            ))}
          </div>}
        </div>

        <div>
          <button onClick={() => setShowGuide(!showGuide)} className="flex w-full items-center justify-between py-1 text-xs text-slate-500">
            <span>Ver guía de parámetros</span>
            {showGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showGuide && <p className="pt-2 text-xs text-slate-500">La apertura entre palmas regula la duración y el valor rítmico. La altura pertenece al módulo Pentagrama.</p>}
        </div>
      </div>
    </div>
  );
};
