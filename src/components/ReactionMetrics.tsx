/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReactionAttempt, SessionStats } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ReactionMetricsProps {
  stats: SessionStats;
  lastAttempt: ReactionAttempt | null;
}

export const ReactionMetrics: React.FC<ReactionMetricsProps> = ({ stats, lastAttempt }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Format data for Recharts latency history
  const chartData = stats.attempts.map((att, idx) => ({
    index: idx + 1,
    latencyMs: att.reactionTimeMs,
    accuracy: att.precisionAccuracy,
  }));

  return (
    <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 shadow-[var(--ui-shadow)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Rendimiento del Compás
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.completedCues} de {stats.totalCues} gestos registrados
          </p>
        </div>
        <div className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Calificación: {stats.conductorGrade}
        </div>
      </div>

      {/* Primary Metrics (2 simple cards instead of 4 busy colored gauges) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Latencia media</div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
            {stats.avgReactionTimeMs > 0 ? `${Math.round(stats.avgReactionTimeMs)} ms` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Mejor: {stats.bestReactionTimeMs > 0 ? `${stats.bestReactionTimeMs} ms` : '--'}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Precisión espacial</div>
          <div className="text-xl font-mono font-bold text-cyan-600 mt-1">
            {stats.avgPrecisionAccuracy > 0 ? `${Math.round(stats.avgPrecisionAccuracy)}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Tolerancia ±5 cm
          </div>
        </div>
      </div>

      {/* Collapsible Details */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          <span>Ver detalles y gráfica de latencia</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="space-y-3 pt-3">
            {/* Secondary telemetry stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Desviación del Beat</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {stats.avgBeatDriftMs !== 0 ? `${stats.avgBeatDriftMs > 0 ? '+' : ''}${Math.round(stats.avgBeatDriftMs)} ms` : '0 ms'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Estabilidad Fermata</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {stats.fermataStabilityScore > 0 ? `${Math.round(stats.fermataStabilityScore)}/100` : '--'}
                </span>
              </div>
            </div>

            {/* Latency History Chart */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs text-slate-500 mb-2">Curva de reacción por ensayo (ms)</div>
              <div className="h-[120px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                      <XAxis dataKey="index" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                        formatter={(value: any) => [`${value} ms`, 'Latencia']}
                      />
                      <Line
                        type="monotone"
                        dataKey="latencyMs"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#0ea5e9' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Inicia la dirección para registrar tiempos en milisegundos.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
