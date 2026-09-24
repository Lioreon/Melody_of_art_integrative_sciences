/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, LockKeyhole, Trophy } from 'lucide-react';
import type { AppTheme } from '../types';
import {
  RANKING_UNLOCK_POINTS,
  totalLearningPoints,
  type LearningScoreBreakdown,
} from '../services/learningGame';

interface LearningRankingViewProps {
  score: LearningScoreBreakdown;
  theme?: AppTheme;
}

export const LearningRankingView: React.FC<LearningRankingViewProps> = ({
  score,
  theme = 'white',
}) => {
  const isWhite = theme === 'white';
  const total = totalLearningPoints(score);
  const remaining = Math.max(0, RANKING_UNLOCK_POINTS - total);
  const progress = Math.min(100, Math.round((total / RANKING_UNLOCK_POINTS) * 100));
  const entries = [
    { id: 'rhythm', label: 'Ritmo', points: score.rhythm },
    { id: 'pentagram', label: 'Pentagrama', points: score.pentagram },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-[var(--ui-shadow)] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ui-gold)]">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Ranking de sesión
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--ui-blue)] dark:text-[var(--ui-text)]">
              {total} puntos
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--ui-text-muted)]">
              Clasificación local del progreso obtenido en los modos de juego de Ritmo y Pentagrama.
              No usa cuentas ni compara estudiantes en línea.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-5 py-4 text-center">
            <Award className="mx-auto h-7 w-7 text-[var(--ui-jade)]" aria-hidden="true" />
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]">Desbloqueado</div>
            <div className="mt-1 text-sm font-bold text-[var(--ui-text)]">Ranking local</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-[var(--ui-shadow)] sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`rounded-2xl border p-4 ${
                index === 0
                  ? 'border-[var(--ui-gold)]/35 bg-[var(--ui-gold)]/5'
                  : 'border-[var(--ui-border)] bg-[var(--ui-background)]/45'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]">
                  #{index + 1}
                </span>
                <span className="text-sm font-bold text-[var(--ui-jade)]">{entry.points} pts</span>
              </div>
              <div className="mt-3 text-lg font-bold text-[var(--ui-text)]">{entry.label}</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--ui-border)]/60">
                <div
                  className="h-full rounded-full bg-[var(--ui-jade)]"
                  style={{ width: total > 0 ? `${Math.max(6, Math.round((entry.points / total) * 100))}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border p-4 text-sm ${
        isWhite
          ? 'border-slate-200 bg-white/60'
          : 'border-slate-700 bg-slate-950/20'
      }`}>
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ui-gold)]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[var(--ui-text)]">Cómo se desbloquea</p>
            <p className="mt-1 text-[var(--ui-text-muted)]">
              El Ranking aparece al alcanzar {RANKING_UNLOCK_POINTS} puntos. Esta primera versión ordena únicamente
              las áreas de aprendizaje de la sesión; una clasificación entre estudiantes requerirá cuentas,
              consentimiento y una arquitectura de datos posterior.
            </p>
            {remaining > 0 && (
              <>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ui-border)]/60">
                  <div className="h-full rounded-full bg-[var(--ui-gold)]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-[var(--ui-text-muted)]">Faltan {remaining} puntos.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
