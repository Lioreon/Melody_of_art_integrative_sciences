/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, Music2 } from 'lucide-react';

export const InstitutionalSignature: React.FC = () => (
  <footer className="border-t border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-5 text-[var(--ui-text-muted)] sm:px-4 lg:px-6">
    <div className="mx-auto max-w-[1500px]">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5">
        <section className="flex items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-3 md:border-0 md:bg-transparent md:px-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ui-gold)]/25 bg-[var(--ui-surface)] text-[var(--ui-gold)]">
            <Building2 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
              Proyecto pedagógico para
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--ui-text)]">Escuela de Música</p>
            <p className="text-xs font-bold tracking-wide text-[var(--ui-jade)]">Matiaví · Salinas</p>
          </div>
        </section>

        <div className="hidden h-12 w-px bg-[var(--ui-border)] md:block" aria-hidden="true" />

        <section className="flex items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-3 py-3 md:border-0 md:bg-transparent md:px-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ui-jade)]/25 bg-[var(--ui-surface)] text-[var(--ui-blue)]">
            <Music2 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
              Melody of Art
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--ui-text)]">Melody Motion</p>
            <p className="text-[10px] leading-relaxed">
              Interfaz pedagógica musical basada en movimiento.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-2 border-t border-[var(--ui-border)]/70 pt-3 text-center text-[9px] leading-relaxed sm:grid-cols-3 sm:text-left">
        <p>
          <span className="font-semibold uppercase tracking-[0.14em] text-[var(--ui-gold)]">Diseño y desarrollo</span>
          <br />
          <strong className="text-[var(--ui-blue)] dark:text-[var(--ui-text)]">A. Owsky</strong>
        </p>
        <p className="sm:text-center">
          Ciencias Integrativas · Bolívar · Ecuador
        </p>
        <p className="sm:text-right">
          Prototipo educativo en desarrollo · 2026
        </p>
      </div>
    </div>
  </footer>
);
