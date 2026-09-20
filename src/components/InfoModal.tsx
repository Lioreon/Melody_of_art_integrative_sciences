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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-7 max-w-xl w-full shadow-xl space-y-5 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Guía de Módulos Didácticos
            </h2>
            <p className="text-xs text-slate-500">
              Conductor Vision · Visión artificial para el aprendizaje musical
            </p>
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-600">Módulo 1: Figuras y Duración</span>
              <span className="text-slate-400 font-mono text-[11px]">Distancia (X)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detección de distancia física entre las palmas. Cada figura o silencio requiere una apertura específica y mantener la posición durante el tiempo de sostenimiento.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-600">Módulo 2: Pentagrama y Altura</span>
              <span className="text-slate-400 font-mono text-[11px]">Altura (Y)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Relaciona la posición vertical de las palmas con las notas musicales en la Clave de Sol (Do4 a Do5), diferenciando líneas y espacios.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-600">Módulo 3: Partitura y Reacción</span>
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
            Los cálculos se realizan en tiempo real con MediaPipe Hands y marcas de tiempo de alta resolución (<code className="text-cyan-600 font-mono">performance.now()</code>).
          </p>
        </div>

        <div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
          >
            Continuar práctica
          </button>
        </div>
      </div>
    </div>
  );
};


