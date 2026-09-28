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
  };
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: { id: CategoryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'revenue', label: 'Receita', count: counts.revenue },
    { id: 'fixed_expense', label: 'Despesa fixa', count: counts.fixed_expense },
    { id: 'variable_expense', label: 'Despesa variável', count: counts.variable_expense },
  ];

  return (
    <nav
      aria-label="Filtro de Categorias"
      className="w-full overflow-x-auto scrollbar-none py-1"
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/60 w-fit min-w-full sm:min-w-0">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs shadow-slate-200 font-bold border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-slate-100 text-slate-800 font-semibold'
                    : 'bg-slate-200/60 text-slate-500'
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
