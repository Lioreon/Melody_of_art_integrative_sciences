import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppTheme } from '../types';

export function VideoSourceSelector({ selectedId, onSelect, active, busy, onToggle, refreshKey, error, theme }: {
  selectedId: string; onSelect: (id: string) => void; active: boolean; busy: boolean;
  onToggle: () => void; refreshKey: number; error: string; theme: AppTheme;
}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [listError, setListError] = useState('');
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++request.current;
    try {
      if (!navigator.mediaDevices?.enumerateDevices) throw new Error('unavailable');
      const all = await navigator.mediaDevices.enumerateDevices();
      if (current !== request.current) return;
      setDevices(all.filter(device => device.kind === 'videoinput' && device.deviceId));
      setListError('');
    } catch {
      if (current === request.current) setListError('No se pudo consultar la lista de cámaras. Usa localhost o HTTPS y revisa los permisos.');
    }
  }, []);
  useEffect(() => {
    void refresh();
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => { request.current++; navigator.mediaDevices?.removeEventListener?.('devicechange', refresh); };
  }, [refresh, refreshKey]);
  const missing = selectedId && !devices.some(device => device.deviceId === selectedId);
  const white = theme === 'white';
  return <section aria-label="Cámara" className="space-y-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-[var(--ui-shadow)] sm:space-y-3 sm:p-4">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">Cámara <span className="hidden sm:inline">y seguimiento</span></h2>
      <span className="flex items-center gap-2 text-xs font-medium text-[var(--ui-text-muted)]">
        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {busy ? 'Conectando' : active ? 'Activa' : 'Virtual'}
      </span>
    </div>
    <button className="touch-target w-full rounded-xl bg-[var(--ui-blue)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-slate-950 sm:py-3" onClick={onToggle}>
      {active ? busy ? 'Cancelar conexión' : 'Detener cámara' : 'Activar cámara'}
    </button>
    <details className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-2">
      <summary className="touch-target flex cursor-pointer items-center text-sm font-medium">Cambiar cámara y opciones</summary>
      <div className="pt-3 space-y-3">
        <label htmlFor="video-source" className="block text-xs font-medium text-[var(--ui-text-muted)]">Fuente de video</label>
        <select id="video-source" value={selectedId} disabled={busy}
          onChange={event => onSelect(event.target.value)}
          className={`w-full rounded-lg border p-2.5 text-base sm:text-sm ${white ? 'bg-white text-slate-900' : 'bg-[var(--ui-surface)] text-[var(--ui-text)]'}`}>
          <option value="">Cámara predeterminada del sistema</option>
          {missing && <option value={selectedId}>Cámara seleccionada no disponible</option>}
          {devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Cámara ${index + 1}`}
          </option>)}
        </select>
        <button className="touch-target rounded-lg border border-[var(--ui-border)] px-3 py-2 text-sm disabled:opacity-40" disabled={busy} onClick={() => void refresh()}>Actualizar lista</button>
        <p className="text-xs text-[var(--ui-text-muted)]">Admite la cámara del sistema, webcams USB y cámaras virtuales reconocidas por el navegador.</p>
      </div>
    </details>
    {busy && <p role="status" className="text-sm">Conectando la fuente de video…</p>}
    {(error || listError) && <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">{error || listError}</p>}
  </section>;
}
