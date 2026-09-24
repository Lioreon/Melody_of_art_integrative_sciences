/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const InstitutionalSignature: React.FC = () => (
  <footer className="border-t border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-5 text-[var(--ui-text-muted)] sm:px-4 lg:px-6">
    <div className="mx-auto grid max-w-[1500px] gap-3 text-center sm:grid-cols-3 sm:text-left">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
          Melody of Art
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--ui-text)]">Melody Motion</p>
        <p className="mt-0.5 text-[10px]">Interfaz pedagógica musical basada en movimiento.</p>
      </div>

      <div className="sm:text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
          Diseño y desarrollo
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--ui-blue)] dark:text-[var(--ui-text)]">A. Owsky</p>
        <p className="mt-0.5 text-[10px]">Ciencias Integrativas · Bolívar · Ecuador</p>
      </div>

      <div className="sm:text-right">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
          Proyecto pedagógico para
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--ui-jade)]">Escuela de Música Matiaví · Salinas</p>
        <p className="mt-0.5 text-[10px]">Prototipo educativo en desarrollo · 2026</p>
      </div>
    </div>
  </footer>
);
