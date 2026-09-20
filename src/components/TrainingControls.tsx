/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SCORE_PIECES, ScorePiece } from '../data/scorePresets';
import { TempoPreset, TrainingMode, AppTheme } from '../types';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface TrainingControlsProps {
  selectedPiece: ScorePiece;
  onSelectPiece: (piece: ScorePiece) => void;
  trainingMode: TrainingMode;
  onChangeMode: (mode: TrainingMode) => void;
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  tempoPreset: TempoPreset;
  onChangeTempoPreset: (preset: TempoPreset) => void;
  theme?: AppTheme;
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  selectedPiece,
  onSelectPiece,
  trainingMode,
  onChangeMode,
  bpm,
  onChangeBpm,
  tempoPreset,
  onChangeTempoPreset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handlePresetClick = (preset: TempoPreset, defaultBpm: number) => {
    onChangeTempoPreset(preset);
    onChangeBpm(defaultBpm);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Ajustes de Partitura y Tempo
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-600">
          {bpm} BPM
        </span>
      </div>

      {/* Mode Selector (Compact Segmented control) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'partitura_score' as TrainingMode, label: 'Partitura' },
          { id: 'sforzando_reflex' as TrainingMode, label: 'Sforzando' },
          { id: 'fermata_stability' as TrainingMode, label: 'Fermata' },
          { id: 'free_practice' as TrainingMode, label: 'Práctica libre' },
        ].map((m) => {
          const isActive = trainingMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Piece Selection List */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">
          Partitura
        </label>
        <div className="space-y-1.5">
          {SCORE_PIECES.map((piece) => {
            const isSelected = piece.id === selectedPiece.id;
            return (
              <button
                key={piece.id}
                onClick={() => onSelectPiece(piece)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-slate-900 dark:text-slate-100 font-medium'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{piece.title}</div>
                  <div className="text-[11px] text-slate-400">{piece.composer}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  {piece.bpm} BPM
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Tempo Adjustments */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          <span>Ajustar tempo y metrónomo</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-3">
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Largo', bpm: 52 },
                { name: 'Andante', bpm: 80 },
                { name: 'Allegro', bpm: 120 },
                { name: 'Presto', bpm: 168 },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => handlePresetClick(p.name as TempoPreset, p.bpm)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    tempoPreset === p.name
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.name} ({p.bpm})
                </button>
              ))}
            </div>

            {/* BPM Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="40"
                max="200"
                value={bpm}
                onChange={(e) => {
                  onChangeBpm(Number(e.target.value));
                  onChangeTempoPreset('Custom');
                }}
                className="w-full accent-cyan-600 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>40 BPM</span>
                <span>200 BPM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

