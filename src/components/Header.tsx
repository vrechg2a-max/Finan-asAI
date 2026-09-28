import React from 'react';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatMonthYear } from '../utils/formatters';

interface HeaderProps {
  hideValues: boolean;
  onToggleHideValues: () => void;
  selectedMonth: string; // e.g. "2026-09"
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hideValues,
  onToggleHideValues,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
            F
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            Finanças<span className="text-indigo-600">AI</span>
          </span>
        </div>

        {/* Dynamic Period Selector */}
        <div className="flex items-center bg-slate-100 rounded-2xl p-0.5 border border-slate-200/70">
          <button
            onClick={onPrevMonth}
            title="Mês anterior"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all active:scale-90"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 text-xs font-bold text-slate-800 select-none min-w-[105px] sm:min-w-[125px] text-center">
            {formatMonthYear(selectedMonth)}
          </span>

          <button
            onClick={onNextMonth}
            title="Próximo mês"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all active:scale-90"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleHideValues}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Privacidade de valores"
          >
            {hideValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Configurações"
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Configurações"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
