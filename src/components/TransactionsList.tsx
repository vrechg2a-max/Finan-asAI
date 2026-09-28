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
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';

interface TransactionsListProps {
  transactions: Transaction[];
  onAddClick: () => void;
  onFilterClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id: string) => void;
  hideValues: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasActiveFilters: boolean;
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

const getTypeBadge = (type: Transaction['type']) => {
  switch (type) {
    case 'revenue':
      return { label: 'Receita', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/50' };
    case 'fixed_expense':
      return { label: 'Fixa', color: 'text-blue-700 bg-blue-50 border-blue-200/50' };
    case 'variable_expense':
      return { label: 'Variável', color: 'text-amber-700 bg-amber-50 border-amber-200/50' };
    case 'investment':
      return { label: 'Aporte', color: 'text-indigo-700 bg-indigo-50 border-indigo-200/50' };
  }
};

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onAddClick,
  onFilterClick,
  onEditClick,
  onDeleteClick,
  hideValues,
  searchQuery,
  onSearchChange,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Lançamentos
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {transactions.length}
            </span>
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={onAddClick}
            className="sm:hidden px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar lançamento..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
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

          {/* Filtro Button */}
          <button
            onClick={onFilterClick}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
              hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtro</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* + Adicionar Button (Desktop/Tablet) */}
          <button
            onClick={onAddClick}
            className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar</span>
          </button>
        </div>
      </div>

      {/* List Container */}
      {transactions.length === 0 ? (
        <div className="py-14 sm:py-20 text-center text-slate-400 my-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
            <Receipt className="w-7 h-7 text-slate-300 stroke-1" />
          </div>
          <p className="text-sm font-bold text-slate-700">
            Nenhum lançamento encontrado
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Tente ajustar os filtros ou clique em "+ Adicionar" para cadastrar novos registros.
          </p>
          <button
            onClick={onAddClick}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Lançamento</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[560px] pr-0.5 sm:pr-1 scrollbar-thin">
          {transactions.map((tx) => {
            const isRevenue = tx.type === 'revenue';
            const isInvestment = tx.type === 'investment';
            const badge = getTypeBadge(tx.type);
            const isPending = tx.status === 'pending';

            return (
              <div
                key={tx.id}
                className="py-3 px-1 sm:px-2 flex items-center justify-between hover:bg-slate-50/90 rounded-2xl transition-colors group cursor-pointer"
                onClick={() => onEditClick(tx)}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isRevenue
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : isInvestment
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200/60'
                    }`}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {tx.title}
                      </h4>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {isPending && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          Pendente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-medium">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(tx.date)}</span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">{tx.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div
                  className="flex items-center gap-2 sm:gap-3 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-extrabold font-mono tabular-nums ${
                        isRevenue
                          ? 'text-emerald-600'
                          : isInvestment
                          ? 'text-indigo-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {isRevenue ? '+' : isInvestment ? '↗' : '-'}
                      {' '}
                      {formatCurrency(tx.amount, hideValues)}
                    </div>
                    {tx.status === 'paid' && (
                      <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Pago
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center">
                    <button
                      onClick={() => onEditClick(tx)}
                      title="Editar lançamento"
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      aria-label={`Editar ${tx.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Excluir lançamento "${tx.title}"?`)) {
                          onDeleteClick(tx.id);
                        }
                      }}
                      title="Excluir lançamento"
                      className="p-1.5 sm:p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      aria-label={`Excluir ${tx.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
