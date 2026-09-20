/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Camera, Sliders, HelpCircle, Sun, Moon } from 'lucide-react';
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

export const Header: React.FC<HeaderProps> = ({
  activeModuleId,
  onSelectModule,
  isMuted,
  onToggleMute,
  isSimulation,
  onToggleSimulation,
  totalScore,
  streak,
  onShowInfo,
  theme,
  onToggleTheme,
}) => {
  const isWhite = theme === 'white';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-[var(--ui-text)] shadow-[var(--ui-shadow)] transition-colors">
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ui-gold)]" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ui-gold)]">
                Melody of Art
              </p>
              <h1 className="text-lg font-bold tracking-tight text-[var(--ui-blue)] dark:text-[var(--ui-text)]">
                Melody Motion
              </h1>
            </div>
            <span className={`hidden lg:inline text-xs px-2 py-0.5 rounded-md ${
              isWhite ? 'bg-[var(--ui-surface-muted)] text-slate-600' : 'bg-[var(--ui-surface-muted)] text-[var(--ui-text-muted)]'
            }`}>
              Movimiento, sonido y aprendizaje
            </span>
          </div>

          {/* Mobile score badge */}
          <div className="flex md:hidden items-center space-x-1.5 text-xs font-mono font-medium">
            <span className={isWhite ? 'text-slate-500' : 'text-slate-400'}>{totalScore} pts</span>
            {streak > 0 && <span className="text-cyan-600 font-bold">· {streak}🔥</span>}
          </div>
        </div>

        {/* Primary Module Selector (Single clean segmented bar) */}
        <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-1" aria-label="Áreas de aprendizaje">
          <button onClick={() => onSelectModule('instrument')} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-gold)] ${activeModuleId === 'instrument' ? 'bg-[var(--ui-forest)] text-white dark:text-slate-950' : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'}`}>Instrumento</button>
          {MODULES_LIST.map((mod) => {
            const isActive = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-gold)] ${
                  isActive
                    ? 'bg-[var(--ui-forest)] text-white dark:text-slate-950 shadow-sm font-semibold'
                    : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
                }`}
              >
                {mod.title}
              </button>
            );
          })}
        </nav>

        {/* Secondary Actions & State */}
        <div className="flex items-center space-x-2">
          {/* Score Counter (Desktop) */}
          <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono ${
            isWhite ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
          }`}>
            <span className="font-semibold">{totalScore}</span>
            <span className="text-slate-400">pts</span>
            {streak > 0 && <span className="text-cyan-600 font-bold">· {streak}🔥</span>}
          </div>

          {/* Mode Switcher: Camera vs Virtual */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSimulation
                ? isWhite
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
                : isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
            title={isSimulation ? 'Cambiar a cámara web' : 'Cambiar a simulación virtual'}
          >
            {isSimulation ? <Sliders className="w-3.5 h-3.5 text-[var(--ui-blue)]" /> : <Camera className="w-3.5 h-3.5 text-[var(--ui-blue)]" />}
            <span>{isSimulation ? 'Virtual' : 'Cámara'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-colors ${
              isWhite
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                : 'border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-colors ${
              isWhite
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                : 'border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
            title={isWhite ? 'Modo oscuro' : 'Modo claro'}
            aria-label={isWhite ? 'Modo oscuro' : 'Modo claro'}
          >
            {isWhite ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Help / Guide */}
          <button
            onClick={onShowInfo}
            className={`p-1.5 rounded-lg border transition-colors ${
              isWhite
                ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                : 'border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
            title="Guía de uso y metodología"
            aria-label="Guía de uso y metodología"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};


