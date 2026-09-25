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

const stepHints = [
  'Busca una postura natural, sin apretar las manos.',
  'Abre solo hasta donde el gesto siga siendo cómodo.',
  'Baja ambas manos a una altura cómoda para tu registro grave.',
  'Sube ambas manos a una altura cómoda para tu registro agudo.',
] as const;

export function BodyCalibrationPanel({ palmState, calibration, onChange }: BodyCalibrationPanelProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [message, setMessage] = useState('');
  const hasTracking = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const averageY = hasTracking ? (palmState.leftPalm!.center.y + palmState.rightPalm!.center.y) / 2 : 0.5;

  const start = () => {
    setDraft({});
    setStep(0);
    setMessage('');
    setActive(true);
  };

  const capture = () => {
    if (!hasTracking) {
      setMessage('Muestra ambas manos para continuar.');
      return;
    }

    const next: Draft = { ...draft };
    if (step === 0) next.minOpening = palmState.distanceCm;
    if (step === 1) next.maxOpening = palmState.distanceCm;
    if (step === 2) next.lowY = averageY;
    if (step === 3) next.highY = averageY;

    if (step < 3) {
      setDraft(next);
      setStep(step + 1);
      setMessage('');
      return;
    }

    const candidate: BodyCalibration = {
      minOpening: next.minOpening ?? 0,
      maxOpening: next.maxOpening ?? 0,
      lowY: next.lowY ?? 0,
      highY: next.highY ?? 0,
      capturedAt: Date.now(),
      version: BODY_CALIBRATION_VERSION,
    };

    if (!isValidBodyCalibration(candidate)) {
      setMessage('El rango quedó demasiado pequeño o invertido. Repite la secuencia con un movimiento cómodo un poco más amplio.');
      setDraft({});
      setStep(0);
      return;
    }

    onChange(candidate);
    setActive(false);
    setMessage('Rango personalizado guardado.');
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)]/35">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--ui-text)]">Calibración corporal</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Rango cómodo · guardado solo en este dispositivo</div>
        </div>
        <span className={calibration
          ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300'
          : 'rounded-full bg-slate-500/10 px-2 py-1 text-[10px] font-semibold text-slate-500'}>
          {calibration ? 'Personalizado' : 'Estándar'}
        </span>
      </div>

      {active ? (
        <div className="border-t border-[var(--ui-border)] px-3 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((_, index) => (
              <span
                key={index}
                className={index <= step
                  ? 'h-1 flex-1 rounded-full bg-cyan-600'
                  : 'h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-800'}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-700 dark:text-cyan-300">
              Paso {step + 1} de 4
            </span>
            <span className={hasTracking
              ? 'text-[10px] font-medium text-emerald-600 dark:text-emerald-300'
              : 'text-[10px] font-medium text-amber-600 dark:text-amber-300'}>
              {hasTracking ? 'Manos detectadas' : 'Esperando ambas manos'}
            </span>
          </div>

          <div className="mt-2 text-sm font-semibold text-[var(--ui-text)]">{steps[step]}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{stepHints[step]}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={capture}
              disabled={!hasTracking}
              className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Capturar
            </button>
            <button
              type="button"
              onClick={() => { setActive(false); setMessage(''); }}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-500/5"
            >
              Salir
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ui-border)] px-3 py-2.5">
          <span className="text-[11px] text-slate-500">No guarda video ni imágenes.</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={start}
              className="rounded-lg border border-cyan-700/40 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-800 hover:bg-cyan-500/5 dark:text-cyan-300"
            >
              {calibration ? 'Recalibrar' : 'Calibrar rango'}
            </button>
            {calibration && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-500 hover:bg-slate-500/5"
              >
                Restablecer
              </button>
            )}
          </div>
        </div>
      )}

      {message && (
        <p className="border-t border-[var(--ui-border)] px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
          {message}
        </p>
      )}
    </section>
  );
}
