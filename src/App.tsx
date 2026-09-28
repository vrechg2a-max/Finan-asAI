import { useState, useEffect, useMemo } from 'react';
import { Transaction, SummaryData } from './types/finance';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { QuickCommandBar } from './components/QuickCommandBar';
import { TransactionsList } from './components/TransactionsList';
import { DistributionChart } from './components/DistributionChart';
import { TransactionModal } from './components/TransactionModal';
import { AiChatView } from './components/AiChatView';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav, CleanNavTab } from './components/MobileBottomNav';
import { Home, MessageSquare, Receipt, Plus } from 'lucide-react';

const STORAGE_KEY = 'finanzy_transactions_v2';
const PRIVACY_KEY = 'finanzy_hide_values';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  const [hideValues, setHideValues] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRIVACY_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activeTab, setActiveTab] = useState<CleanNavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_KEY, String(hideValues));
    } catch (e) {
      console.error(e);
    }
  }, [hideValues]);

  // Month navigation
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

  // Transactions filtered by selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const activeScopeTransactions = monthTransactions.length > 0 ? monthTransactions : transactions;

  // Financial summary
  const summary: SummaryData = useMemo(() => {
    let revenue = 0;
    let investment = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    activeScopeTransactions.forEach((tx) => {
      if (tx.type === 'revenue') revenue += tx.amount;
      else if (tx.type === 'investment') investment += tx.amount;
      else if (tx.type === 'fixed_expense') fixedExpenses += tx.amount;
      else if (tx.type === 'variable_expense') variableExpenses += tx.amount;
    });

    const expenses = fixedExpenses + variableExpenses;
    const balance = revenue - expenses - investment;

    return { revenue, investment, expenses, balance };
  }, [activeScopeTransactions]);

  // Handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const handleSaveModalTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (txData.id) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t))
      );
    } else {
      handleAddTransaction(txData);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSelectedMonth('2026-09');
  };

  const handleClearData = () => {
    setTransactions([]);
  };

  // Filtered transactions for reports
  const filteredReportTransactions = useMemo(() => {
    if (!searchQuery.trim()) return activeScopeTransactions;
    const q = searchQuery.toLowerCase();
    return activeScopeTransactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
    );
  }, [activeScopeTransactions, searchQuery]);

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
      />

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 space-y-4 sm:space-y-6">
        {/* Desktop View Navigation Pill */}
        <div className="hidden sm:flex items-center justify-center">
          <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Chat IA (Lançar por Conversa)</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Extrato & Gráficos</span>
            </button>
          </div>
        </div>

        {/* 1. Tab: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            {/* Minimalist Hero Balance Card */}
            <SummaryCards
              summary={summary}
              hideValues={hideValues}
              onToggleHideValues={() => setHideValues((v) => !v)}
            />

            {/* Smart Conversational Quick Command Bar */}
            <QuickCommandBar
              onAddTransaction={handleAddTransaction}
              hideValues={hideValues}
            />

            {/* Recent Transactions Feed */}
            <TransactionsList
              transactions={activeScopeTransactions.slice(0, 7)}
              onAddClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              onEditClick={handleOpenEdit}
              onDeleteClick={handleDeleteTransaction}
              hideValues={hideValues}
              compact={true}
            />

            {activeScopeTransactions.length > 7 && (
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 transition-colors shadow-2xs text-center"
              >
                Ver todos os {activeScopeTransactions.length} lançamentos do mês →
              </button>
            )}
          </div>
        )}

        {/* 2. Tab: CHAT IA (Conversational Adding & Financial Advisor) */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-200">
            <AiChatView
              transactions={activeScopeTransactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              hideValues={hideValues}
              balance={summary.balance}
            />
          </div>
        )}

        {/* 3. Tab: REPORTS & FULL STATEMENT */}
        {activeTab === 'reports' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Clean Distribution Donut Chart */}
            <DistributionChart
              transactions={activeScopeTransactions}
              activeFilter="all"
              hideValues={hideValues}
            />

            {/* Full Transactions List */}
            <TransactionsList
              transactions={filteredReportTransactions}
              onAddClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              onEditClick={handleOpenEdit}
              onDeleteClick={handleDeleteTransaction}
              hideValues={hideValues}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              compact={false}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdd={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
      />

      {/* Manual Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModalTransaction}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
      />

      {/* Settings Modal */}
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
