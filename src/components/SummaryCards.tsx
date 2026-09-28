import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet, TrendingUp } from 'lucide-react';
import { SummaryData } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  summary: SummaryData;
  hideValues: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, hideValues }) => {
  const isPositiveBalance = summary.balance >= 0;
  
  // Percentages relative to revenue
  const expenseRatio = summary.revenue > 0 ? Math.round((summary.expenses / summary.revenue) * 100) : 0;
  const investmentRatio = summary.revenue > 0 ? Math.round((summary.investment / summary.revenue) * 100) : 0;
  const balanceRatio = summary.revenue > 0 ? Math.round((summary.balance / summary.revenue) * 100) : 0;

  return (
    <section aria-label="Resumo Financeiro" className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Receita */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Receita
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums truncate">
              {formatCurrency(summary.revenue, hideValues)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3 h-3 hidden sm:inline" />
              <span>Entradas do mês</span>
            </div>
          </div>
        </div>

        {/* Card 2: Investimentos */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Investimentos
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums truncate">
              {formatCurrency(summary.investment, hideValues)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-indigo-600 font-semibold">
              <span>Aportes & Reserva</span>
              <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] hidden sm:inline">
                {investmentRatio}% da renda
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Despesas */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Despesas
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums truncate">
              {formatCurrency(summary.expenses, hideValues)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-rose-500 font-semibold">
              <span>Fixas + Variáveis</span>
              <span className="bg-rose-50 px-1.5 py-0.5 rounded text-[10px] hidden sm:inline">
                {expenseRatio}% da renda
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Saldo */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all ${
              isPositiveBalance ? 'bg-slate-900/5' : 'bg-rose-500/10'
            }`}
          />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Saldo
            </span>
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                isPositiveBalance
                  ? 'bg-slate-900 text-white'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div
              className={`text-base sm:text-2xl font-bold tracking-tight font-mono tabular-nums truncate ${
                isPositiveBalance ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(summary.balance, hideValues)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium">
              <span>Disponível em caixa</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold hidden sm:inline ${
                  isPositiveBalance
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isPositiveBalance ? `+${balanceRatio}% livre` : 'Negativo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
