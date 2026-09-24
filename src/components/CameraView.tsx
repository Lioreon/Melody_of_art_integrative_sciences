/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { DualPalmState, ScoreCue, AppTheme, TrackingDiagnostics } from '../types';
import { AlertCircle, Sliders, RotateCw, FlipHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

interface CameraViewProps {
  palmState: DualPalmState;
  activeCue: ScoreCue | null;
  isSimulation: boolean;
  onInitCamera: (video: HTMLVideoElement) => void;
  onStopCamera: () => void;
  onSimulatedDistanceChange: (distCm: number) => void;
  onSimulatedPositionChange?: (yNorm: number, distCm: number) => void;
  onToggleSimulation: () => void;
  cameraError: boolean;
  diagnostics: TrackingDiagnostics;
  theme?: AppTheme;
}

export const CameraView: React.FC<CameraViewProps> = ({
  palmState,
  activeCue,
  isSimulation,
  onInitCamera,
  onStopCamera,
  onSimulatedDistanceChange,
  onSimulatedPositionChange,
  onToggleSimulation,
  cameraError,
  diagnostics,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showHandSkeleton, setShowHandSkeleton] = useState<boolean>(false);

  const handleRotate = () => {
    setRotationDeg((prev) => (prev + 90) % 360);
  };

  useEffect(() => {
    if (videoRef.current && !isSimulation) {
      onInitCamera(videoRef.current);
      return onStopCamera;
    }
  }, [isSimulation, onInitCamera, onStopCamera]);

  // Clean canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const { leftPalm, rightPalm, distanceCm } = palmState;

    if (showHandSkeleton) {
      for (const palm of [leftPalm, rightPalm]) {
        const landmarks = palm?.landmarks;
        if (!landmarks || landmarks.length < 21) continue;

        ctx.strokeStyle = 'rgba(34, 211, 238, 0.72)';
        ctx.lineWidth = 1.4;
        for (const [from, to] of HAND_CONNECTIONS) {
          const a = landmarks[from];
          const b = landmarks[to];
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }

        for (let index = 0; index < landmarks.length; index += 1) {
          const point = landmarks[index];
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, index % 4 === 0 ? 3.2 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = index % 4 === 0 ? '#f4c95d' : '#67e8f9';
          ctx.fill();
        }
      }
    }

    if (leftPalm && rightPalm) {
      const lx = leftPalm.center.x * width;
      const ly = leftPalm.center.y * height;
      const rx = rightPalm.center.x * width;
      const ry = rightPalm.center.y * height;

      let isHit = false;
      let targetDistCm = 50;
      let margin = 8;
      if (activeCue) {
        targetDistCm = activeCue.targetDistanceCm;
        margin = activeCue.toleranceMarginCm;
        isHit = Math.abs(distanceCm - targetDistCm) <= margin;
      }

      const centerX = (lx + rx) / 2;
      const centerY = (ly + ry) / 2;

      // Clean target boundary indicator
      const targetPx = (targetDistCm / 125) * width;
      const targetHalf = targetPx / 2;
      const targetLx = Math.max(16, centerX - targetHalf);
      const targetRx = Math.min(width - 16, centerX + targetHalf);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isHit ? 'rgba(16, 185, 129, 0.7)' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(targetLx, centerY - 40);
      ctx.lineTo(targetLx, centerY + 40);
      ctx.moveTo(targetRx, centerY - 40);
      ctx.lineTo(targetRx, centerY + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // Simple, elegant connection line
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = isHit ? '#10b981' : '#0ea5e9';
      ctx.lineWidth = isHit ? 3.5 : 2;
      ctx.stroke();

      // Left palm dot
      ctx.beginPath();
      ctx.arc(lx, ly, 10, 0, 2 * Math.PI);
      ctx.fillStyle = isHit ? '#10b981' : '#0ea5e9';
      ctx.fill();

      // Right palm dot
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, 2 * Math.PI);
      ctx.fillStyle = isHit ? '#10b981' : '#0ea5e9';
      ctx.fill();

      // Clean distance badge at midpoint
      const boxW = 84;
      const boxH = 26;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(centerX - boxW / 2, centerY - boxH / 2 - 20, boxW, boxH, 6);
      ctx.fill();

      ctx.fillStyle = isHit ? '#10b981' : '#f8fafc';
      ctx.font = '600 12px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${distanceCm} u.`, centerX, centerY - 20);
    }
  }, [palmState, activeCue, showHandSkeleton]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-shadow)] transition-colors">
      {/* Video & Tracking Canvas Stage */}
      <div className="relative bg-slate-950 flex items-center justify-center aspect-[4/3] overflow-hidden">
        {/* Video feed */}
        {!isSimulation && (
          <video
            ref={videoRef}
            style={{
              transform: `${isMirrored ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${rotationDeg}deg)`,
              objectFit: rotationDeg % 180 !== 0 ? 'contain' : 'cover',
            }}
            className="absolute inset-0 w-full h-full"
            playsInline
            muted
          />
        )}

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ transform: isSimulation ? undefined : `${isMirrored ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${rotationDeg}deg)` }}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Virtual Mode background */}
        {isSimulation && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-xs space-y-2">
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                Simulador Virtual Activo
              </span>
              <p className="text-xs text-slate-400">
                {cameraError ? 'Cámara o modelo no disponibles. Usa el simulador o reintenta desde el botón Virtual.' : 'Ajusta apertura y altura con los controles inferiores.'}
              </p>
            </div>
          </div>
        )}

        {/* Camera Error Notice (Safety & system status preserved) */}
        {cameraError && !isSimulation && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="max-w-sm space-y-1">
              <h3 className="text-sm font-semibold text-slate-100">
                Cámara no disponible
              </h3>
              <p className="text-xs text-slate-400">
                El acceso a la cámara web fue bloqueado o no está disponible. Puedes continuar entrenando con el simulador interactivo.
              </p>
            </div>
            <div className="pt-1 flex flex-wrap justify-center gap-2">
              <button
                onClick={onToggleSimulation}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {isSimulation ? 'Reintentar cámara' : 'Usar simulador'}
              </button>
            </div>
          </div>
        )}

        {/* Top Status Indicators (Minimalist HUD) */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between text-xs pointer-events-none">
          {/* Left Palm Status */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${palmState.leftPalm?.present ? 'bg-cyan-500' : 'bg-slate-600'}`} />
            <span className="text-[11px]">Punto 1</span>
          </div>

          {/* Active Target if applicable */}
          {activeCue && (
            <div className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-slate-200 text-xs font-medium">
              Meta: <span className="font-semibold text-cyan-400">{activeCue.targetDistanceCm} cm</span>
            </div>
          )}

          {/* Right Palm Status */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-slate-300">
            <span className="text-[11px]">Punto 2</span>
            <span className={`w-2 h-2 rounded-full ${palmState.rightPalm?.present ? 'bg-cyan-500' : 'bg-slate-600'}`} />
          </div>
        </div>
      </div>

      {/* Primary Interaction Area: Distance Slider */}
      <div className="p-4 space-y-3">
        {/* Main Distance Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="palm-distance-slider" className={`font-medium ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              Apertura entre manos
            </label>
            <span className={`font-mono text-sm font-bold ${isWhite ? 'text-cyan-800' : 'text-cyan-400'}`}>
              {palmState.distanceCm} u.
            </span>
          </div>

          <input
            id="palm-distance-slider"
            disabled={!isSimulation}
            type="range"
            min="10"
            max="100"
            step="1"
            value={palmState.distanceCm}
            onChange={(e) => onSimulatedDistanceChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer accent-cyan-600 bg-slate-200 dark:bg-slate-800"
            aria-label="Apertura relativa entre manos"
          />

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>10 · Juntas</span>
            <span>50</span>
            <span>100 · Separadas</span>
          </div>
        </div>

        {/* Collapsible Options (Advanced & Orientation Settings) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1"
          >
            <span>Opciones de orientación y calibración</span>
            {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedSettings && (
            <div className="pt-3 space-y-3">
              {!isSimulation && (
                <div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200">Diagnóstico de tracking · T0</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        Métricas locales de la sesión; no se guarda video.
                      </div>
                    </div>
                    {diagnostics.backend === 'mediapipe-hands' && (
                      <label className="flex items-center gap-2 text-[11px] text-slate-500">
                        <input
                          type="checkbox"
                          checked={showHandSkeleton}
                          onChange={(event) => setShowHandSkeleton(event.target.checked)}
                        />
                        Mostrar 21 landmarks
                      </label>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                    <div><span className="block text-slate-400">Backend</span><strong>{diagnostics.backend}</strong></div>
                    <div><span className="block text-slate-400">FPS</span><strong>{diagnostics.fps.toFixed(1)}</strong></div>
                    <div><span className="block text-slate-400">ms/frame</span><strong>{diagnostics.avgFrameIntervalMs.toFixed(1)}</strong></div>
                    <div><span className="block text-slate-400">Inferencia</span><strong>{diagnostics.avgProcessingMs === null ? 'n/d' : `${diagnostics.avgProcessingMs.toFixed(1)} ms`}</strong></div>
                    <div><span className="block text-slate-400">Jitter aprox.</span><strong>{diagnostics.jitterPx.toFixed(1)} px</strong></div>
                    <div><span className="block text-slate-400">Confianza</span><strong>{diagnostics.confidence === null ? 'n/d' : `${Math.round(diagnostics.confidence * 100)}%`}</strong></div>
                    <div><span className="block text-slate-400">2 puntos</span><strong>{diagnostics.totalFrames === 0 ? '0%' : `${Math.round((diagnostics.twoPointFrames / diagnostics.totalFrames) * 100)}%`}</strong></div>
                    <div><span className="block text-slate-400">Recuperaciones</span><strong>{diagnostics.recoveryCount}</strong></div>
                  </div>

                  {diagnostics.backend === 'mediapipe-hands' && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      Landmarks persistentes: {diagnostics.landmarkCount1} + {diagnostics.landmarkCount2}.
                      {' '}Identidad anatómica todavía no reemplaza el orden espacial.
                    </div>
                  )}
                </div>
              )}

              {/* Camera Orientation buttons */}
              {!isSimulation && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRotate}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Girar ({rotationDeg}°)</span>
                  </button>

                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      isMirrored
                        ? isWhite ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-600 text-slate-100'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>{isMirrored ? 'Espejo activado' : 'Espejo desactivado'}</span>
                  </button>
                </div>
              )}

              {/* Vertical Height Slider (Pentagram Y) for Simulation */}
              {isSimulation && onSimulatedPositionChange && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Altura vertical simulada (Eje Y)</span>
                    <span className="font-mono">{Math.round((palmState.leftPalm?.center.y ?? 0.5) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.85"
                    step="0.01"
                    value={palmState.leftPalm?.center.y ?? 0.5}
                    onChange={(e) => onSimulatedPositionChange(Number(e.target.value), palmState.distanceCm)}
                    className="w-full h-1.5 rounded cursor-pointer accent-cyan-600 bg-slate-200 dark:bg-slate-800"
                    aria-label="Altura vertical simulada"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

