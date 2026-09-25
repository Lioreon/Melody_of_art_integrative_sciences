/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FigureDuration, ScaleNote, AppTheme } from '../types';
import { ledgerLineStepsForStaffStep } from '../data/musicalScaleData';

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

  // Pentagrama en clave de Sol con espacio suficiente para Sol3–Si5.
  const staffWidth = 340;
  const staffHeight = 205;
  const stepSpacing = 8;
  const c4Y = 148;
  const noteX = 214;
  const noteY = c4Y - note.staffLineIndex * stepSpacing;
  const staffSteps = [10, 8, 6, 4, 2]; // Fa5, Re5, Si4, Sol4, Mi4
  const ledgerSteps = ledgerLineStepsForStaffStep(note.staffLineIndex);

  const isOpenHead = figure.id === 'blanca' || figure.id === 'redonda';
  const hasStem = figure.id !== 'redonda';
  const stemDown = note.staffLineIndex >= 6;
  const stemLength = 34;
  const stemX = stemDown ? noteX - 7 : noteX + 7;
  const stemY1 = noteY;
  const stemY2 = stemDown ? noteY + stemLength : noteY - stemLength;

  return (
    <div
      className={`relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-xl px-3 py-5 transition-all sm:px-5 ${
        isWhite ? 'bg-white/85 border border-slate-300' : 'bg-[#081b26] border border-slate-700'
      }`}
    >
      <svg
        width={staffWidth}
        height={staffHeight}
        viewBox={`0 0 ${staffWidth} ${staffHeight}`}
        role="img"
        aria-label={`${note.octaveName}, ${figure.name}, en clave de Sol`}
        className="h-auto w-full max-w-none overflow-visible select-none sm:max-w-[760px]"
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
          x="38"
          y="134"
          fontSize="60"
          fontFamily="serif"
          fill={isWhite ? '#1f3347' : '#e3edf2'}
          textAnchor="middle"
          className="select-none"
        >
          𝄞
        </text>

        <text x="70" y="95" fontSize="15" fontWeight="bold" fontFamily="sans-serif"
          fill={isWhite ? '#526478' : '#aebfca'} textAnchor="middle">4</text>
        <text x="70" y="119" fontSize="15" fontWeight="bold" fontFamily="sans-serif"
          fill={isWhite ? '#526478' : '#aebfca'} textAnchor="middle">4</text>

        {ledgerSteps.map((step) => {
          const y = c4Y - step * stepSpacing;
          return (
            <line
              key={step}
              x1={noteX - 17}
              y1={y}
              x2={noteX + 17}
              y2={y}
              stroke={isPlaying ? '#0284c7' : isWhite ? '#26384b' : '#d5e3ea'}
              strokeWidth="2"
            />
          );
        })}

        {isPlaying && (
          <circle
            cx={noteX}
            cy={noteY}
            r="18"
            fill="rgba(14, 165, 233, 0.25)"
            className="animate-pulse"
          />
        )}

        {hasStem && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={isPlaying ? '#0284c7' : isWhite ? '#0b1f33' : '#f8fafc'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {figure.id === 'corchea' && (
          <path
            d={
              stemDown
                ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 8}, ${stemX + 8} ${stemY2 - 18}`
                : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 8}, ${stemX + 8} ${stemY2 + 18}`
            }
            fill="none"
            stroke={isPlaying ? '#0284c7' : isWhite ? '#0b1f33' : '#f8fafc'}
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
              stroke={isPlaying ? '#0284c7' : isWhite ? '#0b1f33' : '#f8fafc'}
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
              stroke={isPlaying ? '#0284c7' : isWhite ? '#0b1f33' : '#f8fafc'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

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
          stroke={isPlaying ? '#0284c7' : isWhite ? '#0b1f33' : '#f8fafc'}
          strokeWidth={isOpenHead ? '2.5' : '1.5'}
        />
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 text-sm sm:text-base text-slate-500 mt-2">
        <span>Clave de Sol</span>
        <span>•</span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
          {note.octaveName} ({Math.round(note.frequency)} Hz)
        </span>
      </div>
    </div>
  );
};
