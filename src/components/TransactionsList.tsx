import React from 'react';
import {
  Plus,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Receipt,
  Search,
  Building2,
  Wifi,
  ShoppingBag,
  Zap,
  Tv,
  Car,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Coins,
  CircleDollarSign,
  X,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';

interface TransactionsListProps {
  transactions: Transaction[];
  onAddClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id: string) => void;
  hideValues: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  compact?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Aluguel':
      return <Building2 className="w-4 h-4" />;
    case 'Internet':
      return <Wifi className="w-4 h-4" />;
    case 'Supermercado':
      return <ShoppingBag className="w-4 h-4" />;
    case 'Energia & Água':
      return <Zap className="w-4 h-4" />;
    case 'Streaming & Assinaturas':
      return <Tv className="w-4 h-4" />;
    case 'Transporte':
      return <Car className="w-4 h-4" />;
    case 'Lazer & Restaurantes':
      return <UtensilsCrossed className="w-4 h-4" />;
    case 'Saúde':
      return <HeartPulse className="w-4 h-4" />;
    case 'Educação':
      return <GraduationCap className="w-4 h-4" />;
    case 'Salário':
      return <Briefcase className="w-4 h-4" />;
    case 'Freelance & Projetos':
      return <CircleDollarSign className="w-4 h-4" />;
    case 'Dividendos':
    case 'Renda Fixa':
    case 'Ações & FIIs':
      return <TrendingUp className="w-4 h-4" />;
    case 'Reserva de Emergência':
      return <Coins className="w-4 h-4" />;
    default:
      return <Receipt className="w-4 h-4" />;
  }
};

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onAddClick,
  onEditClick,
  onDeleteClick,
  hideValues,
  searchQuery = '',
  onSearchChange,
  compact = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {compact ? 'Últimos Lançamentos' : 'Histórico de Lançamentos'}
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {transactions.length}
          </span>
        </div>

        {onSearchChange && !compact && (
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {compact && (
          <button
            onClick={onAddClick}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
          >
            + Adicionar
          </button>
        )}
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <Receipt className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
          <p className="text-xs font-semibold text-slate-600">Nenhum lançamento no período</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Use a barra acima para digitar ou clique em adicionar.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[460px] scrollbar-thin">
          {transactions.map((tx) => {
            const isRevenue = tx.type === 'revenue';
            const isInvestment = tx.type === 'investment';

            return (
              <div
                key={tx.id}
                onClick={() => onEditClick(tx)}
                className="py-3 px-1 flex items-center justify-between hover:bg-slate-50/70 rounded-2xl transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      isRevenue
                        ? 'bg-emerald-50 text-emerald-600'
                        : isInvestment
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div
                  className="flex items-center gap-2.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className={`text-xs sm:text-sm font-extrabold font-mono tabular-nums ${
                      isRevenue
                        ? 'text-emerald-600'
                        : isInvestment
                        ? 'text-indigo-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {isRevenue ? '+' : isInvestment ? '↗' : '-'} {formatCurrency(tx.amount, hideValues)}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`Excluir lançamento "${tx.title}"?`)) {
                        onDeleteClick(tx.id);
                      }
                    }}
                    title="Excluir"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
