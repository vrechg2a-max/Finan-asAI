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
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';

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
      return { label: 'Receita', color: 'text-emerald-700 bg-emerald-50' };
    case 'fixed_expense':
      return { label: 'Fixa', color: 'text-blue-700 bg-blue-50' };
    case 'variable_expense':
      return { label: 'Variável', color: 'text-amber-700 bg-amber-50' };
    case 'investment':
      return { label: 'Aporte', color: 'text-indigo-700 bg-indigo-50' };
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            Lançamentos
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {transactions.length}
          </span>
        </div>

        {/* Action Buttons: '+ Adicionar' & 'Filtro' */}
        <div className="flex items-center gap-2">
          {/* Quick inline search on wider screens */}
          <div className="relative hidden md:block w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Filtro Button */}
          <button
            onClick={onFilterClick}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtro</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* + Adicionar Button */}
          <button
            onClick={onAddClick}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar</span>
          </button>
        </div>
      </div>

      {/* Structured List */}
      {transactions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 my-auto">
          <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
          <p className="text-sm font-semibold text-slate-700">
            Nenhum lançamento encontrado
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Tente ajustar os filtros selecionados ou clique em "+ Adicionar" para cadastrar um novo lançamento.
          </p>
          <button
            onClick={onAddClick}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar primeiro lançamento</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px] pr-1 scrollbar-thin">
          {transactions.map((tx) => {
            const isRevenue = tx.type === 'revenue';
            const isInvestment = tx.type === 'investment';
            const badge = getTypeBadge(tx.type);

            return (
              <div
                key={tx.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {tx.title}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions (Edit Icon required) */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
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
                  </span>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    {/* Required Edit Icon per row */}
                    <button
                      onClick={() => onEditClick(tx)}
                      title="Editar lançamento"
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label={`Editar ${tx.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir lançamento "${tx.title}"?`)) {
                          onDeleteClick(tx.id);
                        }
                      }}
                      title="Excluir lançamento"
                      className="p-1.5 sm:p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
