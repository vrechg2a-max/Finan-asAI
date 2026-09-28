import React from 'react';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Sparkles, Settings, ShieldCheck } from 'lucide-react';
import { formatMonthYear } from '../utils/formatters';

interface HeaderProps {
  hideValues: boolean;
  onToggleHideValues: () => void;
  selectedMonth: string; // e.g. "2026-09"
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenSettings: () => void;
  onOpenAiAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hideValues,
  onToggleHideValues,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onOpenSettings,
  onOpenAiAdvisor,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo Zone */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-slate-900/20 ring-1 ring-white/20">
              <span className="tracking-tighter bg-gradient-to-r from-white via-indigo-100 to-emerald-300 bg-clip-text text-transparent">
                F
              </span>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                Finanças<span className="text-indigo-600">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                <Sparkles className="w-2.5 h-2.5" />
                Inteligência Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Gestão Financeira & Patrimônio
            </p>
          </div>
        </div>

        {/* Dynamic Period Selector (Prev / Next Month) */}
        <div className="flex items-center bg-slate-100/90 rounded-2xl p-1 border border-slate-200/80 shadow-2xs">
          <button
            onClick={onPrevMonth}
            title="Mês anterior"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white transition-all active:scale-90"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-2.5 sm:px-4 text-center min-w-[110px] sm:min-w-[130px]">
            <span className="block text-xs sm:text-sm font-bold text-slate-900 tracking-tight select-none">
              {formatMonthYear(selectedMonth)}
            </span>
          </div>

          <button
            onClick={onNextMonth}
            title="Próximo mês"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white transition-all active:scale-90"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* AI Advisor Button on Header (visible on larger screens and tablet) */}
          <button
            onClick={onOpenAiAdvisor}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultor IA</span>
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={onToggleHideValues}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            className="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
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

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configurações e Exportação"
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
