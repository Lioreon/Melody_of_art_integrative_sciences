/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Building2,
  Camera,
  HelpCircle,
  MapPin,
  Moon,
  Music2,
  Sliders,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MODULES_LIST } from '../data/scorePresets';
import { AppTheme } from '../types';

interface HeaderProps {
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isSimulation: boolean;
  onToggleSimulation: () => void;
  totalScore: number;
  streak: number;
  onShowInfo: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

const LEARNING_AREAS = [
  { id: 'instrument', title: 'Instrumento', index: '01' },
  ...MODULES_LIST.map((mod, index) => ({
    id: mod.id,
    title: mod.title,
    index: String(index + 2).padStart(2, '0'),
  })),
];

export const Header: React.FC<HeaderProps> = ({
  activeModuleId,
  onSelectModule,
  isMuted,
  onToggleMute,
  isSimulation,
  onToggleSimulation,
  onShowInfo,
  theme,
  onToggleTheme,
}) => {
  const isWhite = theme === 'white';

  const utilityButtonClass = `touch-target inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border transition-colors ${
    isWhite
      ? 'border-slate-200 bg-white/75 text-slate-700 hover:bg-slate-100'
      : 'border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-900'
  }`;

  return (
    <header className="border-b border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors">
      <div className="mx-auto max-w-[1500px] px-3 pt-[max(0.7rem,env(safe-area-inset-top))] sm:px-4 lg:px-6">
        <section
          className="grid gap-3 border-b border-[var(--ui-border)]/70 pb-3 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] md:items-center md:gap-5 md:pb-4"
          aria-label="Identidad institucional y del proyecto"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-3 md:border-0 md:bg-transparent md:px-0 md:py-1">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ui-gold)]/30 bg-[var(--ui-surface)] text-[var(--ui-gold)] shadow-sm sm:h-12 sm:w-12">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--ui-gold)] sm:text-[9px]">
                Proyecto pedagógico para
              </p>
              <h1 className="mt-0.5 text-[clamp(1.2rem,4vw,2rem)] font-extrabold leading-none tracking-[-0.025em] text-[var(--ui-text)]">
                Escuela de Música
              </h1>
              <p className="mt-1 text-[clamp(0.95rem,3.2vw,1.4rem)] font-extrabold uppercase tracking-[0.06em] text-[var(--ui-jade)]">
                Matiaví · Salinas
              </p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-[var(--ui-text-muted)] sm:text-[10px]">
                <MapPin className="h-3 w-3 shrink-0 text-[var(--ui-jade)]" aria-hidden="true" />
                Salinas · Bolívar · Ecuador
              </p>
            </div>
          </div>

          <div className="hidden h-full min-h-20 bg-[var(--ui-border)] md:block" aria-hidden="true" />

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-3 md:border-0 md:bg-transparent md:px-0 md:py-1">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ui-jade)]/30 bg-[var(--ui-surface)] text-[var(--ui-blue)] shadow-sm sm:h-12 sm:w-12">
              <Music2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--ui-gold)] sm:text-[9px]">
                Melody of Art
              </p>
              <h2 className="mt-0.5 text-[clamp(1.2rem,4vw,2rem)] font-extrabold leading-none tracking-[-0.025em] text-[var(--ui-blue)] dark:text-[var(--ui-text)]">
                Melody Motion
              </h2>
              <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-[var(--ui-text-muted)] sm:text-xs">
                Interfaz pedagógica musical basada en movimiento, sonido, representación y aprendizaje.
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-[var(--ui-text-muted)] sm:text-[10px]">
                <span className="font-semibold uppercase tracking-[0.12em] text-[var(--ui-gold)]">Diseño y desarrollo</span>
                <span className="mx-1">·</span>
                <strong className="text-[var(--ui-blue)] dark:text-[var(--ui-text)]">A. Owsky</strong>
                <span className="mx-1">·</span>
                Ciencias Integrativas
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 py-2.5 lg:flex-row lg:items-center lg:justify-between">
          <nav
            className="mm-module-nav grid grid-cols-4 gap-1 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-1"
            aria-label="Áreas de aprendizaje"
          >
            {LEARNING_AREAS.map((area) => {
              const isActive = area.id === activeModuleId;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectModule(area.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`touch-target min-w-0 rounded-xl px-2 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-gold)] sm:px-4 ${
                    isActive
                      ? 'bg-[var(--ui-forest)] text-white shadow-sm dark:text-slate-950'
                      : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface)] hover:text-[var(--ui-text)]'
                  }`}
                >
                  <span className="hidden text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70 sm:block">
                    {area.index}
                  </span>
                  <span className="block truncate text-[11px] font-semibold sm:text-sm">{area.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onToggleSimulation}
              className={`touch-target inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                isSimulation
                  ? 'border-[var(--ui-blue)]/20 bg-[var(--ui-blue)]/8 text-[var(--ui-blue)] dark:text-[var(--ui-text)]'
                  : isWhite
                  ? 'border-slate-200 bg-white/75 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-900'
              }`}
              title={isSimulation ? 'Cambiar a cámara web' : 'Cambiar a simulación virtual'}
            >
              {isSimulation
                ? <Sliders className="h-4 w-4" aria-hidden="true" />
                : <Camera className="h-4 w-4" aria-hidden="true" />}
              <span>{isSimulation ? 'Virtual' : 'Cámara'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className={utilityButtonClass}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted
                ? <VolumeX className="h-4 w-4" aria-hidden="true" />
                : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className={utilityButtonClass}
              title={isWhite ? 'Modo oscuro' : 'Modo claro'}
              aria-label={isWhite ? 'Modo oscuro' : 'Modo claro'}
            >
              {isWhite
                ? <Moon className="h-4 w-4" aria-hidden="true" />
                : <Sun className="h-4 w-4" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={onShowInfo}
              className={utilityButtonClass}
              title="Guía de uso y metodología"
              aria-label="Guía de uso y metodología"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
