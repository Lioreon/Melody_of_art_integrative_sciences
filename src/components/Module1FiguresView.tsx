/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useHoldProgress } from '../hooks/useHoldProgress';
import confetti from 'canvas-confetti';
import { MUSICAL_FIGURES } from '../data/scorePresets';
import { DualPalmState, MusicalFigure, AppTheme } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { classifyRhythmGesture } from '../services/gestureClassifier';
import { createRhythmEvaluation, evaluateRhythmGesture, getRhythmSequence, type RhythmEvaluation, type RhythmLevel } from '../services/rhythmEvaluation';
import { Check, ChevronDown, ChevronUp, Trophy } from 'lucide-react';

interface Module1FiguresViewProps {
  palmState: DualPalmState;
  onScoreGain: (points: number) => void;
  isSimulation: boolean;
  onSimulatedDistanceChange: (distCm: number) => void;
  theme?: AppTheme;
}

export const Module1FiguresView: React.FC<Module1FiguresViewProps> = ({
  palmState,
  onScoreGain,
  isSimulation,
  onSimulatedDistanceChange,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const [subMode, setSubMode] = useState<'practice' | 'challenge'>('practice');
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [rhythmLevel, setRhythmLevel] = useState<RhythmLevel>(0);
  const [rhythmEvaluation, setRhythmEvaluation] = useState<RhythmEvaluation>(() => createRhythmEvaluation(0));
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState<string | null>(null);

  const successTimerRef = useRef<number | null>(null);
  useEffect(() => () => { if (successTimerRef.current !== null) clearTimeout(successTimerRef.current); }, []);
  const targetFigure: MusicalFigure = MUSICAL_FIGURES[challengeIndex % MUSICAL_FIGURES.length];
  const rhythmTargetId = rhythmEvaluation.sequence[rhythmEvaluation.position];
  const rhythmTargetFigure = MUSICAL_FIGURES.find((figure) => figure.id === rhythmTargetId) ?? MUSICAL_FIGURES[2];

  const hasBothHands = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);

  // Active figure matching current distance
  const activeDetectedFigure = hasBothHands ? MUSICAL_FIGURES.find(
    (fig) =>
      palmState.distanceCm >= fig.targetDistanceMinCm &&
      palmState.distanceCm <= fig.targetDistanceMaxCm
  ) : undefined;

  const activeFig = subMode === 'challenge'
    ? (rhythmLevel >= 0 ? rhythmTargetFigure : targetFigure)
    : activeDetectedFigure;
  const isHoldingCorrect = Boolean(
    hasBothHands &&
    activeFig &&
    !rhythmEvaluation.completed &&
    palmState.distanceCm >= activeFig.targetDistanceMinCm &&
    palmState.distanceCm <= activeFig.targetDistanceMaxCm,
  );
  const [holdProgress, setHoldProgress] = useHoldProgress(
    `${subMode}:${activeFig?.id}`, isHoldingCorrect && !lastCompletedTitle,
    (activeFig?.durationSeconds ?? 1) * 1000, () => { if (activeFig) triggerSuccess(activeFig); });

  const triggerSuccess = (figure: MusicalFigure) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    audioSynthesizer.playHitSound(100);
    const pts = Math.round(100 * figure.durationBeats);
    onScoreGain(pts);
    setCompletedCount((c) => c + 1);
    setLastCompletedTitle(figure.name);

    successTimerRef.current = window.setTimeout(() => {
      setLastCompletedTitle(null);
      setHoldProgress(0);
      if (subMode === 'challenge') {
        setRhythmEvaluation((previous) => evaluateRhythmGesture(previous, classifyRhythmGesture(figure.targetDistanceIdealCm)));
      }
    }, 1400);
  };

  const handleSelectFigure = (idx: number) => {
    setChallengeIndex(idx);
    setHoldProgress(0);
    if (isSimulation) {
      onSimulatedDistanceChange(MUSICAL_FIGURES[idx].targetDistanceIdealCm);
    }
  };

  const handleLevelChange = (level: RhythmLevel) => {
    setRhythmLevel(level);
    setRhythmEvaluation(createRhythmEvaluation(level));
    setLastCompletedTitle(null);
    setHoldProgress(0);
    if (isSimulation) onSimulatedDistanceChange(MUSICAL_FIGURES.find((figure) => figure.id === getRhythmSequence(level)[0])?.targetDistanceIdealCm ?? 35);
  };

  const handleRepeatSequence = () => {
    setRhythmEvaluation(createRhythmEvaluation(rhythmLevel));
    setLastCompletedTitle(null);
    setHoldProgress(0);
    if (isSimulation) onSimulatedDistanceChange(rhythmTargetFigure.targetDistanceIdealCm);
  };

  const displayedFigure = subMode === 'challenge' ? rhythmTargetFigure : (activeDetectedFigure || targetFigure);
  const isTargetWithinRange =
    palmState.distanceCm >= displayedFigure.targetDistanceMinCm &&
    palmState.distanceCm <= displayedFigure.targetDistanceMaxCm;

  return (
    <div className="space-y-4">
      {/* Mode Navigation & Stats Bar */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)] transition-colors">
        <div className="flex items-center space-x-1.5" role="tablist">
          <button
            onClick={() => {
              setSubMode('practice');
              setLastCompletedTitle(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              subMode === 'practice'
                ? isWhite ? 'bg-slate-100 text-slate-900 font-semibold' : 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Práctica libre
          </button>
          <button
            onClick={() => {
              setSubMode('challenge');
              setRhythmEvaluation(createRhythmEvaluation(rhythmLevel));
              setLastCompletedTitle(null);
              setHoldProgress(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              subMode === 'challenge'
                ? isWhite ? 'bg-slate-100 text-slate-900 font-semibold' : 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Desafíos
          </button>
        </div>

        {subMode === 'challenge' && (
          <div className="flex flex-wrap justify-center gap-1.5" aria-label="Niveles de ritmo">
            {[0, 1, 2].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level as RhythmLevel)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  rhythmLevel === level
                    ? isWhite ? 'bg-cyan-100 text-cyan-900 font-semibold' : 'bg-cyan-900/60 text-cyan-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Nivel {level}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <Trophy className="w-3.5 h-3.5 text-cyan-600" />
          <span>Logros: <strong className={isWhite ? 'text-slate-800' : 'text-slate-200'}>{completedCount}</strong></span>
        </div>
      </div>

      {/* Main Task Area (Figure Matching & Sustain Hold) */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors space-y-5 md:p-6">
        {/* Success notification banner */}
        {lastCompletedTitle && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>¡Objetivo completado: {lastCompletedTitle}! +100 pts</span>
          </div>
        )}

        {/* Centered identification area */}
        <div className="flex flex-col items-center text-center gap-5 py-5 sm:py-8">
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
            <span className="text-slate-500 uppercase tracking-wide font-semibold">
              {subMode === 'challenge'
                ? `${rhythmEvaluation.position}/${rhythmEvaluation.sequence.length}`
                : 'Figura detectada'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {displayedFigure.type === 'note' ? 'Nota' : 'Silencio'}
            </span>
          </div>
          <div aria-hidden="true" className="flex h-40 w-40 select-none items-center justify-center rounded-3xl bg-[var(--ui-surface-muted)] text-[104px] leading-none text-[var(--music-rhythm-accent)] sm:h-48 sm:w-48 sm:text-[128px]">
            {displayedFigure.symbol}
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight break-words max-w-full">{displayedFigure.name}</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            {displayedFigure.durationBeats} {displayedFigure.durationBeats === 1 ? 'tiempo' : 'tiempos'} · {displayedFigure.durationSeconds} s
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>Apertura objetivo: <strong className="text-cyan-700 dark:text-cyan-400">{displayedFigure.targetDistanceIdealCm} u.</strong></p>
            <p>Rango: {displayedFigure.targetDistanceMinCm}–{displayedFigure.targetDistanceMaxCm} u.</p>
          </div>
        </div>

        {/* Primary Action: Hold / Sustain Progress Bar */}
        <div className="space-y-3 pt-2 max-w-lg mx-auto w-full">
          <div className="flex flex-col items-center gap-2 text-sm text-center">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isTargetWithinRange
                ? '¡Posición correcta! Mantén la distancia...'
                : `Ajusta tus palmas al rango (${displayedFigure.targetDistanceMinCm}–${displayedFigure.targetDistanceMaxCm} cm)`}
            </span>
            <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
              {Math.round(holdProgress)}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isTargetWithinRange ? 'bg-emerald-500' : 'bg-cyan-600'
              }`}
              style={{ width: `${holdProgress}%` }}
            />
          </div>

          {/* Quick simulation helper if virtual */}
          {isSimulation && subMode === 'challenge' && !rhythmEvaluation.completed && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => onSimulatedDistanceChange(displayedFigure.targetDistanceIdealCm)}
                className="text-xs text-cyan-600 hover:underline font-medium"
              >
                Ajustar simulación a {displayedFigure.targetDistanceIdealCm} cm
              </button>
            </div>
          )}
          {subMode === 'challenge' && rhythmEvaluation.completed && (
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Secuencia completada</p>
              <button
                onClick={handleRepeatSequence}
                className="text-xs font-medium text-cyan-600 hover:underline"
              >
                Repetir secuencia
              </button>
            </div>
          )}
        </div>

        {/* Expandable: Figures Catalog (Grouped details) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            <span>Ver catálogo de figuras ({MUSICAL_FIGURES.length})</span>
            {showCatalog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCatalog && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              {MUSICAL_FIGURES.map((fig, idx) => {
                const isSelected = challengeIndex === idx;
                const isMatchingNow =
                  palmState.distanceCm >= fig.targetDistanceMinCm &&
                  palmState.distanceCm <= fig.targetDistanceMaxCm;

                return (
                  <button
                    key={fig.id}
                    onClick={() => handleSelectFigure(idx)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30 font-medium'
                        : isMatchingNow
                        ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : isWhite
                        ? 'border-slate-200 hover:bg-slate-50'
                        : 'border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl leading-tight">{fig.symbol}</span>
                      <span className="text-[10px] text-slate-400">{fig.durationBeats}t</span>
                    </div>
                    <div className="text-sm font-semibold mt-2 break-words">{fig.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{fig.targetDistanceIdealCm} cm</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Expandable: Pedagogy Guide (Collapsed to eliminate repetitive text) */}
        <div className="pt-1">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            <span>Ver guía de parámetros (Eje X y Eje Y)</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showGuide && (
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <p>
                <strong>Eje X (Apertura entre palmas):</strong> Regula la duración y valor rítmico de la figura musical (Redonda, Blanca, Negra, Corchea).
              </p>
              <p>
                <strong>Eje Y (Altura vertical):</strong> Regula la entonación y posición en el área Pentagrama.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
