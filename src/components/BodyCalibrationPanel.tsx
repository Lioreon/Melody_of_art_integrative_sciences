import { useState } from 'react';
import type { BodyCalibration, DualPalmState } from '../types';
import { BODY_CALIBRATION_VERSION, isValidBodyCalibration } from '../services/bodyCalibration';

interface BodyCalibrationPanelProps {
  palmState: DualPalmState;
  calibration: BodyCalibration | null;
  onChange: (calibration: BodyCalibration | null) => void;
}

type Draft = Partial<Pick<BodyCalibration, 'minOpening' | 'maxOpening' | 'lowY' | 'highY'>>;

const steps = [
  'Junta cómodamente las manos',
  'Abre hasta donde sea cómodo',
  'Lleva las manos a una posición grave cómoda',
  'Lleva las manos a una posición aguda cómoda',
] as const;

export function BodyCalibrationPanel({ palmState, calibration, onChange }: BodyCalibrationPanelProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [message, setMessage] = useState('');
  const hasTracking = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const averageY = hasTracking ? (palmState.leftPalm!.center.y + palmState.rightPalm!.center.y) / 2 : 0.5;

  const start = () => { setDraft({}); setStep(0); setMessage(''); setActive(true); };

  const capture = () => {
    if (!hasTracking) {
      setMessage('Muestra ambas manos para capturar este punto. La calibración queda en pausa.');
      return;
    }
    const next: Draft = { ...draft };
    if (step === 0) next.minOpening = palmState.distanceCm;
    if (step === 1) next.maxOpening = palmState.distanceCm;
    if (step === 2) next.lowY = averageY;
    if (step === 3) next.highY = averageY;
    if (step < 3) { setDraft(next); setStep(step + 1); setMessage(''); return; }
    const candidate: BodyCalibration = {
      minOpening: next.minOpening ?? 0,
      maxOpening: next.maxOpening ?? 0,
      lowY: next.lowY ?? 0,
      highY: next.highY ?? 0,
      capturedAt: Date.now(),
      version: BODY_CALIBRATION_VERSION,
    };
    if (!isValidBodyCalibration(candidate)) {
      setMessage('El rango capturado es demasiado pequeño o está invertido. Repite la calibración con un movimiento cómodo un poco más amplio.');
      setDraft({}); setStep(0); return;
    }
    onChange(candidate);
    setActive(false);
    setMessage('Calibración guardada en este dispositivo.');
  };

  return (
    <section className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)]/45 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calibración corporal</div>
          <p className="mt-1 text-xs text-slate-500">Ajusta Melody Motion a tu rango cómodo. No mide capacidad física ni guarda imágenes.</p>
        </div>
        <span className={calibration ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300' : 'rounded-full bg-slate-500/10 px-2 py-1 text-[10px] font-semibold text-slate-500'}>
          {calibration ? 'Personalizada' : 'Rango estándar'}
        </span>
      </div>
      {active ? (
        <div className="mt-3 space-y-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Paso {step + 1} de 4</div>
          <div className="font-semibold">{steps[step]}</div>
          <p className="text-xs text-slate-500">Mantén una postura natural; no lleves el movimiento a un extremo físico.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={capture} disabled={!hasTracking} className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Capturar posición</button>
            <button type="button" onClick={() => { setActive(false); setMessage(''); }} className="rounded-lg border border-[var(--ui-border)] px-3 py-2 text-xs">Omitir por ahora</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={start} className="rounded-lg border border-cyan-600 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">{calibration ? 'Repetir calibración' : 'Iniciar calibración'}</button>
          {calibration && <button type="button" onClick={() => onChange(null)} className="rounded-lg border border-[var(--ui-border)] px-3 py-2 text-xs text-slate-500">Restablecer rango estándar</button>}
        </div>
      )}
      {message && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{message}</p>}
    </section>
  );
}
