/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WorkspaceHeaderProps {
  title: string;
  description: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ title, description }) => (
  <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-5 py-4 shadow-[var(--ui-shadow)]">
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ui-gold)]">
      Área de aprendizaje
    </p>
    <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--ui-blue)] dark:text-[var(--ui-text)]">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--ui-text-muted)] sm:text-right">
        {description}
      </p>
    </div>
  </section>
);
