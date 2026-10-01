import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Video } from 'lucide-react';

type DockMode = 'expanded' | 'floating' | 'minimized';

/** Presentation only: children never move between parents or unmount. */
export function CameraDock({ children, active }: { children: React.ReactNode; active: boolean }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<DockMode>('expanded');
  const [mobile, setMobile] = useState(false);
  const [reservedHeight, setReservedHeight] = useState<number>();
  const minimizedRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setMobile(media.matches);
      if (!media.matches) {
        minimizedRef.current = false;
        setMode('expanded');
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || mode !== 'expanded' || !active) return;
    const observer = new ResizeObserver(() => {
      if (panel.offsetHeight) setReservedHeight(panel.offsetHeight);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [mode, active]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !mobile || !active) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (minimizedRef.current) return;
      // Float only after passing the panel, never while it is below the viewport.
      const above = entry.boundingClientRect.bottom <= 0;
      const hasFocus = panelRef.current?.contains(document.activeElement);
      setMode(above && !hasFocus ? 'floating' : 'expanded');
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [mobile, active]);

  useEffect(() => {
    if (!mobile || mode === 'expanded' || !active) return;
    const protectFocus = (event: FocusEvent) => {
      const target = event.target;
      const panel = panelRef.current;
      if (!(target instanceof HTMLElement) || !panel || panel.contains(target)) return;
      const a = target.getBoundingClientRect();
      const b = panel.getBoundingClientRect();
      if (a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right) {
        if (mode === 'floating') {
          minimizedRef.current = true;
          setMode('minimized');
        }
        // Let the browser put the newly focused control above the compact dock.
        target.scrollIntoView({ block: 'center' });
      }
    };
    document.addEventListener('focusin', protectFocus);
    return () => document.removeEventListener('focusin', protectFocus);
  }, [mobile, mode, active]);

  const expand = () => {
    minimizedRef.current = false;
    setMode('expanded');
    anchorRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    restoreRef.current?.focus({ preventScroll: true });
  };

  return (
    <div ref={anchorRef} className="mm-camera-anchor" style={mobile ? { minHeight: reservedHeight } : undefined}>
      <div ref={panelRef} className="mm-camera-dock" data-camera-dock={mobile ? mode : 'expanded'}>
        <div className="mm-camera-dock-toolbar">
          <span className="mm-camera-dock-title"><Video size={16} aria-hidden="true" /> Cámara</span>
          <button ref={restoreRef} type="button" onClick={expand} aria-label={mode === 'minimized' ? 'Restaurar cámara' : 'Ampliar cámara'} aria-controls="mm-camera-dock-content" aria-expanded={mode !== 'minimized'}>
            <Maximize2 size={18} aria-hidden="true" />
          </button>
          <button type="button" hidden={mode === 'minimized'} aria-label="Minimizar cámara sin detener seguimiento" onClick={() => {
            minimizedRef.current = true;
            setMode('minimized');
            restoreRef.current?.focus({ preventScroll: true });
          }}><Minus size={18} aria-hidden="true" /></button>
        </div>
        <div id="mm-camera-dock-content" className="mm-camera-dock-content" hidden={mobile && mode === 'minimized'}>{children}</div>
      </div>
    </div>
  );
}
