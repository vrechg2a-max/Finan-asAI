import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Sparkles, ArrowRight, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { Transaction, TransactionType, AllCategories, PaymentMethod, PaymentStatus } from '../types/finance';
import { parseNaturalLanguageTransaction } from '../services/aiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
}

const CATEGORIES_BY_TYPE: Record<TransactionType, AllCategories[]> = {
  revenue: ['Salário', 'Freelance & Projetos', 'Dividendos', 'Outras Receitas'],
  fixed_expense: ['Aluguel', 'Internet', 'Energia & Água', 'Streaming & Assinaturas', 'Educação', 'Outros'],
  variable_expense: ['Supermercado', 'Transporte', 'Lazer & Restaurantes', 'Saúde', 'Outros'],
  investment: ['Renda Fixa', 'Ações & FIIs', 'Reserva de Emergência', 'Cripto'],
};

const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Boleto', 'Transferência'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultType = 'variable_expense',
}) => {
  const [tab, setTab] = useState<'form' | 'ai'>('form');
  const [aiPrompt, setAiPrompt] = useState('');
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<AllCategories>('Supermercado');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod || 'Pix');
      setStatus(initialData.status || 'paid');
      setNotes(initialData.notes || '');
      setTab('form');
    } else {
      setTitle('');
      setAmount('');
      setType(defaultType);
      setCategory(CATEGORIES_BY_TYPE[defaultType][0]);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Pix');
      setStatus('paid');
      setNotes('');
      setAiPrompt('');
      setTab('form');
    }
    setError(null);
  }, [initialData, isOpen, defaultType]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCategories = CATEGORIES_BY_TYPE[newType];
    if (!validCategories.includes(category)) {
      setCategory(validCategories[0]);
    }
  };

  const handleApplyAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const parsed = parseNaturalLanguageTransaction(aiPrompt);
    if (!parsed) {
      setError('Não consegui identificar o valor ou dados na frase. Exemplo: "Almoço 45 reais no debito" ou "Salario 7000"');
      return;
    }

    setTitle(parsed.title);
    setAmount(parsed.amount.toString());
    setType(parsed.type);
    setCategory(parsed.category);
    if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
    setDate(parsed.date);
    setTab('form');
    setError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe a descrição do lançamento.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor monetário válido maior que zero.');
      return;
    }

    onSave({
      id: initialData?.id,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      paymentMethod,
      status,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {initialData ? 'Atualize as informações' : 'Adicione receitas, despesas ou aportes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Quick Tab Bar (Only when creating) */}
        {!initialData && (
          <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('form')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                tab === 'form'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Formulário Direto
            </button>
            <button
              type="button"
              onClick={() => setTab('ai')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                tab === 'ai'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Lançamento Inteligente IA</span>
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin">
          {error && (
            <div className="mb-4 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {tab === 'ai' && !initialData ? (
            <div className="space-y-4 py-2">
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-4 rounded-2xl border border-indigo-100/80">
                <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Digite ou cole naturalmente o que você gastou ou recebeu:</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  A IA identifica o valor, se é receita ou despesa, a categoria e a forma de pagamento automaticamente!
                </p>

                <form onSubmit={handleApplyAi} className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder='Ex: "Gastei 68 reais no almoço de hoje no débito" ou "Salário 7200 via pix"'
                      className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/80 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Exemplos rápidos:</span>
                    {[
                      'Uber 32 reais no crédito',
                      'Mercado 280 reais',
                      'Investimento Selic 500',
                      'Freelance 1500 no pix'
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setAiPrompt(sample)}
                        className="text-[10px] bg-white border border-slate-200/80 hover:border-indigo-300 text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Processar com IA & Preencher</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Operação
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('revenue')}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      type === 'revenue'
                        ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('fixed_expense')}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      type === 'fixed_expense'
                        ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fixa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('variable_expense')}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      type === 'variable_expense'
                        ? 'bg-white text-amber-700 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Variável
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('investment')}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      type === 'investment'
                        ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aporte
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aluguel, Supermercado, Salário..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AllCategories)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                >
                  {CATEGORIES_BY_TYPE[type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setStatus('paid')}
                      className={`py-1.5 rounded-lg text-center transition-all ${
                        status === 'paid'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      Pago
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('pending')}
                      className={`py-1.5 rounded-lg text-center transition-all ${
                        status === 'pending'
                          ? 'bg-amber-500 text-white shadow-2xs font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      Pendente
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Parcela 2/6, restaurante com amigos..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                {initialData && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Deseja realmente excluir este lançamento?')) {
                        onDelete(initialData.id);
                        onClose();
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
