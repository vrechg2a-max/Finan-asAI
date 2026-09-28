import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Transaction } from '../types/finance';
import { parseNaturalLanguageTransaction } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';

interface QuickCommandBarProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  hideValues: boolean;
}

export const QuickCommandBar: React.FC<QuickCommandBarProps> = ({
  onAddTransaction,
  hideValues,
}) => {
  const [text, setText] = useState('');
  const [successToast, setSuccessToast] = useState<{ title: string; amount: number; type: string } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const parsed = parseNaturalLanguageTransaction(text);
    if (!parsed) {
      setErrorToast('Não identifiquei o valor. Ex: "gastei 50 com mercado" ou "recebi 50 de um trabalho"');
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }

    onAddTransaction({
      title: parsed.title,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: parsed.date,
      paymentMethod: parsed.paymentMethod,
      status: 'paid',
    });

    setSuccessToast({
      title: parsed.title,
      amount: parsed.amount,
      type: parsed.type === 'revenue' ? 'Receita' : parsed.type === 'investment' ? 'Aporte' : 'Despesa',
    });
    setText('');
    setErrorToast(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center absolute left-2 pointer-events-none">
          <Sparkles className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Lançamento rápido: "gastei 50 com mercado", "recebi 50 de um trabalho"...'
          className="w-full pl-13 pr-12 py-3.5 bg-white rounded-3xl border border-slate-200/90 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all font-medium placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center absolute right-2.5 transition-all shadow-xs"
          aria-label="Registrar lançamento rápido"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Success Notification Pill */}
      {successToast && (
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 border border-emerald-200/70 text-emerald-800 rounded-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              Lançado: <strong>{successToast.title}</strong> • {formatCurrency(successToast.amount, hideValues)} ({successToast.type})
            </span>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorToast && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/70 text-amber-800 rounded-2xl text-xs font-medium animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}
    </div>
  );
};
