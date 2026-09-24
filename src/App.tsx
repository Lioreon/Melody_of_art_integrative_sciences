/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { InstrumentPanel } from './components/InstrumentPanel';
import { VideoSourceSelector } from './components/VideoSourceSelector';
import { trackingState, SEPARATION_SCALE } from './services/trackingGeometry';
import type { TrackingModeType } from './types';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ScoreVisualizer } from './components/ScoreVisualizer';
const ReactionMetrics = lazy(() => import('./components/ReactionMetrics').then(module => ({ default: module.ReactionMetrics })));
import { TrainingControls } from './components/TrainingControls';
import { SessionReport } from './components/SessionReport';
import { InfoModal } from './components/InfoModal';
import { InstitutionalSignature } from './components/InstitutionalSignature';
import { WorkspaceHeader } from './components/WorkspaceHeader';

import { Module1FiguresView } from './components/Module1FiguresView';
import { Module2PentagramView } from './components/Module2PentagramView';

import { SCORE_PIECES, ScorePiece } from './data/scorePresets';
import { AppTheme, DualPalmState, ReactionAttempt, ScoreCue, SessionStats, TempoPreset, TrainingMode } from './types';
import { HandTracker } from './services/handTracker';
import { audioSynthesizer } from './services/audioSynthesizer';
import type { InstrumentTimbre } from './services/instrumentSamples';

const AREA_COPY: Record<string, { title: string; description: string }> = {
  instrument: {
    title: 'Instrumento',
    description: 'Explora cómo la altura conjunta de tus manos recorre de Sol3 a Si5 y cómo su apertura horizontal determina la figura musical.',
  },
  module_1_figures_duration: {
    title: 'Ritmo',
    description: 'Representa figuras y silencios con la separación de tus manos y mantén cada posición durante su duración.',
  },
  module_2_pentagram_height: {
    title: 'Pentagrama',
    description: 'Relaciona altura y apertura con notas, figuras y secuencias, incluyendo posiciones por debajo y por encima del pentagrama.',
  },
  module_3_orchestra_score: {
    title: 'Compás',
    description: 'Explora la dirección musical con partituras y feedback experimental sobre tu respuesta corporal.',
  },
};

export default function App() {
  // Navigation & Modules
  const [activeModuleId, setActiveModuleId] = useState<string>('instrument');
  const [theme, setTheme] = useState<AppTheme>('white');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'white' ? 'dark_cyan' : 'white'));
  };


  // Audio & Camera Mode
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [instrumentTimbre, setInstrumentTimbre] = useState<InstrumentTimbre>('synth');
  const [isSimulation, setIsSimulation] = useState<boolean>(true);
  const [trackingMode, setTrackingMode] = useState<TrackingModeType>('hands');
  const [colors, setColors] = useState({ color1Hex: '#ef4444', color2Hex: '#06b6d4', tolerance: 50 });
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [cameraDeviceId, setCameraDeviceId] = useState('');
  const [cameraMessage, setCameraMessage] = useState('');
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraListRevision, setCameraListRevision] = useState(0);

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
  const activeArea = AREA_COPY[activeModuleId] ?? AREA_COPY.instrument;

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

  const handleScoreGain = (pts: number) => {
    setStats((prev) => ({
      ...prev,
      totalScore: prev.totalScore + pts,
      streak: prev.streak + 1,
    }));
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
    if (isPlaying && palmState.leftPalm?.present && palmState.rightPalm?.present) {
      audioSynthesizer.updateOrchestraFromDistance(palmState.distanceCm);
      if (activeCue) {
        evaluateCueHit(activeCue, palmState);
      }
    }
  }, [palmState, isPlaying, activeCue, evaluateCueHit]);

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
        onShowInfo={() => setShowInfoModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Primary Workspace Grid with Persistent Single CameraView */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Persistent CameraView */}
          <div className="lg:col-span-4 min-w-0 space-y-6">
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
              theme={theme}
            />

            <details className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 text-sm shadow-[var(--ui-shadow)]">
              <summary className="cursor-pointer">Seguimiento y colores</summary>
              <div className="pt-4 space-y-3">
                <label className="block">Modo de detección
                  <select aria-label="Modo de detección" className="ml-3 rounded border p-2 bg-white text-slate-800" value={trackingMode}
                    onChange={e => setTrackingMode(e.target.value as TrackingModeType)}>
                    <option value="hands">Manos libres</option><option value="colored_balls">Pelotas de colores</option>
                  </select>
                </label>
                {trackingMode === 'colored_balls' && <>
                  <div className="flex gap-4">
                    <label>Pelota 1 <input aria-label="Color de pelota 1" type="color" value={colors.color1Hex}
                      onChange={e => setColors(c => ({ ...c, color1Hex: e.target.value }))} /></label>
                    <label>Pelota 2 <input aria-label="Color de pelota 2" type="color" value={colors.color2Hex}
                      onChange={e => setColors(c => ({ ...c, color2Hex: e.target.value }))} /></label>
                  </div>
                  <label className="block">Tolerancia de color: {colors.tolerance}
                    <input className="block w-full" aria-label="Tolerancia de color" type="range" min="20" max="90" value={colors.tolerance}
                      onChange={e => setColors(c => ({ ...c, tolerance: Number(e.target.value) }))} />
                  </label>
                  <p className="text-xs">Usa colores saturados y distintos, con luz uniforme y un fondo de otro color.</p>
                </>}
                <p className="text-xs text-slate-500">La cámara se procesa en este equipo. La apertura usa unidades relativas; las referencias heredadas en cm son aproximaciones.</p>
              </div>
            </details>

            {activeModuleId === 'module_3_orchestra_score' && (
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
          <div className="lg:col-span-8 min-w-0 space-y-6">
            <WorkspaceHeader title={activeArea.title} description={activeArea.description} />
            {activeModuleId === 'instrument' && (
              <InstrumentPanel
                palmState={palmState}
                theme={theme}
                timbre={instrumentTimbre}
                onTimbreChange={setInstrumentTimbre}
              />
            )}
            {activeModuleId === 'module_1_figures_duration' && (
              <Module1FiguresView
                palmState={palmState}
                onScoreGain={handleScoreGain}
                isSimulation={isSimulation}
                onSimulatedDistanceChange={handleSimulatedDistanceChange}
                theme={theme}
              />
            )}

            {activeModuleId === 'module_2_pentagram_height' && (
              <Module2PentagramView
                palmState={palmState}
                onScoreGain={handleScoreGain}
                isSimulation={isSimulation}
                onSimulatedPositionChange={handleSimulatedPositionChange}
                theme={theme}
                timbre={instrumentTimbre}
                onTimbreChange={setInstrumentTimbre}
              />
            )}

            {activeModuleId === 'module_3_orchestra_score' && (
              <>
                <ScoreVisualizer
                  activePiece={selectedPiece}
                  currentBeat={currentBeat}
                  currentMeasure={currentMeasure}
                  activeCue={activeCue}
                  palmState={palmState}
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
