import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Eye, EyeOff } from 'lucide-react';
import { SummaryData } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  summary: SummaryData;
  hideValues: boolean;
  onToggleHideValues?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  hideValues,
  onToggleHideValues,
}) => {
  const isPositive = summary.balance >= 0;

  return (
    <section aria-label="Saldo Geral" className="w-full">
      {/* Clean Minimalist Hero Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Saldo Disponível
            </span>
            {onToggleHideValues && (
              <button
                onClick={onToggleHideValues}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
              >
                {hideValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Large Clean Balance */}
        <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
          {formatCurrency(summary.balance, hideValues)}
        </div>

        {/* Subtle Minimalist Breakdown Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-left">
          {/* Receitas */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Receitas</span>
            </div>
            <div className="text-xs sm:text-base font-bold text-emerald-600 font-mono tabular-nums truncate">
              {formatCurrency(summary.revenue, hideValues)}
            </div>
          </div>

          {/* Despesas */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Despesas</span>
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-800 font-mono tabular-nums truncate">
              {formatCurrency(summary.expenses, hideValues)}
            </div>
          </div>

          {/* Investimentos */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Aportes</span>
            </div>
            <div className="text-xs sm:text-base font-bold text-indigo-600 font-mono tabular-nums truncate">
              {formatCurrency(summary.investment, hideValues)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
