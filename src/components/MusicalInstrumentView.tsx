/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppTheme, FigureDuration, ScaleNote } from '../types';
import { SimpleStaffView } from './SimpleStaffView';
import { TREBLE_TRAINING_RANGE, MUSICAL_FIGURES } from '../data/musicalScaleData';
import { Play, AlertCircle, Volume2 } from 'lucide-react';

interface MusicalInstrumentViewProps {
  selectedNote: ScaleNote;
  selectedFigure: FigureDuration;
  realDurationSec: number;
  bpm: number;
  trackingLost: boolean;
  isPlaying: boolean;
  playProgress: number; // 0 to 1 during playback
  onPlayNote: () => void;
  separationCm: number;
  avgYNorm: number;
  theme?: AppTheme;
}

export const MusicalInstrumentView: React.FC<MusicalInstrumentViewProps> = ({
  selectedNote,
  selectedFigure,
  realDurationSec,
  bpm,
  trackingLost,
  isPlaying,
  playProgress,
  onPlayNote,
  separationCm,
  avgYNorm,
  theme = 'white',
}) => {
  const isWhite = theme === 'white';

  return (
    <div
      className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 shadow-[var(--ui-shadow)] transition-colors flex flex-col justify-between space-y-6 md:p-6"
    >
      {/* Top Status Header */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              trackingLost
                ? 'bg-amber-500 animate-pulse'
                : 'bg-cyan-500'
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {trackingLost ? 'Seguimiento perdido' : 'Previsualización en tiempo real'}
          </span>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Tempo: <strong className="text-slate-800 dark:text-slate-200">{bpm} BPM</strong>
        </div>
      </div>

      {/* Main Display: Note + Figure */}
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        {/* Note Card */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
            trackingLost
              ? 'opacity-60 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              : isWhite
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            <span>Nota musical (Altura)</span>
            <span className="font-mono text-[11px]">
              Y: {Math.round((1 - avgYNorm) * 100)}%
            </span>
          </div>

          <div className="my-4 flex flex-col items-center justify-center gap-2 text-center">
            <span
              className={`text-6xl sm:text-7xl font-black tracking-tight ${
                isPlaying
                  ? 'text-[var(--music-note-accent)] scale-105'
                  : isWhite
                  ? 'text-slate-900'
                  : 'text-slate-100'
              } transition-transform`}
            >
              {selectedNote.name}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">
              {selectedNote.octaveName}
            </span>
          </div>

          {/* Scale steps visual gauge */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-[repeat(17,minmax(0,1fr))] gap-0.5">
              {TREBLE_TRAINING_RANGE.map((note) => {
                const isActive = note.id === selectedNote.id;
                return (
                  <div
                    key={note.id}
                    title={note.octaveName}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive
                        ? 'bg-[var(--music-note-accent)] h-2'
                        : isWhite
                        ? 'bg-slate-200'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Sol 3 (grave)</span>
              <span>Si 5 (agudo)</span>
            </div>
          </div>
        </div>

        {/* Figure Card */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
            trackingLost
              ? 'opacity-60 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              : isWhite
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            <span>Figura musical (Separación)</span>
            <span className="font-mono text-[11px]">{separationCm} u.</span>
          </div>

          <div className="my-4 flex flex-col items-center gap-3 text-center min-w-0">
            <span className="text-7xl leading-tight font-serif text-[var(--music-rhythm-accent)]">
              {selectedFigure.symbol}
            </span>
            <div>
              <div
                className={`text-[clamp(1.5rem,2.8vw,2.5rem)] leading-tight break-words font-bold ${
                  isWhite ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                {selectedFigure.name}
              </div>
              <div className="text-base text-slate-500 font-mono mt-2">
                {realDurationSec} s ({selectedFigure.beats} {selectedFigure.beats === 1 ? 'pulso' : 'pulsos'})
              </div>
            </div>
          </div>

          {/* Figures range visual gauge */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-5 gap-1">
              {MUSICAL_FIGURES.map((fig) => {
                const isActive = fig.id === selectedFigure.id;
                return (
                  <div
                    key={fig.id}
                    title={fig.name}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive
                        ? 'bg-[var(--music-rhythm-accent)] h-2'
                        : isWhite
                        ? 'bg-slate-200'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Semicorchea (Corta)</span>
              <span>Redonda (Larga)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Staff View (Pentagrama) */}
      <SimpleStaffView
        note={selectedNote}
        figure={selectedFigure}
        isPlaying={isPlaying}
        theme={theme}
      />

      {/* Primary Action Button: Tocar Nota */}
      <div className="mx-auto w-full max-w-3xl space-y-2 pt-1">
        <button
          onClick={onPlayNote}
          disabled={trackingLost || isPlaying}
          aria-label="Tocar nota musical seleccionada"
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center space-x-3 relative overflow-hidden shadow-sm ${
            trackingLost
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              : isPlaying
              ? 'bg-cyan-600 text-white scale-[0.99]'
              : 'bg-[var(--ui-blue)] hover:opacity-90 text-white dark:text-slate-950 cursor-pointer active:scale-[0.98]'
          }`}
        >
          {/* Active progress bar during sound duration */}
          {isPlaying && (
            <div
              className="absolute inset-0 bg-cyan-500/30 transition-all duration-75 origin-left"
              style={{ width: `${Math.min(100, Math.round(playProgress * 100))}%` }}
            />
          )}

          {isPlaying ? (
            <>
              <Volume2 className="w-5 h-5 relative z-10 animate-pulse" />
              <span className="relative z-10 font-mono">
                Sonando: {selectedNote.octaveName} ({realDurationSec}s)
              </span>
            </>
          ) : trackingLost ? (
            <>
              <AlertCircle className="w-5 h-5" />
              <span>Seguimiento perdido · Muestra ambas manos</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Tocar nota ({selectedNote.name} · {selectedFigure.name})</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Presiona la <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]">barra espaciadora</kbd> o pulsa el botón para emitir el sonido.
        </p>
      </div>
    </div>
  );
};
