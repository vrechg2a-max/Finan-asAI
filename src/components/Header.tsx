import React from 'react';
import { Eye, EyeOff, Calendar, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  hideValues: boolean;
  onToggleHideValues: () => void;
  onResetData: () => void;
  selectedMonth: string;
}

export const Header: React.FC<HeaderProps> = ({
  hideValues,
  onToggleHideValues,
  onResetData,
  selectedMonth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-slate-900/10">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Finanzy
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3" />
                Seguro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Gestão Financeira Pessoal
            </p>
          </div>
        </div>

        {/* Center / Period Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{selectedMonth}</span>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hide/Show privacy toggle */}
          <button
            onClick={onToggleHideValues}
            title={hideValues ? 'Mostrar valores monetários' : 'Ocultar valores monetários'}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {hideValues ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Mostrar</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Ocultar</span>
              </>
            )}
          </button>

          {/* Reset initial data */}
          <button
            onClick={onResetData}
            title="Restaurar dados padrão de exemplo"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Restaurar dados"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs ring-2 ring-white">
              AS
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-semibold text-slate-900 leading-tight">
                Alexandre S.
              </span>
              <span className="block text-[11px] text-slate-500 font-normal">
                Plano Premium
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
