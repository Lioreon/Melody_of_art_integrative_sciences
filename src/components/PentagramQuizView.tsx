import { useEffect, useRef, useState } from 'react';
import type { AppTheme, DualPalmState, ScaleNote } from '../types';
import { ledgerLineStepsForStaffStep, mapHeightToNote, TREBLE_TRAINING_RANGE } from '../data/musicalScaleData';
import { audioSynthesizer } from '../services/audioSynthesizer';
import { createQuizSession, DEFAULT_QUIZ_CONFIG, nextQuizQuestion, stepQuiz, summarizeQuiz, type QuizConfig, type QuizSession } from '../services/pentagramQuiz';

function noteFor(id: string): ScaleNote {
  return TREBLE_TRAINING_RANGE.find(note => note.id === id)!;
}

function QuizStaff({ candidates, currentNote }: { candidates: string[]; currentNote: ScaleNote | null }) {
  const note = (item: ScaleNote, x: number, user = false) => {
    const y = 170 - item.staffLineIndex * 10;
    const down = item.staffLineIndex >= 6;
    return <g key={user ? 'user' : item.id} className={user ? 'text-[var(--ui-blue)]' : 'text-[var(--ui-text)]'}>
      {ledgerLineStepsForStaffStep(item.staffLineIndex).map(step => <line key={step} x1={x - 17} x2={x + 17} y1={170 - step * 10} y2={170 - step * 10} stroke="currentColor" strokeWidth="2" />)}
      {user && <circle cx={x} cy={y} r="19" fill="currentColor" opacity="0.12" />}
      <ellipse cx={x} cy={y} rx="9" ry="6" transform={`rotate(-22 ${x} ${y})`} fill="currentColor" />
      <line x1={x + (down ? -8 : 8)} x2={x + (down ? -8 : 8)} y1={y} y2={y + (down ? 34 : -34)} stroke="currentColor" strokeWidth="2.5" />
      {user && <text x={x} y="232" fill="currentColor" textAnchor="middle" fontSize="14" fontWeight="bold">TÚ</text>}
    </g>;
  };
  return <svg viewBox="0 0 560 250" role="img" aria-label="Pentagrama con notas candidatas y la nota dinámica TÚ" className="w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)]">
    {[2, 4, 6, 8, 10].map(step => <line key={step} x1="20" x2="540" y1={170 - step * 10} y2={170 - step * 10} stroke="var(--ui-text-muted)" strokeWidth="1.8" />)}
    <text x="43" y="156" fill="var(--ui-text)" fontSize="70" fontFamily="serif" textAnchor="middle">𝄞</text>
    {candidates.map((id, i) => note(noteFor(id), 110 + i * 83))}
    <line x1="447" x2="447" y1="30" y2="211" stroke="var(--ui-border)" strokeDasharray="4 4" />
    {currentNote ? note(currentNote, 495, true) : <text x="495" y="130" fill="var(--ui-text-muted)" fontSize="13" textAnchor="middle">Sin señal</text>}
  </svg>;
}

function ProgressBar({ label, value, detail, tone = 'response' }: {
  label: string;
  value: number;
  detail: string;
  tone?: 'response' | 'hold';
}) {
  const percent = Math.max(0, Math.min(100, value));
  const fillClass = tone === 'hold' ? 'bg-[var(--ui-jade)]' : 'bg-[var(--ui-blue)]';
  return <div className="space-y-1.5">
    <div className="flex justify-between gap-3 text-sm">
      <span className="font-medium text-[var(--ui-text)]">{label}</span>
      <span className="font-mono text-[var(--ui-text-muted)]">{detail}</span>
    </div>
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 overflow-hidden rounded-full bg-[var(--ui-border)]"
    >
      <div className={`h-full rounded-full transition-[width] duration-150 ${fillClass}`} style={{ width: `${percent}%` }} />
    </div>
  </div>;
}

export function PentagramQuizView({ palmState, theme }: { palmState: DualPalmState; theme?: AppTheme }) {
  const [config, setConfig] = useState<QuizConfig>({ ...DEFAULT_QUIZ_CONFIG });
  const [session, setSession] = useState<QuizSession | null>(null);
  const [configError, setConfigError] = useState('');
  const seed = useRef(42);
  const lastTick = useRef<number | null>(null);
  const hasTracking = Boolean(palmState.leftPalm?.present && palmState.rightPalm?.present);
  const currentNote = hasTracking ? mapHeightToNote((palmState.leftPalm!.center.y + palmState.rightPalm!.center.y) / 2) : null;
  const observation = useRef({ trackingValid: hasTracking, noteId: currentNote?.id ?? null });
  const soundKey = useRef('');
  const phase = session?.phase;
  const questionIndex = session?.index;

  // Apply changes at the observation boundary: leaving a note resets retention
  // immediately, and recovery starts a fresh runtime interval without charging loss.
  useEffect(() => {
    observation.current = { trackingValid: hasTracking, noteId: currentNote?.id ?? null };
    lastTick.current = performance.now();
    setSession(previous => previous ? stepQuiz(previous, observation.current, 0) : null);
  }, [hasTracking, currentNote?.id]);

  useEffect(() => {
    if (phase !== 'active') return;
    lastTick.current = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = Math.max(0, now - (lastTick.current ?? now));
      lastTick.current = now;
      if (document.hidden) return;
      setSession(previous => previous ? stepQuiz(previous, observation.current, elapsed) : null);
    }, 25);
    const visibility = () => { lastTick.current = performance.now(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility); lastTick.current = null; };
  }, [phase, questionIndex]);

  useEffect(() => {
    if (!session || session.phase !== 'feedback') return;
    if (session.config.feedback === 'final') {
      setSession(previous => previous ? nextQuizQuestion(previous) : null);
      return;
    }
    const result = session.results[session.results.length - 1];
    const key = `${session.index}:${result.targetNoteId}`;
    if (result.result === 'correct' && soundKey.current !== key) {
      soundKey.current = key;
      audioSynthesizer.playHitSound(95);
    }
  }, [session]);

  const panel = 'rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 sm:p-6 shadow-[var(--ui-shadow)]';
  const button = 'touch-target rounded-xl bg-[var(--ui-forest)] px-5 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-gold)]';
  const input = 'mt-1 w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] px-3 py-2 text-base text-[var(--ui-text)] sm:text-sm';
  const change = <K extends keyof QuizConfig>(key: K, value: QuizConfig[K]) => setConfig(previous => ({ ...previous, [key]: value }));

  if (!session) return <section className={`${panel} space-y-5`} data-theme={theme}>
    <div><h2 className="text-xl font-bold">Quiz / Evaluación de notas</h2><p className="mt-2 text-sm text-[var(--ui-text-muted)]">Lee la nota, búscala subiendo o bajando ambas manos y mantén su posición. La apertura no se evalúa en este Quiz.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Notas candidatas<select className={input} value={config.candidateCount} onChange={e => change('candidateCount', Number(e.target.value) as 3 | 4)}><option value="3">3 notas</option><option value="4">4 notas</option></select></label>
      <label className="text-sm">Preguntas<select className={input} value={config.questionCount} onChange={e => change('questionCount', Number(e.target.value) as 5 | 10)}><option value="5">5 preguntas</option><option value="10">10 preguntas</option></select></label>
      <label className="text-sm">Tiempo por pregunta (segundos)<input className={input} type="number" min="2" max="60" step="0.5" value={config.responseTimeMs / 1000} onChange={e => change('responseTimeMs', Number(e.target.value) * 1000)} /></label>
      <label className="text-sm">Retención (segundos)<input className={input} type="number" min="0.25" max={config.responseTimeMs / 1000} step="0.25" value={config.holdTimeMs / 1000} onChange={e => change('holdTimeMs', Number(e.target.value) * 1000)} /></label>
      <label className="text-sm">Feedback<select className={input} value={config.feedback} onChange={e => change('feedback', e.target.value as QuizConfig['feedback'])}><option value="immediate">Después de cada pregunta</option><option value="final">Al final de la sesión</option></select></label>
    </div>
    <p className="text-sm text-[var(--ui-text-muted)]">Rango: Sol3–Si5. Si falta una mano, ambos tiempos se pausan. Usa la cámara o ajusta manualmente la altura en modo Virtual.</p>
    {configError && <p role="alert" className="text-sm">{configError}</p>}
    <button type="button" className={button} onClick={() => {
      try { setSession(createQuizSession(config, seed.current)); seed.current++; soundKey.current = ''; setConfigError(''); }
      catch { setConfigError('Revisa los tiempos: respuesta de 2 a 60 segundos; retención de al menos 0,25 segundos y no mayor que la respuesta.'); }
    }}>Comenzar evaluación</button>
  </section>;

  if (session.phase === 'complete') {
    const summary = summarizeQuiz(session.results);
    return <section className={`${panel} space-y-5`}>
      <h2 className="text-xl font-bold">Resultado de la sesión</h2>
      <p className="text-3xl font-bold">{summary.correct} / {summary.total} correctas · {Math.round(summary.percentage)} %</p>
      <p>Tiempo medio por pregunta: {(summary.meanResponseTimeMs / 1000).toFixed(1)} s <span className="text-sm text-[var(--ui-text-muted)]">(incluye búsqueda, retención y tiempos agotados)</span></p>
      <p>Retenciones completadas: {summary.holdsCompleted} / {summary.total}</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left">Detalle de las preguntas</caption><thead><tr><th scope="col" className="p-2">Nota</th><th scope="col" className="p-2">Resultado</th><th scope="col" className="p-2">Tiempo</th></tr></thead><tbody>{session.results.map((result, i) => <tr key={i} className="border-t border-[var(--ui-border)]"><td className="p-2">{noteFor(result.targetNoteId).octaveName}</td><td className="p-2">{result.result === 'correct' ? 'Nota sostenida' : 'Tiempo agotado'}</td><td className="p-2">{(result.responseTimeMs / 1000).toFixed(1)} s</td></tr>)}</tbody></table></div>
      <button type="button" className={button} onClick={() => setSession(null)}>Configurar otra sesión</button>
    </section>;
  }

  const question = session.questions[session.index];
  const targetNote = noteFor(question.targetNoteId);
  const lastResult = session.results[session.results.length - 1];
  const immediateFeedback = session.phase === 'feedback' && session.config.feedback === 'immediate';
  const onTarget = hasTracking && currentNote?.id === question.targetNoteId;
  const guidance = !hasTracking
    ? 'Seguimiento pausado. Muestra ambas manos; el tiempo espera.'
    : onTarget
      ? 'Objetivo encontrado. Mantén esta posición.'
      : 'Sube o baja ambas manos hasta encontrar la nota.';

  return <section className={`${panel} space-y-4 p-3 sm:space-y-5 sm:p-5`} data-quiz-phase={session.phase}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ui-gold-text)]">Pentagrama · Quiz</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--ui-text-muted)]">Pregunta {session.index + 1} / {session.questions.length}</p>
      </div>
      <button
        type="button"
        className="touch-target rounded-xl border border-[var(--ui-border)] px-3 py-2 text-sm text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)]"
        onClick={() => setSession(null)}
      >
        Terminar
      </button>
    </div>

    <div className="flex items-start justify-between gap-4 rounded-2xl bg-[var(--ui-surface-muted)] px-4 py-3 sm:px-5 sm:py-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ui-gold-text)]">Meta musical</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[var(--ui-text)] sm:text-3xl">
          Encuentra {targetNote.octaveName}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ui-text-muted)]">
          Usa la altura de ambas manos para buscarla y mantén la posición al encontrarla.
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-[var(--ui-gold)]/30 bg-[var(--ui-gold)]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ui-gold-text)]">
        Meta
      </span>
    </div>

    <QuizStaff candidates={question.candidateIds} currentNote={currentNote} />

    {immediateFeedback ? (
      <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-4 text-center" role="status">
        <p className="font-bold text-[var(--ui-text)]">{lastResult.result === 'correct' ? '¡Correcto! Nota sostenida.' : 'Tiempo agotado.'}</p>
        <p className="mt-1 text-sm text-[var(--ui-text-muted)]">La nota era {noteFor(lastResult.targetNoteId).octaveName}.</p>
        <button type="button" className={`${button} mt-4`} onClick={() => setSession(nextQuizQuestion(session))}>
          {session.index + 1 === session.questions.length ? 'Ver resultado' : 'Siguiente pregunta'}
        </button>
      </div>
    ) : (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
          !hasTracking
            ? 'bg-[var(--ui-surface-muted)] text-[var(--ui-text-muted)]'
            : onTarget
              ? 'bg-[var(--ui-jade)]/10 text-[var(--ui-jade-text)]'
              : 'bg-[var(--music-note-accent)]/8 text-[var(--ui-text)]'
        }`}
      >
        {guidance}
      </div>
    )}

    <div className="grid gap-4 rounded-2xl bg-[var(--ui-background)] px-3 py-3 sm:grid-cols-2 sm:px-4 sm:py-4">
      <ProgressBar
        label="Tiempo"
        value={(1 - session.elapsedMs / session.config.responseTimeMs) * 100}
        detail={`${((session.config.responseTimeMs - session.elapsedMs) / 1000).toFixed(1)} s`}
      />
      <ProgressBar
        label="Mantén"
        tone="hold"
        value={session.holdMs / session.config.holdTimeMs * 100}
        detail={`${(session.holdMs / 1000).toFixed(2)} / ${(session.config.holdTimeMs / 1000).toFixed(2)} s`}
      />
    </div>

    <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--ui-text-muted)]">
      <span className={`h-2.5 w-2.5 rounded-full ${hasTracking ? 'bg-[var(--ui-jade)]' : 'bg-[var(--ui-border)]'}`} aria-hidden="true" />
      <span>{hasTracking ? 'Seguimiento activo' : 'Seguimiento pausado'}</span>
    </div>
  </section>;
}
