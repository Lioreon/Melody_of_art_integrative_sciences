/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { InstrumentPanel } from './components/InstrumentPanel';
import { VideoSourceSelector } from './components/VideoSourceSelector';
import { trackingState, SEPARATION_SCALE } from './services/trackingGeometry';
import type { TrackingDiagnostics, TrackingModeType } from './types';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ScoreVisualizer } from './components/ScoreVisualizer';
const ReactionMetrics = lazy(() => import('./components/ReactionMetrics').then(module => ({ default: module.ReactionMetrics })));
import { TrainingControls } from './components/TrainingControls';
import { SessionReport } from './components/SessionReport';
import { InfoModal } from './components/InfoModal';
import { InstitutionalSignature } from './components/InstitutionalSignature';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { BodyCalibrationPanel } from './components/BodyCalibrationPanel';
import { LearningRankingView } from './components/LearningRankingView';

import { Module1FiguresView } from './components/Module1FiguresView';
import { Module2PentagramView } from './components/Module2PentagramView';
import { CompasAccordionView } from './components/CompasAccordionView';

import { SCORE_PIECES, ScorePiece } from './data/scorePresets';
import { AppTheme, BodyCalibration, CameraStageTarget, DualPalmState, ReactionAttempt, ScoreCue, SessionStats, TempoPreset, TrainingMode } from './types';
import { HandTracker } from './services/handTracker';
import { audioSynthesizer } from './services/audioSynthesizer';
import type { InstrumentTimbre } from './services/instrumentSamples';
import {
  loadInstrumentTimbre,
  loadLiveSoundFeedback,
  saveInstrumentTimbre,
  saveLiveSoundFeedback,
} from './services/userPreferences';
import {
  applyBodyCalibration,
  loadBodyCalibration,
  musicalOpeningToRaw,
  musicalYToRaw,
  saveBodyCalibration,
} from './services/bodyCalibration';
import { deriveCameraStageState } from './services/cameraStage';
import {
  EMPTY_LEARNING_SCORE,
  addLearningPoints,
  isRankingUnlocked,
  totalLearningPoints,
  type LearningGameArea,
} from './services/learningGame';

type CompasExperience = 'accordion' | 'direction';

const AREA_COPY: Record<string, { title: string; description: string }> = {
  instrument: {
    title: 'Instrumento',
    description: 'Explora cómo la altura conjunta de tus manos recorre de Sol3 a Si5 y cómo su apertura horizontal determina la figura musical.',
  },
  module_1_figures_duration: {
    title: 'Ritmo',
    description: 'Relaciona apertura, figura y duración mediante exploración, retos de una figura y secuencias variables con vocabulario progresivo.',
  },
  module_2_pentagram_height: {
    title: 'Pentagrama',
    description: 'Relaciona altura y apertura con notas, figuras y secuencias, incluyendo posiciones por debajo y por encima del pentagrama.',
  },
  module_3_orchestra_score: {
    title: 'Compás',
    description: 'Integra apertura, duración y pulso en un acordeón corporal; conserva la dirección experimental como nivel posterior.',
  },
  ranking: {
    title: 'Ranking',
    description: 'Resume los puntos obtenidos en los modos de juego de Ritmo y Pentagrama dentro de esta sesión.',
  },
};

export default function App() {
  // Navigation & Modules
  const [activeModuleId, setActiveModuleId] = useState<string>('instrument');
  const [theme, setTheme] = useState<AppTheme>('white');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [compasExperience, setCompasExperience] = useState<CompasExperience>('accordion');
  const [learningScore, setLearningScore] = useState(EMPTY_LEARNING_SCORE);
  const [bodyCalibration, setBodyCalibration] = useState<BodyCalibration | null>(() => loadBodyCalibration());
  const [cameraStageTarget, setCameraStageTarget] = useState<CameraStageTarget | null>(null);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'white' ? 'dark_cyan' : 'white'));
  };


  // Audio & Camera Mode
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [instrumentTimbre, setInstrumentTimbre] = useState<InstrumentTimbre>(() => loadInstrumentTimbre());
  const [liveSoundFeedback, setLiveSoundFeedback] = useState<boolean>(() => loadLiveSoundFeedback());
  const [isSimulation, setIsSimulation] = useState<boolean>(true);
  const [trackingMode, setTrackingMode] = useState<TrackingModeType>('hands');
  const [colors, setColors] = useState({ color1Hex: '#ef4444', color2Hex: '#06b6d4', tolerance: 50 });
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [cameraDeviceId, setCameraDeviceId] = useState('');
  const [cameraMessage, setCameraMessage] = useState('');
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraListRevision, setCameraListRevision] = useState(0);
  const [trackingDiagnostics, setTrackingDiagnostics] = useState<TrackingDiagnostics>({
    backend: 'simulation',
    fps: 0,
    avgFrameIntervalMs: 0,
    avgProcessingMs: null,
    jitterPx: 0,
    confidence: null,
    totalFrames: 0,
    zeroPointFrames: 0,
    onePointFrames: 0,
    twoPointFrames: 0,
    recoveryCount: 0,
    marker1Present: false,
    marker2Present: false,
    landmarkCount1: 0,
    landmarkCount2: 0,
  });

  // Score & Training Selection
  const [selectedPiece, setSelectedPiece] = useState<ScorePiece>(SCORE_PIECES[0]);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('partitura_score');
  const [bpm, setBpm] = useState<number>(120);
  const [tempoPreset, setTempoPreset] = useState<TempoPreset>('Allegro');

  // Playback & Metronome State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [currentMeasure, setCurrentMeasure] = useState<number>(1);
  const [activeCue, setActiveCue] = useState<ScoreCue | null>(null);
  const [msToNextCue, setMsToNextCue] = useState<number>(0);

  // Real-time Hand Palm Tracking State
  const [palmState, setPalmState] = useState<DualPalmState>({
    leftPalm: null,
    rightPalm: null,
    distancePx: 0,
    distanceNormalized: 0.35,
    distanceCm: 45,
    angleDegrees: 0,
    timestampMs: performance.now(),
  });

  // Session Statistics
  const [stats, setStats] = useState<SessionStats>({
    totalCues: SCORE_PIECES[0].cues.length,
    completedCues: 0,
    avgReactionTimeMs: 0,
    bestReactionTimeMs: 0,
    avgPrecisionAccuracy: 0,
    avgBeatDriftMs: 0,
    staccatoResponseMs: 0,
    fermataStabilityScore: 100,
    totalScore: 0,
    streak: 0,
    attempts: [],
    conductorGrade: 'A',
  });
  const [lastAttempt, setLastAttempt] = useState<ReactionAttempt | null>(null);
  const musicalPalmState = useMemo(() => applyBodyCalibration(palmState, bodyCalibration), [palmState, bodyCalibration]);
  const cameraStageState = useMemo(
    () => deriveCameraStageState(palmState, musicalPalmState, cameraStageTarget, bodyCalibration),
    [palmState, musicalPalmState, cameraStageTarget, bodyCalibration],
  );
  const activeArea = AREA_COPY[activeModuleId] ?? AREA_COPY.instrument;
  const learningPoints = totalLearningPoints(learningScore);
  const rankingUnlocked = isRankingUnlocked(learningScore);

  // References
  const handTrackerRef = useRef<HandTracker | null>(null);
  const cueStartTimeRef = useRef<number | null>(null);
  const metronomeTimerRef = useRef<number | null>(null);

  const cameraRequestRef = useRef(0);
  useEffect(() => {
    const tracker = new HandTracker();
    handTrackerRef.current = tracker;
    tracker.enableSimulationMode(setPalmState);
    return () => { cameraRequestRef.current++; tracker.stop(); audioSynthesizer.stopOrchestraDrone(); };
  }, []);

  useEffect(() => {
    if (isSimulation) handTrackerRef.current?.enableSimulationMode(setPalmState);
  }, [isSimulation]);
  useEffect(() => { handTrackerRef.current?.colors.setConfig(colors); }, [colors]);

  useEffect(() => {
    saveInstrumentTimbre(instrumentTimbre);
  }, [instrumentTimbre]);

  useEffect(() => {
    saveLiveSoundFeedback(liveSoundFeedback);
  }, [liveSoundFeedback]);

  useEffect(() => {
    saveBodyCalibration(bodyCalibration);
  }, [bodyCalibration]);

  useEffect(() => {
    setCameraStageTarget(null);
  }, [activeModuleId, compasExperience]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const tracker = handTrackerRef.current;
      if (tracker) setTrackingDiagnostics(tracker.getDiagnostics());
    }, 500);
    return () => window.clearInterval(timer);
  }, []);
  const handleStopCamera = useCallback(() => {
    cameraRequestRef.current++;
    handTrackerRef.current?.stop();
  }, []);

  const handleInitCamera = useCallback(async (videoEl: HTMLVideoElement) => {
    const request = ++cameraRequestRef.current;
    const tracker = handTrackerRef.current ?? (handTrackerRef.current = new HandTracker());
    setCameraBusy(true);
    setCameraMessage('');
    setPalmState(trackingState(null, null));
    const fail = () => {
      if (request !== cameraRequestRef.current) return;
      setCameraBusy(false);
      setCameraMessage(tracker.getLastError());
      setCameraError(true); setIsSimulation(true);
      tracker.enableSimulationMode(setPalmState);
    };
    const success = await tracker.initialize(videoEl, setPalmState, trackingMode, fail, cameraDeviceId);
    if (request !== cameraRequestRef.current) return;
    setCameraBusy(false);
    setCameraListRevision(revision => revision + 1);
    if (!success) fail();
    else setCameraError(false);
  }, [trackingMode, cameraDeviceId]);

  const handleToggleSimulation = () => {
    setCameraError(false);
    setCameraMessage('');
    setCameraBusy(false);
    cameraRequestRef.current++;
    setIsSimulation(!isSimulation);
    if (!isSimulation) handTrackerRef.current?.enableSimulationMode(setPalmState);
  };

  const handleSimulatedDistanceChange = (distCm: number) => {
    if (handTrackerRef.current) {
      handTrackerRef.current.setSimulatedDistanceCm(distCm);
    } else {
      setPalmState((prev) => ({
        ...prev,
        distanceCm: distCm,
        timestampMs: performance.now(),
      }));
    }
  };

  const handleSimulatedPositionChange = (yNorm: number, distCm: number) => {
    if (handTrackerRef.current) {
      const normDist = Math.max(0.1, Math.min(0.9, distCm / SEPARATION_SCALE));
      const halfSpan = normDist / 2;
      const centerX = 0.5;
      handTrackerRef.current.setSimulatedPalmPositions(
        centerX - halfSpan,
        yNorm,
        centerX + halfSpan,
        yNorm
      );
    } else {
      setPalmState((prev) => ({
        ...prev,
        distanceCm: distCm,
        timestampMs: performance.now(),
      }));
    }
  };

  const handleMusicalSimulatedDistanceChange = (distCm: number) => {
    handleSimulatedDistanceChange(musicalOpeningToRaw(distCm, bodyCalibration));
  };

  const handleMusicalSimulatedPositionChange = (yNorm: number, distCm: number) => {
    handleSimulatedPositionChange(
      musicalYToRaw(yNorm, bodyCalibration),
      musicalOpeningToRaw(distCm, bodyCalibration),
    );
  };
  const handleScoreGain = (pts: number) => {
    setStats((prev) => ({
      ...prev,
      totalScore: prev.totalScore + pts,
      streak: prev.streak + 1,
    }));
  };

  const handleLearningScoreGain = (area: LearningGameArea, points: number) => {
    setLearningScore((current) => addLearningPoints(current, area, points));
  };

  const handleToggleMute = () => {
    const muted = audioSynthesizer.toggleMute();
    setIsMuted(muted);
  };

  // Select piece
  const handleSelectPiece = (piece: ScorePiece) => {
    setSelectedPiece(piece);
    setBpm(piece.bpm);
    setTempoPreset(piece.tempoPreset);
    setCurrentBeat(1);
    setCurrentMeasure(1);
    setIsPlaying(false);
    setStats((prev) => ({
      ...prev,
      totalCues: piece.cues.length,
      completedCues: 0,
      attempts: [],
      streak: 0,
    }));
  };

  // Reset current piece playback
  const handleResetScore = () => {
    setIsPlaying(false);
    setCurrentBeat(1);
    setCurrentMeasure(1);
    setActiveCue(null);
    cueStartTimeRef.current = null;
    audioSynthesizer.stopOrchestraDrone();
  };

  // Calculate final conductor grade
  const calculateGrade = (avgLatencyMs: number, avgAccuracy: number): 'S' | 'A' | 'B' | 'C' | 'D' => {
    if (avgLatencyMs < 220 && avgAccuracy >= 90) return 'S';
    if (avgLatencyMs < 280 && avgAccuracy >= 80) return 'A';
    if (avgLatencyMs < 350 && avgAccuracy >= 70) return 'B';
    if (avgLatencyMs < 450) return 'C';
    return 'D';
  };

  // Check cue evaluation on palm state update or beat tick
  const evaluateCueHit = useCallback((cue: ScoreCue, state: DualPalmState) => {
    if (!cueStartTimeRef.current || !state.leftPalm?.present || !state.rightPalm?.present) return;

    const now = performance.now();
    const elapsedTimeMs = Math.round(now - cueStartTimeRef.current);

    // Delta between user palm distance and cue target distance
    const distanceDelta = Math.abs(state.distanceCm - cue.targetDistanceCm);
    const isWithinTolerance = distanceDelta <= cue.toleranceMarginCm;

    // Precision percentage (100% = exact hit, 0% = >25cm off)
    const precisionAccuracy = Math.max(0, Math.min(100, Math.round(100 - (distanceDelta / 25) * 100)));

    if (isWithinTolerance && elapsedTimeMs > 100) {
      // Record successful hit!
      const attempt: ReactionAttempt = {
        cueId: cue.id,
        cueType: cue.type,
        targetDistanceCm: cue.targetDistanceCm,
        actualDistanceCm: state.distanceCm,
        reactionTimeMs: elapsedTimeMs,
        targetHitTimeMs: elapsedTimeMs,
        precisionAccuracy,
        beatDriftMs: elapsedTimeMs - 150, // relative to beat window
        timestamp: Date.now(),
      };

      setLastAttempt(attempt);
      audioSynthesizer.playHitSound(precisionAccuracy);

      setStats((prev) => {
        const newAttempts = [...prev.attempts, attempt];
        const newCompleted = newAttempts.length;
        const totalLat = newAttempts.reduce((acc, a) => acc + a.reactionTimeMs, 0);
        const avgLat = Math.round(totalLat / newCompleted);
        const bestLat = prev.bestReactionTimeMs === 0 ? elapsedTimeMs : Math.min(prev.bestReactionTimeMs, elapsedTimeMs);
        const totalAcc = newAttempts.reduce((acc, a) => acc + a.precisionAccuracy, 0);
        const avgAcc = Math.round(totalAcc / newCompleted);
        const totalDrift = newAttempts.reduce((acc, a) => acc + a.beatDriftMs, 0);
        const avgDrift = Math.round(totalDrift / newCompleted);
        const newStreak = prev.streak + 1;
        const scoreGained = Math.round(precisionAccuracy * 10 + (300 - Math.min(300, elapsedTimeMs)));
        const newScore = prev.totalScore + scoreGained;
        const grade = calculateGrade(avgLat, avgAcc);

        return {
          ...prev,
          completedCues: newCompleted,
          avgReactionTimeMs: avgLat,
          bestReactionTimeMs: bestLat,
          avgPrecisionAccuracy: avgAcc,
          avgBeatDriftMs: avgDrift,
          totalScore: newScore,
          streak: newStreak,
          attempts: newAttempts,
          conductorGrade: grade,
        };
      });

      // Clear cue start time so we don't double count
      cueStartTimeRef.current = null;
    }
  }, []);

  // Update orchestra audio drone according to palm distance
  useEffect(() => {
    if (isPlaying && musicalPalmState.leftPalm?.present && musicalPalmState.rightPalm?.present) {
      audioSynthesizer.updateOrchestraFromDistance(musicalPalmState.distanceCm);
      if (activeCue) {
        evaluateCueHit(activeCue, musicalPalmState);
      }
    }
  }, [musicalPalmState, isPlaying, activeCue, evaluateCueHit]);

  // Metronome Beat Timer Loop
  useEffect(() => {
    if (!isPlaying) {
      audioSynthesizer.stopOrchestraDrone();
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current);
      }
      return;
    }

    // Start Orchestra Drone
    audioSynthesizer.startOrchestraDrone();

    const beatIntervalMs = (60 / bpm) * 1000;

    metronomeTimerRef.current = window.setInterval(() => {
      setCurrentBeat((prevBeat) => {
        const nextBeat = prevBeat + 1;
        
        // Play beat click sound
        audioSynthesizer.playClick(nextBeat % 4 === 1);

        // Advance measure every 4 beats
        if (nextBeat % 4 === 1) {
          setCurrentMeasure((m) => m + 1);
        }

        // Check matching cue in current piece
        const cueForBeat = selectedPiece.cues.find(
          (c) => nextBeat >= c.startBeat && nextBeat < c.startBeat + c.durationBeats
        );

        if (cueForBeat && cueForBeat.id !== activeCue?.id) {
          setActiveCue(cueForBeat);
          cueStartTimeRef.current = performance.now();
        } else if (!cueForBeat) {
          setActiveCue(null);
        }

        // Check if end of piece reached
        const maxBeat = Math.max(...selectedPiece.cues.map((c) => c.startBeat + c.durationBeats)) + 4;
        if (nextBeat > maxBeat) {
          setIsPlaying(false);
          audioSynthesizer.stopOrchestraDrone();
          setShowReportModal(true);
          return 1;
        }

        return nextBeat;
      });
    }, beatIntervalMs);

    return () => {
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current);
      }
    };
  }, [isPlaying, bpm, selectedPiece, activeCue]);

  // Update countdown to next cue in ms
  useEffect(() => {
    if (!isPlaying) return;

    const nextCue = selectedPiece.cues.find((c) => c.startBeat > currentBeat);
    if (nextCue) {
      const beatsDiff = nextCue.startBeat - currentBeat;
      const msDiff = Math.max(0, Math.round(beatsDiff * (60 / bpm) * 1000));
      setMsToNextCue(msDiff);
    } else {
      setMsToNextCue(0);
    }
  }, [currentBeat, isPlaying, selectedPiece, bpm]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'white'
        ? 'bg-[var(--ui-background)] text-[var(--ui-text)] selection:bg-[var(--ui-forest)] selection:text-white'
        : 'dark bg-[var(--ui-background)] text-[var(--ui-text)] selection:bg-[var(--ui-gold)] selection:text-slate-950'
    }`}>
      {/* Top Header */}
      <Header
        activeModuleId={activeModuleId}
        onSelectModule={(id) => { setIsPlaying(false); setActiveCue(null); setActiveModuleId(id); }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isSimulation={isSimulation}
        onToggleSimulation={handleToggleSimulation}
        totalScore={stats.totalScore}
        streak={stats.streak}
        learningPoints={learningPoints}
        rankingUnlocked={rankingUnlocked}
        onShowInfo={() => setShowInfoModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-4 px-3 py-4 sm:px-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-6">
        {/* Primary Workspace Grid with Persistent Single CameraView */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-5 lg:items-stretch lg:gap-6">
          {/* Left Column: Persistent CameraView */}
          <div className={`${activeModuleId === 'ranking' ? 'hidden' : ''} min-w-0 space-y-4 md:col-span-5 md:space-y-5 lg:h-full lg:space-y-6`}>
            <div className="space-y-4 md:space-y-5 lg:sticky lg:top-4 lg:z-10">
              <VideoSourceSelector selectedId={cameraDeviceId}
              onSelect={(id) => { setCameraDeviceId(id); setCameraMessage(''); }}
              active={!isSimulation} busy={cameraBusy} onToggle={handleToggleSimulation}
              refreshKey={cameraListRevision} error={cameraMessage} theme={theme} />
            <CameraView
              palmState={palmState}
              activeCue={activeCue}
              isSimulation={isSimulation}
              onInitCamera={handleInitCamera}
              onStopCamera={handleStopCamera}
              onSimulatedDistanceChange={handleSimulatedDistanceChange}
              onSimulatedPositionChange={handleSimulatedPositionChange}
              onToggleSimulation={handleToggleSimulation}
              cameraError={cameraError}
              diagnostics={trackingDiagnostics}
              stageState={cameraStageState}
              theme={theme}
            />
            </div>

            <details className="group rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-sm shadow-[var(--ui-shadow)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-[var(--ui-text)]">Ajustes rápidos</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Detección y rango corporal</div>
                </div>
                <span className="rounded-full bg-slate-500/[0.08] px-2 py-1 text-[10px] font-semibold text-slate-500 group-open:hidden">
                  {bodyCalibration ? 'Rango personalizado' : 'Rango estándar'}
                </span>
              </summary>

              <div className="space-y-3 border-t border-[var(--ui-border)] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-500/[0.035] px-3 py-2.5">
                  <div>
                    <div className="text-xs font-semibold text-[var(--ui-text)]">Detección</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">Cómo identifica Melody Motion tus manos.</div>
                  </div>
                  <select
                    aria-label="Modo de detección"
                    className="min-w-[150px] rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] px-3 py-2 text-xs text-[var(--ui-text)]"
                    value={trackingMode}
                    onChange={e => setTrackingMode(e.target.value as TrackingModeType)}
                  >
                    <option value="hands">Manos libres</option>
                    <option value="colored_balls">Marcadores de color</option>
                  </select>
                </div>

                <BodyCalibrationPanel palmState={palmState} calibration={bodyCalibration} onChange={setBodyCalibration} />

                {trackingMode === 'colored_balls' && (
                  <div className="space-y-3 rounded-xl border border-[var(--ui-border)] px-3 py-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <label className="flex items-center gap-2">
                        <span>Marcador A</span>
                        <input
                          aria-label="Color del marcador A"
                          type="color"
                          value={colors.color1Hex}
                          onChange={e => setColors(c => ({ ...c, color1Hex: e.target.value }))}
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <span>Marcador B</span>
                        <input
                          aria-label="Color del marcador B"
                          type="color"
                          value={colors.color2Hex}
                          onChange={e => setColors(c => ({ ...c, color2Hex: e.target.value }))}
                        />
                      </label>
                    </div>
                    <label className="block text-xs">
                      <span className="flex items-center justify-between gap-3">
                        <span>Tolerancia de color</span>
                        <span className="font-mono text-slate-500">{colors.tolerance}</span>
                      </span>
                      <input
                        className="mt-2 block w-full accent-cyan-700"
                        aria-label="Tolerancia de color"
                        type="range"
                        min="20"
                        max="90"
                        value={colors.tolerance}
                        onChange={e => setColors(c => ({ ...c, tolerance: Number(e.target.value) }))}
                      />
                    </label>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Usa dos referencias cromáticas visibles y distintas: tarjetas, adhesivos, objetos o marcadores.
                    </p>
                  </div>
                )}

                <p className="text-[11px] leading-relaxed text-slate-500">
                  Procesamiento local · apertura en unidades relativas · sin almacenamiento de video.
                </p>
              </div>
            </details>

            {activeModuleId === 'module_3_orchestra_score' && compasExperience === 'direction' && (
              <TrainingControls
                selectedPiece={selectedPiece}
                onSelectPiece={handleSelectPiece}
                trainingMode={trainingMode}
                onChangeMode={setTrainingMode}
                bpm={bpm}
                onChangeBpm={setBpm}
                tempoPreset={tempoPreset}
                onChangeTempoPreset={setTempoPreset}
                theme={theme}
              />
            )}
          </div>

          {/* Right Column: Active Module View */}
          <div className={`mx-auto w-full min-w-0 self-start space-y-4 md:space-y-5 lg:space-y-6 ${activeModuleId === 'ranking' ? 'md:col-span-12 lg:max-w-[1180px]' : 'md:col-span-7 lg:max-w-[920px]'}`}>
            <WorkspaceHeader title={activeArea.title} description={activeArea.description} />
            {activeModuleId === 'instrument' && (
              <InstrumentPanel
                palmState={musicalPalmState}
                theme={theme}
                timbre={instrumentTimbre}
                onTimbreChange={setInstrumentTimbre}
                liveSoundFeedback={liveSoundFeedback}
                onLiveSoundFeedbackChange={setLiveSoundFeedback}
              />
            )}
            {activeModuleId === 'module_1_figures_duration' && (
              <Module1FiguresView
                palmState={musicalPalmState}
                onScoreGain={(points) => handleLearningScoreGain('rhythm', points)}
                isSimulation={isSimulation}
                onSimulatedDistanceChange={handleMusicalSimulatedDistanceChange}
                onCameraStageTargetChange={setCameraStageTarget}
                theme={theme}
              />
            )}

            {activeModuleId === 'module_2_pentagram_height' && (
              <Module2PentagramView
                palmState={musicalPalmState}
                onScoreGain={(points) => handleLearningScoreGain('pentagram', points)}
                isSimulation={isSimulation}
                onSimulatedPositionChange={handleMusicalSimulatedPositionChange}
                onCameraStageTargetChange={setCameraStageTarget}
                theme={theme}
                timbre={instrumentTimbre}
                onTimbreChange={setInstrumentTimbre}
              />
            )}


            {activeModuleId === 'ranking' && rankingUnlocked && (
              <LearningRankingView score={learningScore} theme={theme} />
            )}

            {activeModuleId === 'module_3_orchestra_score' && (
              <>
                <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)]">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetScore();
                        setCompasExperience('accordion');
                      }}
                      aria-pressed={compasExperience === 'accordion'}
                      className={`rounded-xl px-3 py-3 text-left transition-colors ${
                        compasExperience === 'accordion'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-[var(--ui-background)] text-[var(--ui-text)]'
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Compás · Nivel 1</div>
                      <div className="mt-1 font-bold">Acordeón corporal</div>
                      <div className="mt-1 text-xs opacity-80">Apertura + figura + pulso dentro de una frase de 4/4.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetScore();
                        setCompasExperience('direction');
                      }}
                      aria-pressed={compasExperience === 'direction'}
                      className={`rounded-xl px-3 py-3 text-left transition-colors ${
                        compasExperience === 'direction'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-[var(--ui-background)] text-[var(--ui-text)]'
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Compás · Nivel 2</div>
                      <div className="mt-1 font-bold">Dirección experimental</div>
                      <div className="mt-1 text-xs opacity-80">Partitura, cues y métricas de respuesta corporal.</div>
                    </button>
                  </div>
                </section>

                {compasExperience === 'accordion' ? (
                  <CompasAccordionView
                    palmState={musicalPalmState}
                    isSimulation={isSimulation}
                    onSimulatedDistanceChange={handleMusicalSimulatedDistanceChange}
                    onCameraStageTargetChange={setCameraStageTarget}
                    theme={theme}
                  />
                ) : (
                  <>
                    <ScoreVisualizer
                      activePiece={selectedPiece}
                      currentBeat={currentBeat}
                      currentMeasure={currentMeasure}
                      activeCue={activeCue}
                      palmState={musicalPalmState}
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onResetScore={handleResetScore}
                      msToNextCue={msToNextCue}
                    />

                    <Suspense fallback={<p>Cargando métricas…</p>}><ReactionMetrics
                      stats={stats}
                      lastAttempt={lastAttempt}
                    /></Suspense>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <InstitutionalSignature />

      {/* Info Methodology Modal */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* Session Final Report Modal */}
      {showReportModal && (
        <SessionReport
          stats={stats}
          pieceTitle={selectedPiece.title}
          onClose={() => setShowReportModal(false)}
          onRestart={() => {
            setShowReportModal(false);
            handleResetScore();
            setIsPlaying(true);
          }}
        />
      )}
    </div>
  );
}
