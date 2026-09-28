import React from 'react';
import { CategoryFilter } from '../types/finance';

interface CategoryTabsProps {
  activeFilter: CategoryFilter;
  onSelectFilter: (filter: CategoryFilter) => void;
  counts: {
    all: number;
    revenue: number;
    fixed_expense: number;
    variable_expense: number;
    investment: number;
  };
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: { id: CategoryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'revenue', label: 'Receitas', count: counts.revenue },
    { id: 'fixed_expense', label: 'Despesas Fixas', count: counts.fixed_expense },
    { id: 'variable_expense', label: 'Despesas Variáveis', count: counts.variable_expense },
    { id: 'investment', label: 'Aportes & Reserva', count: counts.investment },
  ];

  return (
    <nav
      aria-label="Filtro de Categorias"
      className="w-full overflow-x-auto scrollbar-none py-1"
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60 w-fit min-w-full sm:min-w-0">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] sm:text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
