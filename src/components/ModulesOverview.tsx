/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MODULES_LIST } from '../data/scorePresets';
import { AppTheme } from '../types';
import { Info, Sparkles, Layers, Music, Sliders, ArrowRight } from 'lucide-react';

interface ModulesOverviewProps {
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  onShowInfo?: () => void;
  theme?: AppTheme;
}

export const ModulesOverview: React.FC<ModulesOverviewProps> = ({
  activeModuleId,
  onSelectModule,
  onShowInfo,
  theme = 'dark_cyan',
}) => {
  const isWhite = theme === 'white';

  return (
    <div className={`border rounded-2xl p-2.5 md:p-3 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors ${
      isWhite
        ? 'bg-white border-slate-200 text-slate-800'
        : 'bg-slate-900/90 border-cyan-900/60 text-slate-100'
    }`}>
      {/* Compact Navigation Bar Tabs for Modules 1, 2 & 3 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-none">
        <div className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
          isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-950 text-slate-400'
        }`}>
          <Layers className="w-4 h-4 text-cyan-600" />
          <span>Módulos:</span>
        </div>

        {MODULES_LIST.map((mod) => {
          const isActive = mod.id === activeModuleId;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex-1 md:flex-none flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                isActive
                  ? isWhite
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/20'
                    : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : isWhite
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                isActive
                  ? isWhite ? 'bg-cyan-800 text-white' : 'bg-slate-900 text-cyan-300'
                  : isWhite ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
              }`}>
                Mód {mod.number}
              </span>
              <span>{mod.title}</span>
            </button>
          );
        })}
      </div>

      {/* Information Button for Modules 1, 2 & 3 */}
      {onShowInfo && (
        <button
          onClick={onShowInfo}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm ${
            isWhite
              ? 'bg-amber-500/10 border-amber-300 text-amber-900 hover:bg-amber-500/20'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
          }`}
        >
          <Info className="w-4 h-4 text-amber-500" />
          <span>Información de Módulos (1, 2 y 3)</span>
        </button>
      )}
    </div>
  );
};


