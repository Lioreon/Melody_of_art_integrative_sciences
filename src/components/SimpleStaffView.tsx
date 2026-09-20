/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FigureDuration, ScaleNote, AppTheme } from '../types';

interface SimpleStaffViewProps {
  note: ScaleNote;
  figure: FigureDuration;
  isPlaying: boolean;
  theme?: AppTheme;
}

export const SimpleStaffView: React.FC<SimpleStaffViewProps> = ({
  note,
  figure,
  isPlaying,
  theme = 'white',
}) => {
  const isWhite = theme === 'white';

  // Pentagram geometry
  const staffWidth = 280;
  const staffHeight = 110;
  const lineSpacing = 14;
  const topStaffLineY = 28; // Line 5 (F5) is at y = 28
  // 5 Lines:
  // Line 5: 28 (Fa5)
  // Line 4: 42 (Re5)
  // Line 3: 56 (Si4)
  // Line 2: 70 (Sol4)
  // Line 1: 84 (Mi4)
  // Re4: space below line 1 = 91
  // Do4: ledger line below line 1 = 98

  // Mapping pitch index (0 = Do4 to 7 = Do5) to Y coordinate
  // Step is lineSpacing / 2 = 7px per diatonic step
  const noteYPositions: Record<string, number> = {
    do4: 98, // Ledger line
    re4: 91, // Space below line 1
    mi4: 84, // Line 1
    fa4: 77, // Space 1
    sol4: 70, // Line 2
    la4: 63, // Space 2
    si4: 56, // Line 3
    do5: 49, // Space 3
  };

  const noteY = noteYPositions[note.id] ?? 70;
  const noteX = 170;

  // Figure styling
  const isOpenHead = figure.id === 'blanca' || figure.id === 'redonda';
  const hasStem = figure.id !== 'redonda';
  // Stem direction: down if note is Si4 or higher (noteY <= 56)
  const stemDown = noteY <= 56;
  const stemLength = 34;

  const stemX = stemDown ? noteX - 7 : noteX + 7;
  const stemY1 = noteY;
  const stemY2 = stemDown ? noteY + stemLength : noteY - stemLength;

  return (
    <div
      className={`relative rounded-xl px-3 py-6 sm:px-5 flex flex-col items-center justify-center transition-all ${
        isWhite ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900 border border-slate-800'
      }`}
    >
      <svg
        width={staffWidth}
        height={staffHeight}
        viewBox={`0 0 ${staffWidth} ${staffHeight}`}
        role="img"
        aria-label={`${note.octaveName}, ${figure.name}, en clave de Sol`}
        className="w-full max-w-[640px] h-auto overflow-visible select-none"
      >
        {/* Staff Lines (5 lines) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = topStaffLineY + i * lineSpacing;
          return (
            <line
              key={i}
              x1="20"
              y1={y}
              x2={staffWidth - 20}
              y2={y}
              stroke={isWhite ? '#94a3b8' : '#475569'}
              strokeWidth="1.5"
            />
          );
        })}

        {/* Treble Clef (Clave de Sol) symbol */}
        <text
          x="35"
          y="78"
          fontSize="48"
          fontFamily="serif"
          fill={isWhite ? '#334155' : '#cbd5e1'}
          textAnchor="middle"
          className="select-none"
        >
          𝄞
        </text>

        {/* Time Signature or Indicator */}
        <text
          x="64"
          y="52"
          fontSize="15"
          fontWeight="bold"
          fontFamily="sans-serif"
          fill={isWhite ? '#64748b' : '#94a3b8'}
          textAnchor="middle"
        >
          4
        </text>
        <text
          x="64"
          y="74"
          fontSize="15"
          fontWeight="bold"
          fontFamily="sans-serif"
          fill={isWhite ? '#64748b' : '#94a3b8'}
          textAnchor="middle"
        >
          4
        </text>

        {/* Ledger line for Do4 */}
        {note.isLedgerLine && (
          <line
            x1={noteX - 16}
            y1={98}
            x2={noteX + 16}
            y2={98}
            stroke={isPlaying ? '#0ea5e9' : isWhite ? '#475569' : '#94a3b8'}
            strokeWidth="2"
          />
        )}

        {/* Active note visual aura if playing */}
        {isPlaying && (
          <circle
            cx={noteX}
            cy={noteY}
            r="18"
            fill="rgba(14, 165, 233, 0.25)"
            className="animate-pulse"
          />
        )}

        {/* Note Stem (Plica) */}
        {hasStem && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={isPlaying ? '#0284c7' : isWhite ? '#0f172a' : '#f8fafc'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Flags (Corchetes) for corchea and semicorchea */}
        {figure.id === 'corchea' && (
          <path
            d={
              stemDown
                ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 8}, ${stemX + 8} ${stemY2 - 18}`
                : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 8}, ${stemX + 8} ${stemY2 + 18}`
            }
            fill="none"
            stroke={isPlaying ? '#0284c7' : isWhite ? '#0f172a' : '#f8fafc'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {figure.id === 'semicorchea' && (
          <>
            <path
              d={
                stemDown
                  ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 6}, ${stemX + 8} ${stemY2 - 14}`
                  : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 6}, ${stemX + 8} ${stemY2 + 14}`
              }
              fill="none"
              stroke={isPlaying ? '#0284c7' : isWhite ? '#0f172a' : '#f8fafc'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={
                stemDown
                  ? `M ${stemX} ${stemY2 - 8} Q ${stemX + 10} ${stemY2 - 14}, ${stemX + 8} ${stemY2 - 22}`
                  : `M ${stemX} ${stemY2 + 8} Q ${stemX + 10} ${stemY2 + 14}, ${stemX + 8} ${stemY2 + 22}`
              }
              fill="none"
              stroke={isPlaying ? '#0284c7' : isWhite ? '#0f172a' : '#f8fafc'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Note Head (Cabeza de nota) */}
        <ellipse
          cx={noteX}
          cy={noteY}
          rx="8"
          ry="6"
          transform={`rotate(-22 ${noteX} ${noteY})`}
          fill={
            isOpenHead
              ? isWhite
                ? '#ffffff'
                : '#0f172a'
              : isPlaying
              ? '#0284c7'
              : isWhite
              ? '#0f172a'
              : '#f8fafc'
          }
          stroke={isPlaying ? '#0284c7' : isWhite ? '#0f172a' : '#f8fafc'}
          strokeWidth={isOpenHead ? '2.5' : '1.5'}
        />
      </svg>

      {/* Subtle note reference label */}
      <div className="flex flex-wrap justify-center items-center gap-2 text-sm sm:text-base text-slate-500 mt-4">
        <span>Clave de Sol</span>
        <span>•</span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
          {note.octaveName} ({Math.round(note.frequency)} Hz)
        </span>
      </div>
    </div>
  );
};
