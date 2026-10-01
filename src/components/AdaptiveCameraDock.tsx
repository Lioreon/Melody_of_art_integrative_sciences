import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize2, Minimize2, PictureInPicture2 } from 'lucide-react';

export type CameraDockMode = 'expanded' | 'floating' | 'minimized';

export function AdaptiveCameraDock({ children, trackingPaused, onModeChange }: {
  children: ReactNode;
  trackingPaused: boolean;
  onModeChange: (mode: CameraDockMode) => void;
}) {
  const [mode, setMode] = useState<CameraDockMode>('expanded');
  const dockRef = useRef<HTMLElement>(null);
  const [recovering, setRecovering] = useState(false);
  // Presentation only: ignore brief dropouts, then wait for sustained recovery.
  useEffect(() => {
    const timer = window.setTimeout(() => setRecovering(trackingPaused), trackingPaused ? 450 : 1200);
    return () => window.clearTimeout(timer);
  }, [trackingPaused]);

  const effectiveMode = recovering ? 'expanded' : mode;
  useEffect(() => {
    onModeChange(effectiveMode);
  }, [effectiveMode, onModeChange]);
  useEffect(() => {
    if (!recovering || !window.matchMedia('(max-width: 767px)').matches) return;
    const frame = window.requestAnimationFrame(() => dockRef.current?.scrollIntoView({ block: 'start' }));
    return () => window.cancelAnimationFrame(frame);
  }, [recovering]);

  const control = 'mm-dock-button';
  return (
    <section ref={dockRef} className="mm-camera-dock" data-mode={effectiveMode} aria-label="Vista adaptable de cámara">
      <div className="mm-dock-toolbar">
        <span className="mm-dock-status" role="status">
          <span aria-hidden="true" className={trackingPaused ? 'mm-dock-dot paused' : 'mm-dock-dot'} />
          {trackingPaused ? 'Muestra ambas manos' : 'Seguimiento activo'}
        </span>
        <div className="mm-dock-actions">
          {effectiveMode !== 'expanded' && <button type="button" className={control} aria-label="Expandir cámara" title="Expandir cámara" onClick={() => setMode('expanded')}><Maximize2 size={18} aria-hidden="true" /></button>}
          {effectiveMode !== 'floating' && <button type="button" className={control} aria-label="Cámara flotante" title="Cámara flotante" disabled={trackingPaused || recovering} onClick={() => setMode('floating')}><PictureInPicture2 size={18} aria-hidden="true" /></button>}
          {effectiveMode !== 'minimized' && <button type="button" className={control} aria-label="Minimizar cámara" title="Minimizar cámara" disabled={trackingPaused || recovering} onClick={() => setMode('minimized')}><Minimize2 size={18} aria-hidden="true" /></button>}
        </div>
      </div>
      <div className="mm-dock-camera">
        {children}
      </div>
    </section>
  );
}
