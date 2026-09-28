import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertCircle, CheckCircle2, AlertTriangle, Edit3, Check } from 'lucide-react';
import { Transaction, ExpenseCategory } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CATEGORY_COLORS } from '../data/initialData';

interface BudgetsViewProps {
  transactions: Transaction[];
  hideValues: boolean;
}

const DEFAULT_BUDGETS: Record<ExpenseCategory, number> = {
  'Supermercado': 1200,
  'Aluguel': 2500,
  'Internet': 150,
  'Energia & Água': 300,
  'Streaming & Assinaturas': 150,
  'Transporte': 350,
  'Lazer & Restaurantes': 400,
  'Saúde': 250,
  'Educação': 300,
  'Outros': 200,
};

const STORAGE_BUDGETS_KEY = 'financas_ai_budget_limits';

export const BudgetsView: React.FC<BudgetsViewProps> = ({ transactions, hideValues }) => {
  const [budgets, setBudgets] = useState<Record<ExpenseCategory, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUDGETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BUDGETS;
  });

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }, [budgets]);

  // Calculate actual spending per category in current period
  const actualSpent: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'fixed_expense' || tx.type === 'variable_expense') {
      actualSpent[tx.category] = (actualSpent[tx.category] || 0) + tx.amount;
    }
  });

  const handleStartEdit = (category: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit.toString());
  };

  const handleSaveLimit = (category: ExpenseCategory) => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val > 0) {
      setBudgets((prev) => ({ ...prev, [category]: val }));
    }
    setEditingCategory(null);
  };

  const categories = Object.keys(DEFAULT_BUDGETS) as ExpenseCategory[];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Metas e Tetos de Gastos
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Controle limites mensais por categoria para não estourar o orçamento
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const limit = budgets[cat] || 500;
          const spent = actualSpent[cat] || 0;
          const ratio = (spent / limit) * 100;
          const isOver = spent > limit;
          const isWarning = spent >= limit * 0.8 && !isOver;
          const isEditing = editingCategory === cat;

          return (
            <div
              key={cat}
              className={`p-4 rounded-2xl border transition-all ${
                isOver
                  ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                  : isWarning
                  ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                  : 'bg-white border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748B' }}
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cat}</h4>
                </div>

                <div className="flex items-center gap-1.5">
                  {isOver ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Estourado
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Atenção (80%+)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Controlado
                    </span>
                  )}
                </div>
              </div>

              {/* Amount and Limit */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div>
                  <span className="text-slate-400 font-medium">Gasto: </span>
                  <span className="font-extrabold font-mono text-slate-900">
                    {formatCurrency(spent, hideValues)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Limite: </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-indigo-400 rounded-md focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveLimit(cat)}
                        className="p-1 rounded bg-slate-900 text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat, limit)}
                      className="group/btn flex items-center gap-1 font-extrabold font-mono text-slate-700 hover:text-indigo-600 transition-colors"
                      title="Editar limite"
                    >
                      <span>{formatCurrency(limit, hideValues)}</span>
                      <Edit3 className="w-2.5 h-2.5 text-slate-300 group-hover/btn:text-indigo-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, ratio)}%` }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold font-mono">
                <span>{formatPercent(ratio)} utilizado</span>
                <span>
                  {isOver
                    ? `Excedeu em ${formatCurrency(spent - limit, hideValues)}`
                    : `Restam ${formatCurrency(limit - spent, hideValues)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
