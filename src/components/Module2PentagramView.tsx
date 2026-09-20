/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useHoldProgress } from '../hooks/useHoldProgress';
import { SimpleStaffView } from './SimpleStaffView';
import { C_MAJOR_SCALE, MUSICAL_FIGURES as INSTRUMENT_FIGURES } from '../data/musicalScaleData';
import confetti from 'canvas-confetti';
import { GALLERY_ITEMS } from '../data/scorePresets';
import { DualPalmState, GalleryItem, PentagramNoteItem, AppTheme } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { Music, Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface Module2PentagramViewProps {
  palmState: DualPalmState;
  onScoreGain: (points: number) => void;
  isSimulation: boolean;
  onSimulatedPositionChange?: (yNorm: number, distCm: number) => void;
  theme?: AppTheme;
}

export const Module2PentagramView: React.FC<Module2PentagramViewProps> = ({
  palmState,
  onScoreGain,
  isSimulation,
  onSimulatedPositionChange,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem>(GALLERY_ITEMS[0]);
  const [noteStepIndex, setNoteStepIndex] = useState<number>(0);
  const [completedGalleryItems, setCompletedGalleryItems] = useState<string[]>([]);
  const [showItemVictoryModal, setShowItemVictoryModal] = useState<boolean>(false);
  const [lastSoundFrequency, setLastSoundFrequency] = useState<number>(0);
  const [showGallery, setShowGallery] = useState<boolean>(false);

  const activeTargetNote: PentagramNoteItem = selectedGalleryItem.notes[noteStepIndex % selectedGalleryItem.notes.length];

  // Derive current Y position from palms center
  const averageYNorm = palmState.leftPalm && palmState.rightPalm
    ? (palmState.leftPalm.center.y + palmState.rightPalm.center.y) / 2
    : 0.5;

  // Map Y-position (0.1 to 0.85) to standard 8 musical notes
  const mapYToNoteName = (y: number): { noteName: string; spanishNote: string; freq: number; yNorm: number } => {
    if (y < 0.25) return { noteName: 'Do5', spanishNote: 'Do5', freq: 523.25, yNorm: 0.18 };
    if (y < 0.33) return { noteName: 'Si4', spanishNote: 'Si4', freq: 493.88, yNorm: 0.28 };
    if (y < 0.41) return { noteName: 'La4', spanishNote: 'La4', freq: 440.00, yNorm: 0.37 };
    if (y < 0.50) return { noteName: 'Sol4', spanishNote: 'Sol4', freq: 392.00, yNorm: 0.46 };
    if (y < 0.59) return { noteName: 'Fa4', spanishNote: 'Fa4', freq: 349.23, yNorm: 0.55 };
    if (y < 0.68) return { noteName: 'Mi4', spanishNote: 'Mi4', freq: 329.63, yNorm: 0.64 };
    if (y < 0.77) return { noteName: 'Re4', spanishNote: 'Re4', freq: 293.66, yNorm: 0.73 };
    return { noteName: 'Do4', spanishNote: 'Do4', freq: 261.63, yNorm: 0.82 };
  };

  const currentDetectedNote = mapYToNoteName(averageYNorm);

  // Check alignment with active target note in scale/song
  const isPitchMatched = currentDetectedNote.noteName === activeTargetNote.noteName;
  const isDistanceMatched = Math.abs(palmState.distanceCm - activeTargetNote.targetDistanceCm) <= 12;
  const hasBothHands = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const isTargetMatched = hasBothHands && isPitchMatched && isDistanceMatched;

  // Sound feedback on note change
  useEffect(() => {
    if (hasBothHands && currentDetectedNote.freq !== lastSoundFrequency) {
      audioSynthesizer.playPitchNote(currentDetectedNote.freq, 0.3);
      setLastSoundFrequency(currentDetectedNote.freq);
    }
  }, [currentDetectedNote.freq, lastSoundFrequency, hasBothHands]);

  const [holdProgress, setHoldProgress] = useHoldProgress(
    `${selectedGalleryItem.id}:${noteStepIndex}`, isTargetMatched && !showItemVictoryModal,
    activeTargetNote.durationBeats * 60000 / selectedGalleryItem.bpm,
    () => advanceToNextNote());

  const advanceToNextNote = () => {
    audioSynthesizer.playHitSound(95);
    onScoreGain(50);

    const nextIndex = noteStepIndex + 1;
    if (nextIndex >= selectedGalleryItem.notes.length) {
      triggerFullGalleryCompletion();
    } else {
      setNoteStepIndex(nextIndex);
      setHoldProgress(0);
      if (isSimulation && onSimulatedPositionChange) {
        const nextNote = selectedGalleryItem.notes[nextIndex];
        onSimulatedPositionChange(nextNote.targetHeightYNorm, nextNote.targetDistanceCm);
      }
    }
  };

  const triggerFullGalleryCompletion = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (e) {}

    audioSynthesizer.playHitSound(100);
    onScoreGain(300);

    if (!completedGalleryItems.includes(selectedGalleryItem.id)) {
      setCompletedGalleryItems((prev) => [...prev, selectedGalleryItem.id]);
    }

    setShowItemVictoryModal(true);
  };

  const handleSelectGalleryItem = (item: GalleryItem) => {
    setSelectedGalleryItem(item);
    setNoteStepIndex(0);
    setHoldProgress(0);
    setShowItemVictoryModal(false);
    if (isSimulation && onSimulatedPositionChange && item.notes.length > 0) {
      onSimulatedPositionChange(item.notes[0].targetHeightYNorm, item.notes[0].targetDistanceCm);
    }
  };

  return (
    <div className="space-y-4">
      {/* Victory Celebration Notice */}
      {showItemVictoryModal && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>¡Obra completada: <strong>{selectedGalleryItem.title}</strong>! +300 pts</span>
          </div>
          <button
            onClick={() => {
              setShowItemVictoryModal(false);
              setNoteStepIndex(0);
              setHoldProgress(0);
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir</span>
          </button>
        </div>
      )}

      {/* Main Pentagram Visualizer Card */}
      <div className={`border rounded-2xl p-5 md:p-6 space-y-4 transition-colors ${
        isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header: Song Info & Target Note Summary */}
        <div className="flex flex-col items-center text-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedGalleryItem.category === 'escala' ? 'Escala' : 'Melodía'}
              </span>
              <span className="text-xs text-slate-400">
                Nota {noteStepIndex + 1} de {selectedGalleryItem.notes.length}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
              {selectedGalleryItem.title}
            </h2>
          </div>

          {/* Active Target Note Badge */}
          <div className="flex flex-wrap justify-center items-stretch gap-3 w-full">
            <div className={`px-5 py-4 rounded-xl border text-center min-w-0 ${
              isPitchMatched
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Nota meta</div>
              <div className="text-4xl sm:text-5xl font-bold mt-2">{activeTargetNote.spanishNote}</div>
            </div>

            <div className={`px-5 py-4 rounded-xl border text-center min-w-0 ${
              isDistanceMatched
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Figura musical</div>
              <div className="text-3xl sm:text-4xl font-bold mt-2">{activeTargetNote.figureName}</div>
            </div>
          </div>
        </div>

        {/* Status prompt */}
        <div className="flex flex-col items-center gap-2 text-center text-sm">
          <span className="text-slate-500">
            {isTargetMatched
              ? '¡Alineación correcta! Sosteniendo nota...'
              : `Mueve la mano en Y hacia ${activeTargetNote.spanishNote} y ajusta palmas a ${activeTargetNote.targetDistanceCm} cm`}
          </span>
          <span className="font-mono font-bold text-cyan-600">
            {Math.round(holdProgress)}%
          </span>
        </div>

        <SimpleStaffView
          note={C_MAJOR_SCALE.find(note => note.id === activeTargetNote.noteName.toLowerCase()) ?? C_MAJOR_SCALE[0]}
          figure={INSTRUMENT_FIGURES.find(figure => figure.name === activeTargetNote.figureName) ?? INSTRUMENT_FIGURES[2]}
          isPlaying={isTargetMatched} theme={theme} />
        <p className="text-center text-lg text-slate-600 dark:text-slate-300">
          {activeTargetNote.durationBeats} {activeTargetNote.durationBeats === 1 ? 'pulso' : 'pulsos'} · Nota {noteStepIndex + 1} de {selectedGalleryItem.notes.length}
        </p>
        <details className="space-y-3">
          <summary className="cursor-pointer text-center text-sm text-slate-500">Ver secuencia completa</summary>
        {/* Interactive SVG Pentagram Staff */}
        <div className={`w-full h-64 rounded-xl border relative flex items-center px-4 overflow-x-auto ${
          isWhite ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <svg role="img" aria-label="Secuencia de notas de la obra" className="h-[240px] shrink-0 overflow-visible" style={{ width: Math.max(820, selectedGalleryItem.notes.length * 70 + 210) }} viewBox={`0 0 ${Math.max(820, selectedGalleryItem.notes.length * 70 + 210)} 200`}>
            {/* 5 Standard Staff Lines (y = 44, 68, 92, 116, 140) */}
            {[44, 68, 92, 116, 140].map((y, idx) => {
              const lineNum = 5 - idx;
              const isSolLine = lineNum === 2;
              return (
                <g key={idx}>
                  <line
                    x1="60"
                    y1={y}
                    x2={Math.max(820, selectedGalleryItem.notes.length * 70 + 210) - 40}
                    y2={y}
                    stroke={isSolLine ? '#0ea5e9' : (isWhite ? '#cbd5e1' : '#334155')}
                    strokeWidth={isSolLine ? '2' : '1.2'}
                  />
                  <text x="50" y={y + 4} textAnchor="end" fill={isWhite ? '#94a3b8' : '#64748b'} fontSize="11" fontWeight="600">
                    L{lineNum}
                  </text>
                </g>
              );
            })}

            {/* Clef indicator */}
            <text x="12" y="128" fill={isWhite ? '#0284c7' : '#38bdf8'} fontSize="52" fontFamily="serif" fontWeight="bold">
              𝄞
            </text>

            {/* Melody Sequence Notes on Staff */}
            {selectedGalleryItem.notes.map((n, idx) => {
              const targetY = 164 - n.staffLineIndex * 12;
              const cx = 110 + idx * 70;
              const isCurrentStep = idx === noteStepIndex;

              return (
                <g key={n.id}>
                  {/* Ledger Line for Do4 */}
                  {n.staffLineIndex === 0 && (
                    <line x1={cx - 18} y1={targetY} x2={cx + 18} y2={targetY} stroke={isWhite ? '#64748b' : '#94a3b8'} strokeWidth="2" />
                  )}

                  <circle
                    cx={cx}
                    cy={targetY}
                    r={isCurrentStep ? 18 : 12}
                    fill={isCurrentStep ? (isTargetMatched ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.2)') : 'transparent'}
                    stroke={isCurrentStep ? (isTargetMatched ? '#10b981' : '#0ea5e9') : (isWhite ? '#94a3b8' : '#475569')}
                    strokeWidth={isCurrentStep ? 2.5 : 1.5}
                  />

                  <text x={cx} y={targetY + 5} textAnchor="middle" fill={isCurrentStep ? '#0ea5e9' : (isWhite ? '#64748b' : '#94a3b8')} fontSize="16" fontWeight="bold">
                    {n.figureSymbol}
                  </text>

                  <text x={cx} y={targetY + 28} textAnchor="middle" fill={isCurrentStep ? (isWhite ? '#0f172a' : '#f8fafc') : '#94a3b8'} fontSize="11" fontWeight="600">
                    {n.spanishNote}
                  </text>
                </g>
              );
            })}

            {/* User Live Pitch Hand Cursor */}
            {(() => {
              const liveLineIdx = Math.max(0, Math.min(7, 7 - Math.round(averageYNorm * 7)));
              const liveY = 164 - liveLineIdx * 12;

              return (
                <g transform={`translate(${Math.max(820, selectedGalleryItem.notes.length * 70 + 210) - 60}, ${liveY})`}>
                  {liveLineIdx === 0 && (
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#0ea5e9" strokeWidth="2" />
                  )}
                  <circle
                    r="16"
                    fill={isTargetMatched ? '#10b981' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                    Tú
                  </text>
                  <text y="-20" textAnchor="middle" fill={isTargetMatched ? '#10b981' : '#0ea5e9'} fontSize="11" fontWeight="bold">
                    {currentDetectedNote.spanishNote}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        </details>

        {/* Hold Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isTargetMatched ? 'bg-emerald-500' : 'bg-cyan-600'
            }`}
            style={{ width: `${holdProgress}%` }}
          />
        </div>

        {/* Live Detected Values Summary (compact) */}
        <div className="flex flex-wrap justify-center gap-3 text-center text-sm text-slate-500 pt-1">
          <div>
            Entonación actual: <strong className={isPitchMatched ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}>{currentDetectedNote.spanishNote}</strong> ({Math.round(currentDetectedNote.freq)} Hz)
          </div>
          <div>
            Apertura actual: <strong className={isDistanceMatched ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}>{palmState.distanceCm} cm</strong> (Meta: {activeTargetNote.targetDistanceCm} cm)
          </div>
        </div>

        {/* Quick simulation align helper */}
        {isSimulation && onSimulatedPositionChange && (
          <div className="flex justify-center pt-1">
            <button
              onClick={() => onSimulatedPositionChange(activeTargetNote.targetHeightYNorm, activeTargetNote.targetDistanceCm)}
              className="text-xs text-cyan-600 hover:underline font-medium"
            >
              Alinear simulación a {activeTargetNote.spanishNote} ({activeTargetNote.targetDistanceCm} cm)
            </button>
          </div>
        )}

        {/* Collapsible: Select Song / Scale Gallery */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            <span className="flex items-center space-x-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-600" />
              <span>Cambiar obra o escala ({GALLERY_ITEMS.length} disponibles)</span>
            </span>
            {showGallery ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showGallery && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              {GALLERY_ITEMS.map((item) => {
                const isSelected = item.id === selectedGalleryItem.id;
                const isDone = completedGalleryItems.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectGalleryItem(item)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30'
                        : isWhite
                        ? 'border-slate-200 hover:bg-slate-50'
                        : 'border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="uppercase">{item.category}</span>
                      {isDone && <span className="text-emerald-500 font-bold">Completado ✓</span>}
                    </div>
                    <div className="text-xs font-semibold mt-1">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.notes.length} notas</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

