/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
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
      ? 'border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100'
      : 'border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-900'
  }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ui-border)] bg-[color:var(--ui-surface)]/95 text-[var(--ui-text)] shadow-[var(--ui-shadow)] backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-[1500px] px-3 pt-[max(0.7rem,env(safe-area-inset-top))] sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 border-b border-[var(--ui-border)]/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--ui-gold)]/30 bg-[var(--ui-surface-muted)] text-[var(--ui-blue)] shadow-sm">
              <Music2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--ui-gold)] sm:text-[10px]">
                Melody of Art
              </p>
              <h1 className="truncate text-xl font-bold tracking-tight text-[var(--ui-blue)] dark:text-[var(--ui-text)] sm:text-2xl">
                Melody Motion
              </h1>
              <p className="mt-1 hidden text-[11px] text-[var(--ui-text-muted)] sm:block">
                Movimiento · sonido · representación · aprendizaje
              </p>
            </div>
          </div>

          <div className="hidden gap-2 sm:grid sm:grid-cols-2 lg:flex lg:items-stretch">
            <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-2 lg:min-w-[235px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
                Proyecto pedagógico para
              </p>
              <div className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ui-jade)]" aria-hidden="true" />
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-[var(--ui-text)]">Escuela de Música</p>
                  <p className="text-sm font-bold tracking-wide text-[var(--ui-jade)]">Matiaví · Salinas</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 lg:min-w-[245px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
                Diseño y desarrollo
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--ui-blue)] dark:text-[var(--ui-text)]">A. Owsky</p>
              <p className="mt-0.5 text-[10px] leading-tight text-[var(--ui-text-muted)]">
                Ciencias Integrativas · Bolívar · Ecuador
              </p>
            </section>
          </div>
        </div>

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

          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <div className="min-w-0 truncate text-[10px] leading-tight text-[var(--ui-text-muted)] lg:hidden">
              <span className="font-semibold text-[var(--ui-jade)]">Escuela de Música Matiaví · Salinas</span>
              <span className="mx-1.5">·</span>
              <span>A. Owsky</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleSimulation}
                className={`touch-target inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                  isSimulation
                    ? 'border-[var(--ui-blue)]/20 bg-[var(--ui-blue)]/8 text-[var(--ui-blue)] dark:text-[var(--ui-text)]'
                    : isWhite
                    ? 'border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100'
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
      </div>
    </header>
  );
};
