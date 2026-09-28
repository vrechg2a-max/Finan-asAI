import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import { SummaryData } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  summary: SummaryData;
  hideValues: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, hideValues }) => {
  const isPositiveBalance = summary.balance >= 0;

  return (
    <section aria-label="Resumo Financeiro" className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Receita */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Receita
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {formatCurrency(summary.revenue, hideValues)}
            </div>
            <div className="mt-1 flex items-center text-[11px] sm:text-xs text-emerald-600 font-medium">
              <span>Entradas do mês</span>
            </div>
          </div>
        </div>

        {/* Card 2: Investir */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Investir
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {formatCurrency(summary.investment, hideValues)}
            </div>
            <div className="mt-1 flex items-center text-[11px] sm:text-xs text-indigo-600 font-medium">
              <span>Aportes & Reserva</span>
            </div>
          </div>
        </div>

        {/* Card 3: Despesas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Despesas
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {formatCurrency(summary.expenses, hideValues)}
            </div>
            <div className="mt-1 flex items-center text-[11px] sm:text-xs text-rose-500 font-medium">
              <span>Fixas + Variáveis</span>
            </div>
          </div>
        </div>

        {/* Card 4: Saldo */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Saldo
            </span>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                isPositiveBalance
                  ? 'bg-slate-900 text-white'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div
              className={`text-lg sm:text-2xl font-bold tracking-tight font-mono tabular-nums ${
                isPositiveBalance ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(summary.balance, hideValues)}
            </div>
            <div className="mt-1 flex items-center text-[11px] sm:text-xs text-slate-500 font-medium">
              <span>Disponível em caixa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
