/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ScorePiece } from '../data/scorePresets';
import { DualPalmState, ScoreCue } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ScoreVisualizerProps {
  activePiece: ScorePiece;
  currentBeat: number;
  currentMeasure: number;
  activeCue: ScoreCue | null;
  palmState: DualPalmState;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetScore: () => void;
  msToNextCue: number;
}

export const ScoreVisualizer: React.FC<ScoreVisualizerProps> = ({
  activePiece,
  currentBeat,
  currentMeasure,
  activeCue,
  palmState,
  isPlaying,
  onTogglePlay,
  onResetScore,
  msToNextCue,
}) => {
  const staffCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render animated staff canvas with scrolling beats and target distance curve
  useEffect(() => {
    const canvas = staffCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Musical Staff Lines (5 horizontal lines)
    const staffYStart = 90;
    const lineSpacing = 34;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      const y = staffYStart + i * lineSpacing;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Clef Indicator Icon
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 76px serif';
    ctx.fillText('𝄞', 12, staffYStart + 104);

    // Time Signature
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px ui-sans-serif, system-ui';
    ctx.fillText(activePiece.timeSignature, 50, staffYStart + 50);

    // Draw Beat Bar Markers
    const beatWidth = (w - 120) / 16;
    const totalBeats = 16;

    for (let b = 1; b <= totalBeats; b++) {
      const x = 70 + b * beatWidth;
      const isCurrent = b === currentBeat;

      // Bar Line
      ctx.beginPath();
      ctx.strokeStyle = isCurrent ? '#0ea5e9' : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.moveTo(x, staffYStart - 10);
      ctx.lineTo(x, staffYStart + lineSpacing * 4 + 10);
      ctx.stroke();

      // Beat Number
      ctx.fillStyle = isCurrent ? '#0ea5e9' : '#64748b';
      ctx.font = isCurrent ? 'bold 20px monospace' : '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`b${b}`, x, staffYStart - 14);
    }

    // Active Conductor Playhead Cursor
    const cursorX = 70 + currentBeat * beatWidth;
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(cursorX, 10);
    ctx.lineTo(cursorX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Target Distance Band (Target Corridor)
    const targetY = activeCue ? h - (activeCue.targetDistanceCm / 100) * (h - 80) - 20 : h / 2;
    const marginY = activeCue ? (activeCue.toleranceMarginCm / 100) * (h - 80) : 15;

    ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.fillRect(80, targetY - marginY, w - 90, marginY * 2);

    ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, targetY - marginY);
    ctx.lineTo(w, targetY - marginY);
    ctx.moveTo(80, targetY + marginY);
    ctx.lineTo(w, targetY + marginY);
    ctx.stroke();

    // Draw Actual User Palm Distance Dot on Playhead
    const userY = h - (palmState.distanceCm / 100) * (h - 80) - 20;
    ctx.beginPath();
    ctx.arc(cursorX, userY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();
  }, [activePiece, currentBeat, activeCue, palmState]);

  return (
    <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 shadow-[var(--ui-shadow)] space-y-4">
      {/* Top Controls & Piece Info */}
      <div className="flex flex-col items-center text-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{activePiece.title}</h2>
            <span className="text-xs text-slate-500">· {activePiece.composer}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activePiece.bpm} BPM ({activePiece.timeSignature}) · {activePiece.difficulty}
          </p>
        </div>

        {/* Primary Action Button: Play / Pause */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              isPlaying
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                : 'bg-cyan-600 text-white hover:bg-cyan-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
          </button>

          <button
            onClick={onResetScore}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            title="Reiniciar"
            aria-label="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Staff Canvas Display */}
      <div className="relative bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2">
        <canvas
          ref={staffCanvasRef}
          width={1000}
          height={360}
          role="img" aria-label="Pentagrama y seguimiento del compás" className="w-full h-auto"
        />

        {/* Beat & Measure Counter */}
        <div className="flex flex-wrap justify-center items-center space-x-3 text-xs bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
          <span className="text-slate-500">Compás <strong className="font-mono text-slate-900 dark:text-slate-100">{currentMeasure}</strong></span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">Tiempo <strong className="font-mono text-cyan-600">{currentBeat}</strong></span>
        </div>
      </div>

      {/* Active Cue & Reaction Details */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center text-center gap-3">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Gesto actual</div>
            <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-2">
              {activeCue ? activeCue.title : 'Siguiendo compás...'}
            </div>
          </div>
          {activeCue && (
            <div className="text-center font-mono">
              <span className="text-xs text-slate-500">Meta: </span>
              <span className="font-bold text-cyan-600">{activeCue.targetDistanceCm} cm</span>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center text-center gap-3 sm:w-48">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Próximo ataque</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {isPlaying ? (msToNextCue > 0 ? `${msToNextCue} ms` : 'En curso') : 'En pausa'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

