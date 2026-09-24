/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Camera,
  HelpCircle,
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

const PROJECT_STORIES = [
  {
    eyebrow: 'Melody Motion',
    title: 'Instrumento · Ritmo · Pentagrama · Compás',
    description: 'Cuatro áreas de aprendizaje dentro de una misma interfaz responsiva.',
  },
  {
    eyebrow: 'Diseño y desarrollo',
    title: 'A. Owsky',
    description: 'Ciencias Integrativas · Bolívar · Ecuador.',
  },
  {
    eyebrow: 'Territorio',
    title: 'Salinas · Bolívar · Ecuador',
    description: 'Desarrollado para su exploración pedagógica en la Escuela de Música Matiaví.',
  },
  {
    eyebrow: 'Estado del proyecto',
    title: 'Primera fase demostrativa · 2026',
    description: 'Herramienta educativa en desarrollo y validación progresiva.',
  },
] as const;

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
  const [storyIndex, setStoryIndex] = React.useState(0);
  const [storyPaused, setStoryPaused] = React.useState(false);

  React.useEffect(() => {
    if (storyPaused) return undefined;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setStoryIndex((current) => (current + 1) % PROJECT_STORIES.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [storyPaused]);

  const currentStory = PROJECT_STORIES[storyIndex];

  const utilityButtonClass = `touch-target inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border transition-colors ${
    isWhite
      ? 'border-slate-200 bg-white/75 text-slate-700 hover:bg-slate-100'
      : 'border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-900'
  }`;

  return (
    <header className="border-b border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors">
      <div className="mx-auto max-w-[1500px] px-3 pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-4 lg:px-6">
        <section className="border-b border-[var(--ui-border)]/70 pb-3 text-center sm:pb-4" aria-label="Identidad institucional y del proyecto">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--ui-gold)]/30 bg-[var(--ui-surface-muted)] text-[var(--ui-blue)] shadow-sm sm:h-11 sm:w-11">
              <Music2 className="h-5 w-5" aria-hidden="true" />
            </span>

            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.24em] text-[var(--ui-gold)] sm:text-[9px]">
              Proyecto pedagógico para
            </p>

            <h1 className="mt-0.5 text-[clamp(1.45rem,5vw,2.4rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ui-text)]">
              Escuela de Música
            </h1>
            <p className="mt-1 text-[clamp(1.1rem,4vw,1.75rem)] font-extrabold uppercase tracking-[0.07em] text-[var(--ui-jade)]">
              Matiaví · Salinas
            </p>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--ui-text-muted)] sm:text-xs">
              <span className="h-px w-7 bg-[var(--ui-gold)]/40" aria-hidden="true" />
              <span className="font-semibold uppercase tracking-[0.16em] text-[var(--ui-gold)]">Melody of Art</span>
              <span aria-hidden="true">·</span>
              <strong className="text-sm tracking-tight text-[var(--ui-blue)] dark:text-[var(--ui-text)] sm:text-base">Melody Motion</strong>
              <span className="h-px w-7 bg-[var(--ui-gold)]/40" aria-hidden="true" />
            </div>

            <section
              className="mt-3 w-full max-w-3xl"
              aria-label="Aspectos del proyecto"
              aria-roledescription="carrusel"
              onMouseEnter={() => setStoryPaused(true)}
              onMouseLeave={() => setStoryPaused(false)}
              onFocusCapture={() => setStoryPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setStoryPaused(false);
                }
              }}
            >
              <div
                key={storyIndex}
                className="mm-story-panel grid min-h-[68px] place-items-center rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-2.5 sm:min-h-[72px] sm:px-5"
                aria-live="off"
              >
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.19em] text-[var(--ui-gold)] sm:text-[9px]">
                    {currentStory.eyebrow}
                  </p>
                  <p className="mt-0.5 text-sm font-bold leading-tight text-[var(--ui-text)] sm:text-base">
                    {currentStory.title}
                  </p>
                  <p className="mx-auto mt-1 max-w-2xl text-[10px] leading-relaxed text-[var(--ui-text-muted)] sm:text-xs">
                    {currentStory.description}
                  </p>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1.5" aria-label="Seleccionar aspecto del proyecto">
                {PROJECT_STORIES.map((story, index) => (
                  <button
                    key={story.eyebrow}
                    type="button"
                    onClick={() => setStoryIndex(index)}
                    className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-gold)] ${
                      storyIndex === index
                        ? 'w-6 bg-[var(--ui-jade)]'
                        : 'w-2 bg-[var(--ui-border)] hover:bg-[var(--ui-text-muted)]/50'
                    }`}
                    aria-label={`Mostrar: ${story.eyebrow}`}
                    aria-pressed={storyIndex === index}
                  />
                ))}
              </div>
            </section>
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
