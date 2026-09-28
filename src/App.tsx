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
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { BudgetsView } from './components/BudgetsView';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { Sparkles, Target, ArrowRight, ShieldCheck, PieChart, Layers } from 'lucide-react';

const STORAGE_KEY = 'finanzy_transactions_v2';
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
      // fallback
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

  // Dynamic Month Selector (e.g. "2026-09")
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Active category filter tab: 'all', 'revenue', 'fixed_expense', 'variable_expense', 'investment'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryFilter>('all');

  // Desktop active view tab: 'overview' | 'budgets'
  const [desktopView, setDesktopView] = useState<'overview' | 'budgets'>('overview');

  // Mobile bottom navigation state
  const [mobileTab, setMobileTab] = useState<MobileTab>('dashboard');

  // Drawers and Modals
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter drawer state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'recent',
    minAmount: '',
    maxAmount: '',
  });

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

  // Month navigation handlers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Transactions belonging to selected month (or all if user chooses)
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // If month has no transactions, fall back to showing all transactions so user sees demo data
  const activeScopeTransactions = monthTransactions.length > 0 ? monthTransactions : transactions;

  // Calculate Summary metrics
  const summary: SummaryData = useMemo(() => {
    let revenue = 0;
    let investment = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    activeScopeTransactions.forEach((tx) => {
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
  }, [activeScopeTransactions]);

  // Counts for the CategoryTabs
  const tabCounts = useMemo(() => {
    let revenue = 0;
    let fixed_expense = 0;
    let variable_expense = 0;
    let investment = 0;

    activeScopeTransactions.forEach((tx) => {
      if (tx.type === 'revenue') revenue++;
      if (tx.type === 'fixed_expense') fixed_expense++;
      if (tx.type === 'variable_expense') variable_expense++;
      if (tx.type === 'investment') investment++;
    });

    return {
      all: activeScopeTransactions.length,
      revenue,
      fixed_expense,
      variable_expense,
      investment,
    };
  }, [activeScopeTransactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return activeScopeTransactions
      .filter((tx) => {
        // Tab category filter
        if (activeCategoryFilter !== 'all' && tx.type !== activeCategoryFilter) {
          return false;
        }

        // Search filter (title, category, notes, paymentMethod)
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(query);
          const matchesCategory = tx.category.toLowerCase().includes(query);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
          const matchesMethod = tx.paymentMethod ? tx.paymentMethod.toLowerCase().includes(query) : false;
          if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesMethod) {
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
  }, [activeScopeTransactions, activeCategoryFilter, filters]);

  // Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'> & { id?: string }
  ) => {
    if (txData.id) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t))
      );
    } else {
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
    setTransactions(INITIAL_TRANSACTIONS);
    setActiveCategoryFilter('all');
    setSelectedMonth('2026-09');
    setFilters({
      search: '',
      sortBy: 'recent',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleClearData = () => {
    setTransactions([]);
    setActiveCategoryFilter('all');
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans pb-24 sm:pb-12">
      {/* Top Header */}
      <Header
        hideValues={hideValues}
        onToggleHideValues={() => setHideValues((v) => !v)}
        selectedMonth={selectedMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiAdvisor={() => setIsAiOpen(true)}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 flex-1">
        {/* Top Summary Cards */}
        <SummaryCards summary={summary} hideValues={hideValues} />

        {/* Desktop View Navigation Bar (Visão Geral vs Metas de Gastos) */}
        <div className="hidden sm:flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl">
            <button
              onClick={() => setDesktopView('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                desktopView === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visão Geral & Lançamentos</span>
            </button>
            <button
              onClick={() => setDesktopView('budgets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                desktopView === 'budgets'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Metas & Tetos de Gastos</span>
            </button>
          </div>

          {/* Quick AI Trigger Banner */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-900 text-xs font-bold transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultoria Inteligente com IA</span>
            <ArrowRight className="w-3 h-3 text-indigo-500" />
          </button>
        </div>

        {/* Mobile View Switching */}
        {/* 1. Mobile Dashboard View */}
        <div className="sm:hidden">
          {mobileTab === 'dashboard' && (
            <div className="space-y-4">
              <CategoryTabs
                activeFilter={activeCategoryFilter}
                onSelectFilter={setActiveCategoryFilter}
                counts={tabCounts}
              />
              <DistributionChart
                transactions={activeScopeTransactions}
                activeFilter={activeCategoryFilter}
                hideValues={hideValues}
              />
              <TransactionsList
                transactions={filteredTransactions.slice(0, 6)}
                onAddClick={handleOpenAdd}
                onFilterClick={() => setIsFilterOpen(true)}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleDeleteTransaction}
                hideValues={hideValues}
                searchQuery={filters.search}
                onSearchChange={(q) => setFilters((f) => ({ ...f, search: q }))}
                hasActiveFilters={hasActiveFilters}
              />
              {filteredTransactions.length > 6 && (
                <button
                  onClick={() => setMobileTab('transactions')}
                  className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Ver todos os {filteredTransactions.length} lançamentos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {mobileTab === 'transactions' && (
            <div className="space-y-4">
              <CategoryTabs
                activeFilter={activeCategoryFilter}
                onSelectFilter={setActiveCategoryFilter}
                counts={tabCounts}
              />
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
          )}

          {mobileTab === 'ai' && (
            <div className="pt-1">
              <AiAdvisorDrawer
                isOpen={true}
                onClose={() => setMobileTab('dashboard')}
                transactions={activeScopeTransactions}
                hideValues={hideValues}
              />
            </div>
          )}

          {mobileTab === 'budgets' && (
            <BudgetsView
              transactions={activeScopeTransactions}
              hideValues={hideValues}
            />
          )}
        </div>

        {/* Desktop View Workspace */}
        <div className="hidden sm:block">
          {desktopView === 'overview' ? (
            <div className="space-y-6">
              {/* Category Navigation Bar */}
              <CategoryTabs
                activeFilter={activeCategoryFilter}
                onSelectFilter={setActiveCategoryFilter}
                counts={tabCounts}
              />

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

                {/* Coluna do Gráfico de Distribuição (5 colunas no desktop) */}
                <div className="lg:col-span-5 flex flex-col">
                  <DistributionChart
                    transactions={activeScopeTransactions}
                    activeFilter={activeCategoryFilter}
                    hideValues={hideValues}
                  />
                </div>
              </div>
            </div>
          ) : (
            <BudgetsView
              transactions={activeScopeTransactions}
              hideValues={hideValues}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={setMobileTab}
        onOpenAdd={handleOpenAdd}
      />

      {/* Modals & Drawers */}
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
            : activeCategoryFilter === 'investment'
            ? 'investment'
            : 'variable_expense'
        }
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* AI Advisor Modal (Desktop or trigger) */}
      <AiAdvisorDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        transactions={activeScopeTransactions}
        hideValues={hideValues}
      />

      {/* Settings & Export Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        transactions={transactions}
        onResetData={handleResetData}
        onClearData={handleClearData}
      />
    </div>
  );
}
