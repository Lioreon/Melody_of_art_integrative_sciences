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
  return <section aria-label="Fuente de video" className={`rounded-xl border p-4 space-y-3 ${white ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
    <label htmlFor="video-source" className="block text-sm font-semibold">Fuente de video</label>
    <select id="video-source" value={selectedId} disabled={busy}
      onChange={event => onSelect(event.target.value)}
      className={`w-full border rounded-lg p-2 text-sm ${white ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-100'}`}>
      <option value="">Cámara predeterminada del sistema</option>
      {missing && <option value={selectedId}>Cámara seleccionada no disponible</option>}
      {devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>
        {device.label || `Cámara ${index + 1}`}
      </option>)}
    </select>
    <div className="flex flex-wrap gap-2">
      <button className="bg-cyan-700 text-white rounded-lg px-3 py-2 text-sm" onClick={onToggle}>
        {active ? busy ? 'Cancelar conexión' : 'Detener cámara' : 'Activar cámara'}
      </button>
      <button className="border rounded-lg px-3 py-2 text-sm disabled:opacity-40" disabled={busy} onClick={() => void refresh()}>Actualizar lista</button>
    </div>
    <p className="text-xs text-slate-500">Puedes elegir una webcam, cámara USB o cámara virtual que tu navegador reconozca. Autoriza la cámara para ver todos los nombres.</p>
    {busy && <p role="status" className="text-sm">Conectando la fuente de video…</p>}
    {(error || listError) && <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">{error || listError}</p>}
  </section>;
}
