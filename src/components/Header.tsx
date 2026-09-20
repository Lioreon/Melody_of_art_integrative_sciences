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
    <header className={`border-b sticky top-0 z-40 px-4 py-2.5 transition-colors shadow-[var(--brand-shadow)] ${
      isWhite
        ? 'bg-[var(--brand-surface-raised)] border-[var(--brand-border)] text-slate-900'
        : 'bg-[var(--brand-surface-raised)] border-[var(--brand-border)] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-gold)]" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-forest)]">
                Melody of Art
              </p>
              <h1 className="text-base font-bold tracking-tight text-[var(--brand-blue)] dark:text-slate-100">
                Melody Motion
              </h1>
            </div>
            <span className={`hidden lg:inline text-xs px-2 py-0.5 rounded-md ${
              isWhite ? 'bg-[#f0eee4] text-slate-600' : 'bg-slate-900 text-slate-400'
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
        <nav className={`flex items-center p-1 rounded-xl border ${
          isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`} aria-label="Módulos de entrenamiento">
          <button onClick={() => onSelectModule('instrument')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeModuleId === 'instrument' ? 'bg-[var(--brand-forest)] text-white dark:text-slate-950' : ''}`}>Instrumento</button>
          {MODULES_LIST.map((mod) => {
            const isActive = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--brand-forest)] text-white dark:text-slate-950 shadow-sm font-semibold'
                    : isWhite
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Módulo {mod.number}
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
            {isSimulation ? <Sliders className="w-3.5 h-3.5 text-[var(--brand-blue)]" /> : <Camera className="w-3.5 h-3.5 text-[var(--brand-blue)]" />}
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


