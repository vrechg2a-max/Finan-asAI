import React, { useState } from 'react';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
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
  const [chartType, setChartType] = useState<'donut' | 'bars'>('donut');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartScope, setChartScope] = useState<'expenses' | 'fixed' | 'variable' | 'investments'>('expenses');

  // Filter transactions based on activeFilter or chartScope
  const relevantTransactions = transactions.filter((tx) => {
    if (activeFilter === 'fixed_expense') return tx.type === 'fixed_expense';
    if (activeFilter === 'variable_expense') return tx.type === 'variable_expense';
    if (activeFilter === 'investment') return tx.type === 'investment';
    if (chartScope === 'fixed') return tx.type === 'fixed_expense';
    if (chartScope === 'variable') return tx.type === 'variable_expense';
    if (chartScope === 'investments') return tx.type === 'investment';
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

  // Donut geometry
  let cumulativeAngle = 0;
  const radius = 80;
  const innerRadius = 52;
  const cx = 100;
  const cy = 100;

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              Análise de Distribuição
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Proporção por categoria
            </p>
          </div>
        </div>

        {/* View Switcher: Donut vs Bars & Scope */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Donut or Bar mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setChartType('donut')}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'donut' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Gráfico Donut"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bars')}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bars' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
              title="Gráfico em Barras"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scope selector */}
          {activeFilter === 'all' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setChartScope('expenses')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  chartScope === 'expenses'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setChartScope('fixed')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  chartScope === 'fixed'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Fixas
              </button>
              <button
                onClick={() => setChartScope('variable')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  chartScope === 'variable'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Variáveis
              </button>
            </div>
          )}
        </div>
      </div>

      {slices.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p className="text-sm font-semibold">Nenhum registro para exibir</p>
          <p className="text-xs mt-1">Adicione despesas para gerar a distribuição visual</p>
        </div>
      ) : chartType === 'donut' ? (
        <div className="flex flex-col items-center">
          {/* Donut Chart SVG */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 my-1 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full transform -rotate-90 drop-shadow-xs"
            >
              {slices.map((slice, index) => {
                const angle = (slice.percentage / 100) * 360;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + angle;
                cumulativeAngle += angle;

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
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {activeSlice ? activeSlice.name : 'Total Período'}
              </span>
              <span className="text-sm sm:text-lg font-extrabold text-slate-900 font-mono tabular-nums leading-tight mt-0.5">
                {activeSlice
                  ? formatCurrency(activeSlice.value, hideValues)
                  : formatCurrency(totalAmount, hideValues)}
              </span>
              <span className="text-xs font-bold text-indigo-600 font-mono mt-0.5">
                {activeSlice
                  ? formatPercent(activeSlice.percentage)
                  : `${slices.length} categorias`}
              </span>
            </div>
          </div>

          {/* Interactive Legend with progress indicators */}
          <div className="w-full mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            {slices.map((slice, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={slice.name}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`p-2 rounded-2xl transition-all cursor-pointer border ${
                    isHovered
                      ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {slice.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                        {formatPercent(slice.percentage)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono tabular-nums hidden sm:inline">
                        {formatCurrency(slice.value, hideValues)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${slice.percentage}%`,
                        backgroundColor: slice.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Bar breakdown mode */
        <div className="w-full space-y-3 py-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {slices.map((slice) => (
            <div key={slice.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{slice.name}</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(slice.value, hideValues)} ({formatPercent(slice.percentage)})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${slice.percentage}%`,
                    backgroundColor: slice.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
