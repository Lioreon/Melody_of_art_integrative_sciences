/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { AppTheme, FigureDuration, ScaleNote } from '../types';
import { ledgerLineStepsForStaffStep } from '../data/musicalScaleData';

interface GuidedStaffViewProps {
  targetNote: ScaleNote;
  targetFigure: FigureDuration;
  currentNote: ScaleNote;
  currentFigure: FigureDuration;
  matched: boolean;
  theme?: AppTheme;
}

export const GuidedStaffView: React.FC<GuidedStaffViewProps> = ({
  targetNote,
  targetFigure,
  currentNote,
  currentFigure,
  matched,
  theme = 'white',
}) => {
  const isWhite = theme === 'white';
  const staffWidth = 340;
  const staffHeight = 210;
  const stepSpacing = 8;
  const c4Y = 150;
  const staffSteps = [10, 8, 6, 4, 2];
  const targetX = 182;
  const currentX = 266;

  const renderNote = (
    note: ScaleNote,
    figure: FigureDuration,
    x: number,
    color: string,
    label: string,
    strong = false,
  ) => {
    const y = c4Y - note.staffLineIndex * stepSpacing;
    const openHead = figure.id === 'blanca' || figure.id === 'redonda';
    const hasStem = figure.id !== 'redonda';
    const stemDown = note.staffLineIndex >= 6;
    const stemLength = 34;
    const stemX = stemDown ? x - 7 : x + 7;
    const stemY2 = stemDown ? y + stemLength : y - stemLength;

    return (
      <g key={label}>
        {ledgerLineStepsForStaffStep(note.staffLineIndex).map((step) => {
          const ledgerY = c4Y - step * stepSpacing;
          return (
            <line
              key={step}
              x1={x - 18}
              y1={ledgerY}
              x2={x + 18}
              y2={ledgerY}
              stroke={color}
              strokeWidth={strong ? 2.4 : 2}
              opacity={strong ? 1 : 0.85}
            />
          );
        })}

        {strong && (
          <circle cx={x} cy={y} r="18" fill={matched ? 'rgba(16,185,129,0.20)' : 'rgba(14,165,233,0.16)'} />
        )}

        {hasStem && (
          <line
            x1={stemX}
            y1={y}
            x2={stemX}
            y2={stemY2}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {(figure.id === 'corchea' || figure.id === 'semicorchea') && (
          <>
            <path
              d={
                stemDown
                  ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 8}, ${stemX + 8} ${stemY2 - 18}`
                  : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 8}, ${stemX + 8} ${stemY2 + 18}`
              }
              fill="none"
              stroke={color}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {figure.id === 'semicorchea' && (
              <path
                d={
                  stemDown
                    ? `M ${stemX} ${stemY2 - 8} Q ${stemX + 10} ${stemY2 - 14}, ${stemX + 8} ${stemY2 - 22}`
                    : `M ${stemX} ${stemY2 + 8} Q ${stemX + 10} ${stemY2 + 14}, ${stemX + 8} ${stemY2 + 22}`
                }
                fill="none"
                stroke={color}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            )}
          </>
        )}

        <ellipse
          cx={x}
          cy={y}
          rx="8"
          ry="6"
          transform={`rotate(-22 ${x} ${y})`}
          fill={openHead ? (isWhite ? '#ffffff' : '#0f172a') : color}
          stroke={color}
          strokeWidth={openHead ? 2.6 : 1.5}
        />

        <text x={x} y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
          {label}
        </text>
        <text x={x} y="39" textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>
          {note.octaveName}
        </text>
      </g>
    );
  };

  const targetColor = isWhite ? '#8a5a0a' : '#f6d477';
  const currentColor = matched ? '#059669' : (isWhite ? '#0369a1' : '#55d8ee');

  return (
    <div className={`rounded-xl border px-2 py-4 sm:px-5 ${
      isWhite ? 'border-slate-300 bg-white/85' : 'border-slate-700 bg-[#081b26]'
    }`}>
      <div className="mb-3 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Guía visual paralela
        </div>
        <p className="mt-1 text-sm text-slate-500">
          La nota META permanece fija; la nota TÚ se desplaza con la altura de tus manos.
        </p>
      </div>

      <svg
        width={staffWidth}
        height={staffHeight}
        viewBox={`0 0 ${staffWidth} ${staffHeight}`}
        role="img"
        aria-label={`Meta ${targetNote.octaveName}; nota actual ${currentNote.octaveName}`}
        className="mx-auto h-auto w-full max-w-none overflow-visible select-none sm:max-w-[760px]"
      >
        {staffSteps.map((staffStep) => {
          const y = c4Y - staffStep * stepSpacing;
          return (
            <line
              key={staffStep}
              x1="20"
              y1={y}
              x2={staffWidth - 20}
              y2={y}
              stroke={isWhite ? '#526478' : '#9fb5c2'}
              strokeWidth="1.8"
            />
          );
        })}

        <text
          x="40"
          y="120"
          fontSize="60"
          fontFamily="serif"
          fill={isWhite ? '#1f3347' : '#e3edf2'}
          textAnchor="middle"
        >
          𝄞
        </text>

        <text x="72" y="86" fontSize="15" fontWeight="bold" fill={isWhite ? '#526478' : '#aebfca'} textAnchor="middle">4</text>
        <text x="72" y="108" fontSize="15" fontWeight="bold" fill={isWhite ? '#526478' : '#aebfca'} textAnchor="middle">4</text>

        <line
          x1={(targetX + currentX) / 2}
          y1="48"
          x2={(targetX + currentX) / 2}
          y2="162"
          stroke={isWhite ? '#cbd5e1' : '#47606b'}
          strokeDasharray="4 5"
        />

        {renderNote(targetNote, targetFigure, targetX, targetColor, 'META')}
        {renderNote(currentNote, currentFigure, currentX, currentColor, 'TÚ', true)}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-3 text-center text-xs sm:text-sm">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <span className="font-semibold text-amber-600 dark:text-amber-300">Meta:</span>{' '}
          <span className="text-slate-600 dark:text-slate-300">{targetNote.octaveName} · {targetFigure.name}</span>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${
          matched
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-cyan-500/20 bg-cyan-500/5'
        }`}>
          <span className={`font-semibold ${matched ? 'text-emerald-600 dark:text-emerald-300' : 'text-cyan-600 dark:text-cyan-300'}`}>
            Tú:
          </span>{' '}
          <span className="text-slate-600 dark:text-slate-300">{currentNote.octaveName} · {currentFigure.name}</span>
        </div>
      </div>
    </div>
  );
};
