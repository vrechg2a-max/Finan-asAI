import { useState, useEffect, useMemo } from 'react';
import { Transaction, CategoryFilter, SummaryData } from './types/finance';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { CategoryTabs } from './components/CategoryTabs';
import { TransactionsList } from './components/TransactionsList';
import { DistributionChart } from './components/DistributionChart';
import { TransactionModal } from './components/TransactionModal';
import { FilterDrawer, FilterState } from './components/FilterDrawer';
import { Plus, Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';

const STORAGE_KEY = 'finanzy_transactions_v1';
const PRIVACY_KEY = 'finanzy_hide_values';

export default function App() {
  // Load transactions from localStorage or default initial data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // Privacy toggle
  const [hideValues, setHideValues] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRIVACY_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Active category filter tab: 'all', 'revenue', 'fixed_expense', 'variable_expense'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryFilter>('all');

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'recent',
    minAmount: '',
    maxAmount: '',
  });

  // Transaction Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_KEY, String(hideValues));
    } catch (e) {
      console.error('Failed to save privacy setting', e);
    }
  }, [hideValues]);

  // Calculate Summary metrics
  const summary: SummaryData = useMemo(() => {
    let revenue = 0;
    let investment = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    transactions.forEach((tx) => {
      switch (tx.type) {
        case 'revenue':
          revenue += tx.amount;
          break;
        case 'investment':
          investment += tx.amount;
          break;
        case 'fixed_expense':
          fixedExpenses += tx.amount;
          break;
        case 'variable_expense':
          variableExpenses += tx.amount;
          break;
      }
    });

    const expenses = fixedExpenses + variableExpenses;
    const balance = revenue - expenses - investment;

    return {
      revenue,
      investment,
      expenses,
      balance,
    };
  }, [transactions]);

  // Counts for the CategoryTabs
  const tabCounts = useMemo(() => {
    let revenue = 0;
    let fixed_expense = 0;
    let variable_expense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'revenue') revenue++;
      if (tx.type === 'fixed_expense') fixed_expense++;
      if (tx.type === 'variable_expense') variable_expense++;
    });

    return {
      all: transactions.length,
      revenue,
      fixed_expense,
      variable_expense,
    };
  }, [transactions]);

  // Filtered and sorted transactions for the list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Tab category filter
        if (activeCategoryFilter !== 'all' && tx.type !== activeCategoryFilter) {
          return false;
        }

        // Search filter (title or notes or category)
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(query);
          const matchesCategory = tx.category.toLowerCase().includes(query);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
          if (!matchesTitle && !matchesCategory && !matchesNotes) {
            return false;
          }
        }

        // Min amount
        if (filters.minAmount) {
          const min = parseFloat(filters.minAmount);
          if (!isNaN(min) && tx.amount < min) return false;
        }

        // Max amount
        if (filters.maxAmount) {
          const max = parseFloat(filters.maxAmount);
          if (!isNaN(max) && tx.amount > max) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'recent':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'oldest':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'highest':
            return b.amount - a.amount;
          case 'lowest':
            return a.amount - b.amount;
          default:
            return 0;
        }
      });
  }, [transactions, activeCategoryFilter, filters]);

  // Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'> & { id?: string }
  ) => {
    if (txData.id) {
      // Editing existing
      setTransactions((prev) =>
        prev.map((t) => (t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t))
      );
    } else {
      // Creating new
      const newTransaction: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleResetData = () => {
    if (confirm('Deseja restaurar os lançamentos padrão de demonstração?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setActiveCategoryFilter('all');
      setFilters({
        search: '',
        sortBy: 'recent',
        minAmount: '',
        maxAmount: '',
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'recent',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.minAmount || filters.maxAmount || filters.sortBy !== 'recent'
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans pb-20 sm:pb-12">
      {/* Top Header */}
      <Header
        hideValues={hideValues}
        onToggleHideValues={() => setHideValues((v) => !v)}
        onResetData={handleResetData}
        selectedMonth="Setembro 2026"
      />

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 flex-1">
        {/* Top Summary Cards (Receita, Investir, Despesas, Saldo) */}
        <SummaryCards summary={summary} hideValues={hideValues} />

        {/* Category Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <CategoryTabs
            activeFilter={activeCategoryFilter}
            onSelectFilter={setActiveCategoryFilter}
            counts={tabCounts}
          />

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Taxa de Poupança:{' '}
              <strong className="text-slate-900 font-mono">
                {summary.revenue > 0
                  ? `${Math.round(((summary.investment + Math.max(0, summary.balance)) / summary.revenue) * 100)}%`
                  : '0%'}
              </strong>
            </span>
          </div>
        </div>

        {/* Main Grid: Lançamentos & Gráfico de Distribuição lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna da Lista de Lançamentos (7 colunas no desktop) */}
          <div className="lg:col-span-7 flex flex-col">
            <TransactionsList
              transactions={filteredTransactions}
              onAddClick={handleOpenAdd}
              onFilterClick={() => setIsFilterOpen(true)}
              onEditClick={handleOpenEdit}
              onDeleteClick={handleDeleteTransaction}
              hideValues={hideValues}
              searchQuery={filters.search}
              onSearchChange={(q) => setFilters((f) => ({ ...f, search: q }))}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Coluna do Gráfico de Distribuição (Donut Chart) (5 colunas no desktop) */}
          <div className="lg:col-span-5 flex flex-col">
            <DistributionChart
              transactions={transactions}
              activeFilter={activeCategoryFilter}
              hideValues={hideValues}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button (Thumb Zone for mobile phones) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={handleOpenAdd}
          className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/30 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Adicionar lançamento"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
        defaultType={
          activeCategoryFilter === 'revenue'
            ? 'revenue'
            : activeCategoryFilter === 'fixed_expense'
            ? 'fixed_expense'
            : activeCategoryFilter === 'variable_expense'
            ? 'variable_expense'
            : 'fixed_expense'
        }
      />

      {/* Filter & Sorting Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}
