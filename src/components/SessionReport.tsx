/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SessionStats } from '../types';
import { RotateCcw, X } from 'lucide-react';

interface SessionReportProps {
  stats: SessionStats;
  pieceTitle: string;
  onClose: () => void;
  onRestart: () => void;
}

export const SessionReport: React.FC<SessionReportProps> = ({
  stats,
  pieceTitle,
  onClose,
  onRestart,
}) => {
  useEffect(() => {
    if (stats.conductorGrade === 'S' || stats.conductorGrade === 'A') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#64748b', '#38bdf8'],
      });
    }
  }, [stats]);

  const getGradeTitle = (grade: string) => {
    switch (grade) {
      case 'S': return 'Excelente precisión y sincronía';
      case 'A': return 'Muy buen control del compás';
      case 'B': return 'Buen avance, continúa practicando';
      case 'C': return 'Ritmo regular';
      default: return 'Requiere ajuste de sincronía';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Resumen de sesión
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{pieceTitle}</h2>
        </div>

        {/* Big Conductor Rank Badge */}
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-3xl font-black shrink-0">
            {stats.conductorGrade}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{getGradeTitle(stats.conductorGrade)}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Puntuación: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats.totalScore} pts</strong>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Latencia media</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {Math.round(stats.avgReactionTimeMs)} ms
            </span>
            <span className="text-[10px] text-slate-400">Mejor: {stats.bestReactionTimeMs} ms</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Precisión espacial</span>
            <span className="text-base font-mono font-bold text-cyan-600 mt-0.5 block">
              {Math.round(stats.avgPrecisionAccuracy)}%
            </span>
            <span className="text-[10px] text-slate-400">Tolerancia ±5 cm</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Desviación del beat</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {stats.avgBeatDriftMs > 0 ? `+${Math.round(stats.avgBeatDriftMs)}` : Math.round(stats.avgBeatDriftMs)} ms
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Racha de aciertos</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {stats.streak}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir partitura</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

