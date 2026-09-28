import React, { useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Transaction, CategoryFilter } from '../types/finance';
import { CATEGORY_COLORS } from '../data/initialData';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface DistributionChartProps {
  transactions: Transaction[];
  activeFilter: CategoryFilter;
  hideValues: boolean;
}

interface CategorySlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
  count: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  transactions,
  activeFilter,
  hideValues,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartScope, setChartScope] = useState<'expenses' | 'fixed' | 'variable'>('expenses');

  // Determine which transactions to compute for the distribution
  // Default to expenses, or follow user preference / active tab
  const relevantTransactions = transactions.filter((tx) => {
    if (activeFilter === 'fixed_expense') return tx.type === 'fixed_expense';
    if (activeFilter === 'variable_expense') return tx.type === 'variable_expense';
    if (chartScope === 'fixed') return tx.type === 'fixed_expense';
    if (chartScope === 'variable') return tx.type === 'variable_expense';
    return tx.type === 'fixed_expense' || tx.type === 'variable_expense';
  });

  const totalAmount = relevantTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Group by category
  const categoryMap: Record<string, { value: number; count: number }> = {};
  relevantTransactions.forEach((tx) => {
    if (!categoryMap[tx.category]) {
      categoryMap[tx.category] = { value: 0, count: 0 };
    }
    categoryMap[tx.category].value += tx.amount;
    categoryMap[tx.category].count += 1;
  });

  // Convert to slices and sort descending
  const slices: CategorySlice[] = Object.entries(categoryMap)
    .map(([name, data]) => {
      const percentage = totalAmount > 0 ? (data.value / totalAmount) * 100 : 0;
      return {
        name,
        value: data.value,
        percentage,
        color: CATEGORY_COLORS[name] || '#64748B',
        count: data.count,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Calculate SVG arc paths for smooth donut chart
  let cumulativeAngle = 0;
  const radius = 80;
  const innerRadius = 52;
  const cx = 100;
  const cy = 100;

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Distribuição de Despesas
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Proporção por categoria
            </p>
          </div>
        </div>

        {/* View toggle (Fixas / Variáveis / Todas) */}
        {activeFilter === 'all' && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
            <button
              onClick={() => setChartScope('expenses')}
              className={`px-2 py-1 rounded-md transition-all ${
                chartScope === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setChartScope('fixed')}
              className={`px-2 py-1 rounded-md transition-all ${
                chartScope === 'fixed'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fixas
            </button>
            <button
              onClick={() => setChartScope('variable')}
              className={`px-2 py-1 rounded-md transition-all ${
                chartScope === 'variable'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Variáveis
            </button>
          </div>
        )}
      </div>

      {slices.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p className="text-sm font-medium">Nenhuma despesa para exibir</p>
          <p className="text-xs mt-1">Adicione uma despesa para gerar o gráfico</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Donut Chart SVG Container */}
          <div className="relative w-52 h-52 my-2 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full transform -rotate-90 drop-shadow-xs"
            >
              {slices.map((slice, index) => {
                const angle = (slice.percentage / 100) * 360;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + angle;
                cumulativeAngle += angle;

                // Edge case: single slice covers 100%
                if (slice.percentage >= 99.9) {
                  return (
                    <circle
                      key={slice.name}
                      cx={cx}
                      cy={cy}
                      r={(radius + innerRadius) / 2}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={radius - innerRadius}
                      className="cursor-pointer transition-opacity duration-200"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                }

                // Convert polar to cartesian
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);

                const ix1 = cx + innerRadius * Math.cos(endRad);
                const iy1 = cy + innerRadius * Math.sin(endRad);
                const ix2 = cx + innerRadius * Math.cos(startRad);
                const iy2 = cy + innerRadius * Math.sin(startRad);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L ${ix1} ${iy1}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
                  'Z',
                ].join(' ');

                const isHovered = hoveredIndex === index;

                return (
                  <path
                    key={slice.name}
                    d={pathData}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {activeSlice ? activeSlice.name : 'Total Despesas'}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums leading-tight mt-0.5">
                {activeSlice
                  ? formatCurrency(activeSlice.value, hideValues)
                  : formatCurrency(totalAmount, hideValues)}
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono mt-0.5">
                {activeSlice
                  ? formatPercent(activeSlice.percentage)
                  : `${slices.length} categorias`}
              </span>
            </div>
          </div>

          {/* Color & Percentage Legend (as requested: ex: Aluguel 68%, Internet 7%) */}
          <div className="w-full mt-4 space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {slices.map((slice, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={slice.name}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-50 ring-1 ring-slate-200'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {slice.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                      {formatPercent(slice.percentage)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums hidden sm:inline">
                      {formatCurrency(slice.value, hideValues)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
