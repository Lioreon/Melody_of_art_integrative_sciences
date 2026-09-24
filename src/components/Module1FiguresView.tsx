/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useHoldProgress } from '../hooks/useHoldProgress';
import { MUSICAL_FIGURES } from '../data/scorePresets';
import type { AppTheme, DualPalmState, MusicalFigure } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import {
  advanceRhythmSequence,
  evaluateRhythmTarget,
  exploreRhythm,
  generateRhythmSequence,
  getRhythmVocabulary,
  getRhythmSoundSilenceVocabulary,
  pickRhythmTarget,
  pickRhythmSoundSilenceTarget,
  sequenceLengthForDifficulty,
  type RhythmDifficulty,
} from '../services/rhythmEvaluation';
import { Check, ChevronDown, ChevronUp, RefreshCw, Volume2 } from 'lucide-react';
import {
  equivalentRestForFigure,
  interpretBimanualMusicalGesture,
} from '../services/musicalGesture';

type RhythmLevel = 0 | 1 | 2 | 3;
type RhythmPhase = 'READY' | 'ACTIVE' | 'FEEDBACK' | 'SUCCESS';

interface Module1FiguresViewProps {
  palmState: DualPalmState;
  // Retained for App compatibility; Rhythm does not use global score.
  onScoreGain: (points: number) => void;
  isSimulation: boolean;
  onSimulatedDistanceChange: (distCm: number) => void;
  theme?: AppTheme;
}

const rhythmFigures = MUSICAL_FIGURES.filter(figure => figure.type === 'note');
const initialSinglePick = pickRhythmTarget(rhythmFigures, 'initial', 17);
const initialSequencePlan = generateRhythmSequence(
  rhythmFigures,
  'initial',
  sequenceLengthForDifficulty('initial'),
  31,
);

const difficultyLabels: Record<RhythmDifficulty, { title: string; detail: string }> = {
  initial: { title: 'Inicial', detail: 'Negra · Blanca' },
  intermediate: { title: 'Intermedio', detail: '+ Corchea' },
  full: { title: 'Amplio', detail: '+ Redonda' },
};

export const Module1FiguresView: React.FC<Module1FiguresViewProps> = ({
  palmState,
  isSimulation,
  onSimulatedDistanceChange,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const [level, setLevel] = useState<RhythmLevel>(0);
  const [difficulty, setDifficulty] = useState<RhythmDifficulty>('initial');
  const [singleTarget, setSingleTarget] = useState<MusicalFigure>(initialSinglePick.figure);
  const [singleSeed, setSingleSeed] = useState(initialSinglePick.nextSeed);
  const [sequence, setSequence] = useState<MusicalFigure[]>(initialSequencePlan.figures);
  const [sequenceSeed, setSequenceSeed] = useState(initialSequencePlan.nextSeed);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const initialSoundSilencePick = pickRhythmSoundSilenceTarget(MUSICAL_FIGURES, 'initial', 73);
  const [soundSilenceTarget, setSoundSilenceTarget] = useState<MusicalFigure>(initialSoundSilencePick.figure);
  const [soundSilenceSeed, setSoundSilenceSeed] = useState(initialSoundSilencePick.nextSeed);
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
  const bimanualGesture = interpretBimanualMusicalGesture(palmState);
  const supportsHandShape = bimanualGesture.supportsHandShape;

  const detectedNoteFigure: MusicalFigure | undefined = hasTracking
    ? rhythmFigures.find(figure =>
      palmState.distanceCm >= figure.targetDistanceMinCm &&
      palmState.distanceCm <= figure.targetDistanceMaxCm)
    : undefined;

  const detectedFigure: MusicalFigure | undefined = !detectedNoteFigure
    ? undefined
    : bimanualGesture.mode === 'rest'
    ? equivalentRestForFigure(detectedNoteFigure, MUSICAL_FIGURES)
    : bimanualGesture.mode === 'sound'
    ? detectedNoteFigure
    : undefined;

  const targetFigure = level === 2
    ? (sequence[sequenceIndex] ?? sequence[0] ?? singleTarget)
    : level === 3
    ? soundSilenceTarget
    : singleTarget;
  const evaluation = level === 0
    ? exploreRhythm(hasTracking)
    : evaluateRhythmTarget(targetFigure, detectedFigure, hasTracking, palmState.distanceCm);
  const isHoldingCorrect = level !== 0 && phase !== 'SUCCESS' && evaluation.status === 'correct';

  const resetSuccessTimer = () => {
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const nextSoundSilenceTarget = (avoidId = soundSilenceTarget.id) => {
    const pick = pickRhythmSoundSilenceTarget(MUSICAL_FIGURES, difficulty, soundSilenceSeed, avoidId);
    setSoundSilenceTarget(pick.figure);
    setSoundSilenceSeed(pick.nextSeed);
    return pick.figure;
  };

  const nextSingleTarget = (avoidId = singleTarget.id) => {
    const pick = pickRhythmTarget(rhythmFigures, difficulty, singleSeed, avoidId);
    setSingleTarget(pick.figure);
    setSingleSeed(pick.nextSeed);
    return pick.figure;
  };

  const createNewSequence = (nextDifficulty: RhythmDifficulty = difficulty) => {
    const plan = generateRhythmSequence(
      rhythmFigures,
      nextDifficulty,
      sequenceLengthForDifficulty(nextDifficulty),
      sequenceSeed,
    );
    setSequence(plan.figures);
    setSequenceSeed(plan.nextSeed);
    setSequenceIndex(0);
    return plan.figures;
  };

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
          setFeedback('¡Secuencia completada! Puedes repetirla o generar una nueva.');
        } else {
          setSequenceIndex(nextIndex);
          setPhase('ACTIVE');
          setFeedback('Siguiente figura: ajusta la separación y mantén la posición.');
        }
        return;
      }

      if (level === 3) {
        nextSoundSilenceTarget(targetFigure.id);
        setPhase('ACTIVE');
        setFeedback('Nuevo objetivo: conserva la distancia y usa manos abiertas para sonido o ambos puños para silencio.');
      } else {
        nextSingleTarget(targetFigure.id);
        setPhase('ACTIVE');
        setFeedback('Nueva figura: ajusta la separación y mantén la posición.');
      }
    }, 1100);
  };

  const [holdProgress, setHoldProgress] = useHoldProgress(
    `${level}:${targetFigure.id}:${sequenceIndex}:${difficulty}`,
    isHoldingCorrect,
    targetFigure.durationSeconds * 1000,
    triggerSuccess,
  );

  useEffect(() => {
    if (level === 3 && !supportsHandShape) {
      setLevel(0);
      setPhase('READY');
      setFeedback('Sonido / silencio requiere Manos libres. Se volvió a Exploración posicional.');
      setHoldProgress(0);
    }
  }, [level, supportsHandShape, setHoldProgress]);

  useEffect(() => {
    if (level === 0 || phase === 'SUCCESS') return;
    setPhase(evaluation.status === 'tracking-paused' ? 'ACTIVE' : 'FEEDBACK');
    setFeedback(evaluation.feedback);
  }, [evaluation.feedback, evaluation.status, level, phase]);

  const selectLevel = (nextLevel: RhythmLevel) => {
    resetSuccessTimer();
    setLevel(nextLevel);
    setSequenceIndex(0);
    setPhase(nextLevel === 0 ? 'READY' : 'ACTIVE');
    setFeedback(nextLevel === 0
      ? 'Explora qué ocurre al cambiar la distancia entre tus manos.'
      : nextLevel === 1
      ? 'Reconoce la figura objetivo, ajusta la apertura y mantén la posición.'
      : nextLevel === 2
      ? 'Recorre la secuencia en orden. Cada figura requiere su propia apertura y duración.'
      : supportsHandShape
      ? 'Mantén la misma distancia: manos abiertas producen sonido y ambos puños producen el silencio equivalente.'
      : 'Este nivel requiere Manos libres con landmarks de dedos; los marcadores de color conservan el modo posicional.');
    setHoldProgress(0);
  };

  const changeDifficulty = (nextDifficulty: RhythmDifficulty) => {
    if (nextDifficulty === difficulty) return;
    resetSuccessTimer();
    setDifficulty(nextDifficulty);

    const nextSingle = pickRhythmTarget(rhythmFigures, nextDifficulty, singleSeed);
    setSingleTarget(nextSingle.figure);
    setSingleSeed(nextSingle.nextSeed);

    const nextPlan = generateRhythmSequence(
      rhythmFigures,
      nextDifficulty,
      sequenceLengthForDifficulty(nextDifficulty),
      sequenceSeed,
    );
    const nextSoundSilence = pickRhythmSoundSilenceTarget(
      MUSICAL_FIGURES,
      nextDifficulty,
      soundSilenceSeed,
    );
    setSequence(nextPlan.figures);
    setSequenceSeed(nextPlan.nextSeed);
    setSoundSilenceTarget(nextSoundSilence.figure);
    setSoundSilenceSeed(nextSoundSilence.nextSeed);
    setSequenceIndex(0);
    setPhase(level === 0 ? 'READY' : 'ACTIVE');
    setFeedback(level === 0
      ? 'Explora qué ocurre al cambiar la distancia entre tus manos.'
      : 'Vocabulario actualizado. Ajusta la apertura a la nueva figura objetivo.');
    setHoldProgress(0);
  };

  const selectFigure = (index: number) => {
    resetSuccessTimer();
    const selected = rhythmFigures[index];
    setSingleTarget(selected);
    setLevel(1);
    setPhase('ACTIVE');
    setFeedback('Figura elegida desde el catálogo. Ajusta la separación y mantén la posición.');
    setHoldProgress(0);
    if (isSimulation) onSimulatedDistanceChange(selected.targetDistanceIdealCm);
  };

  const requestNewSingleTarget = () => {
    resetSuccessTimer();
    nextSingleTarget();
    setPhase('ACTIVE');
    setFeedback('Nueva figura aleatoria controlada.');
    setHoldProgress(0);
  };

  const requestNewSequence = () => {
    resetSuccessTimer();
    createNewSequence();
    setPhase('ACTIVE');
    setFeedback('Nueva secuencia generada con el vocabulario actual.');
    setHoldProgress(0);
  };

  const repeatSequence = () => {
    resetSuccessTimer();
    setSequenceIndex(0);
    setPhase('ACTIVE');
    setFeedback('Repite la misma secuencia desde el inicio.');
    setHoldProgress(0);
  };

  const displayedFigure = level === 0 ? (detectedFigure ?? detectedNoteFigure ?? rhythmFigures[2]) : targetFigure;
  const activeVocabulary = level === 3
    ? getRhythmSoundSilenceVocabulary(MUSICAL_FIGURES, difficulty)
    : getRhythmVocabulary(rhythmFigures, difficulty);

  const gestureLabel = !hasTracking
    ? 'Sin gesto detectado'
    : bimanualGesture.label;

  const phaseLabel = phase === 'READY'
    ? 'Listo'
    : phase === 'ACTIVE'
    ? 'En curso'
    : phase === 'FEEDBACK'
    ? 'Feedback'
    : 'Éxito';

  const hearDisplayedFigure = () => {
    if (displayedFigure.type === 'rest') {
      audioSynthesizer.playClick(true);
      window.setTimeout(
        () => audioSynthesizer.playClick(false),
        Math.max(120, displayedFigure.durationSeconds * 1000),
      );
      return;
    }
    audioSynthesizer.playPitchNote(440, displayedFigure.durationSeconds, 'warm');
  };

  const sequenceComplete = level === 2
    && phase === 'SUCCESS'
    && sequenceIndex === sequence.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)]">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ritmo</span>
        {([
          [0, 'Explorar'],
          [1, 'Una figura'],
          [2, 'Secuencia variable'],
          [3, 'Sonido / silencio'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => selectLevel(value)}
            disabled={value === 3 && !supportsHandShape}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
              level === value
                ? 'bg-cyan-600 text-white'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Nivel {value}: {label}
          </button>
        ))}
      </div>

      {level !== 0 && (
        <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vocabulario rítmico</p>
              <p className="mt-1 text-xs text-slate-500">
                La dificultad aumenta por relaciones musicales disponibles, no por puntos.
              </p>
            </div>
            <span className="text-xs text-slate-500">{activeVocabulary.length} símbolos activos</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(difficultyLabels) as RhythmDifficulty[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => changeDifficulty(value)}
                aria-pressed={difficulty === value}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                  difficulty === value
                    ? 'border-cyan-600 bg-cyan-500/10'
                    : isWhite
                    ? 'border-slate-200'
                    : 'border-slate-800'
                }`}
              >
                <div className="text-sm font-semibold">{difficultyLabels[value].title}</div>
                <div className="mt-0.5 text-xs text-slate-500">{difficultyLabels[value].detail}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="relative space-y-5 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors md:p-6">
        {phase === 'SUCCESS' && (
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <span>{sequenceComplete ? 'Secuencia completada' : 'Objetivo completado'}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wide text-slate-500">Nivel {level} · {phaseLabel}</span>
            <span className="text-slate-500">Completados: {completedCount}</span>
          </div>
          {level === 2 && <span className="font-mono text-cyan-600">{sequenceIndex + 1} / {sequence.length}</span>}
          {level === 3 && (
            <span className="font-mono text-cyan-600">
              {supportsHandShape ? 'forma de mano activa' : 'requiere Manos libres'}
            </span>
          )}
        </div>

        {level === 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            {sequence.map((figure, index) => {
              const complete = index < sequenceIndex || sequenceComplete;
              const active = index === sequenceIndex && !sequenceComplete;
              return (
                <div
                  key={`${figure.id}:${index}`}
                  className={`min-w-[64px] rounded-lg border px-2 py-2 text-center ${
                    active
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : complete
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : isWhite
                      ? 'border-slate-200'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="text-3xl">{figure.symbol}</div>
                  <div className="mt-1 text-[10px] font-semibold">{index + 1}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-4 text-center md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {level === 0 ? 'Interpretación' : 'Objetivo'}
            </p>
            <div aria-hidden="true" className="my-3 text-7xl text-[var(--music-rhythm-accent)]">{displayedFigure.symbol}</div>
            <h2 className="text-2xl font-bold">{displayedFigure.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{displayedFigure.description}</p>
            <button
              type="button"
              onClick={hearDisplayedFigure}
              className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
            >
              <Volume2 className="h-3.5 w-3.5" />
              {displayedFigure.type === 'rest' ? 'Marcar silencio' : 'Escuchar duración'} · {displayedFigure.durationSeconds}s
            </button>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lo que detecta Melody Motion</p>
            <div aria-hidden="true" className="my-3 text-7xl text-[var(--music-rhythm-accent)]">{detectedFigure?.symbol ?? '—'}</div>
            <h2 className="text-2xl font-bold">{detectedFigure?.name ?? 'Sin figura'}</h2>
            <p className="mt-2 text-sm text-slate-500">Separación: {palmState.distanceCm} u. · {gestureLabel}</p>
            {supportsHandShape && (
              <p className="mt-1 text-xs text-slate-400">
                Abiertas = sonido · puños = silencio · gesto mixto = reservado para alteraciones en nota.
              </p>
            )}
          </section>
        </div>

        <div className={`rounded-xl border p-4 text-center ${
          evaluation.status === 'correct' || phase === 'SUCCESS'
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-cyan-500/30 bg-cyan-500/10'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feedback</p>
          <p className="mt-1 font-medium">
            {hasTracking || level === 0
              ? feedback
              : 'Seguimiento pausado: muestra ambas manos para continuar.'}
          </p>
        </div>

        {level !== 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Mantén la posición</span>
              <span>{Math.round(holdProgress)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            {isSimulation && (
              <button
                onClick={() => onSimulatedDistanceChange(targetFigure.targetDistanceIdealCm)}
                className="block mx-auto pt-1 text-xs font-medium text-cyan-600 hover:underline"
              >
                Ajustar simulación a {targetFigure.targetDistanceIdealCm} u.
              </button>
            )}
          </div>
        )}

        {(level === 1 || level === 3) && (
          <button
            type="button"
            onClick={level === 3 ? () => {
              resetSuccessTimer();
              nextSoundSilenceTarget();
              setPhase('ACTIVE');
              setFeedback('Nuevo objetivo de sonido o silencio.');
              setHoldProgress(0);
            } : requestNewSingleTarget}
            className="mx-auto flex items-center gap-1.5 rounded-lg border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {level === 3 ? 'Nuevo símbolo' : 'Nueva figura'}
          </button>
        )}

        {sequenceComplete && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={repeatSequence}
              className="rounded-lg border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
            >
              Repetir secuencia
            </button>
            <button
              onClick={requestNewSequence}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Nueva secuencia
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="flex w-full items-center justify-between py-1 text-xs text-slate-500"
          >
            <span>Ver catálogo de figuras ({rhythmFigures.length})</span>
            {showCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showCatalog && (
            <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-4">
              {MUSICAL_FIGURES.map(figure => (
                <button
                  key={figure.id}
                  disabled={figure.type !== 'note' && level !== 3}
                  onClick={() => {
                    if (figure.type === 'rest') {
                      setSoundSilenceTarget(figure);
                      setLevel(3);
                      setPhase('ACTIVE');
                      setFeedback('Silencio elegido desde el catálogo. Conserva la distancia y cierra ambos puños.');
                      setHoldProgress(0);
                      if (isSimulation) onSimulatedDistanceChange(figure.targetDistanceIdealCm);
                      return;
                    }
                    const index = rhythmFigures.findIndex(candidate => candidate.id === figure.id);
                    if (index >= 0) selectFigure(index);
                  }}
                  className={`rounded-xl border p-2.5 text-center disabled:cursor-not-allowed disabled:opacity-50 ${
                    displayedFigure.id === figure.id
                      ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30'
                      : isWhite
                      ? 'border-slate-200'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="text-4xl">{figure.symbol}</div>
                  <div className="mt-2 text-sm font-semibold">{figure.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between py-1 text-xs text-slate-500"
          >
            <span>Ver guía de parámetros</span>
            {showGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showGuide && (
            <p className="pt-2 text-xs text-slate-500">
              La apertura entre palmas regula la duración. En Manos libres, ambas manos abiertas representan figura sonora
              y ambos puños cerrados representan el silencio equivalente con la misma distancia. Los gestos mixtos se reservan
              para sostenido/bemol en los módulos de altura. La altura pertenece a Pentagrama.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
