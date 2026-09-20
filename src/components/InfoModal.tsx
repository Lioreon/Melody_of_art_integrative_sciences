/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl space-y-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 text-[var(--ui-text)] shadow-xl md:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[var(--ui-surface-muted)] text-[var(--ui-forest)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Guía de Melody Motion
            </h2>
            <p className="text-xs text-slate-500">
              Melody Motion · Movimiento, sonido y aprendizaje
            </p>
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ui-blue)]">Ritmo · Figuras y duración</span>
              <span className="text-slate-400 font-mono text-[11px]">Distancia (X)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detección de distancia física entre las palmas. Cada figura o silencio requiere una apertura específica y mantener la posición durante el tiempo de sostenimiento.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ui-blue)]">Pentagrama · Altura y duración</span>
              <span className="text-slate-400 font-mono text-[11px]">Altura (Y)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Relaciona la posición vertical de las palmas con las notas musicales en la Clave de Sol (Do4 a Do5), diferenciando líneas y espacios.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ui-blue)]">Compás · Dirección y respuesta</span>
              <span className="text-slate-400 font-mono text-[11px]">Latencia (ms)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dirección sobre obras orquestales con metrónomo y acompañamiento. Registra milisegundos de reacción y precisión ante cada entrada.
            </p>
          </div>
        </div>

        {/* Technical Timing */}
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Medición y precisión
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Los cálculos se realizan en tiempo real con MediaPipe Hands y marcas de tiempo de alta resolución (<code className="text-[var(--ui-blue)] font-mono">performance.now()</code>).
          </p>
        </div>

        <div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[var(--ui-forest)] hover:bg-[var(--ui-forest-strong)] text-white dark:text-slate-950 font-semibold text-sm transition-colors"
          >
            Continuar práctica
          </button>
        </div>
      </div>
    </div>
  );
};
