import React from 'react';
import { LayoutDashboard, Receipt, Sparkles, Target, Plus } from 'lucide-react';

export type MobileTab = 'dashboard' | 'transactions' | 'ai' | 'budgets';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenAdd: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAdd,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        {/* Tab 2: Lançamentos */}
        <button
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'transactions'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Extrato</span>
        </button>

        {/* Center Prominent Add Button */}
        <div className="relative -top-4">
          <button
            onClick={onOpenAdd}
            className="w-13 h-13 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/30 flex items-center justify-center active:scale-90 transition-all border-4 border-[#F8FAFC]"
            aria-label="Adicionar lançamento"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Consultor AI */}
        <button
          onClick={() => onSelectTab('ai')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'ai'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">IA</span>
        </button>

        {/* Tab 4: Metas */}
        <button
          onClick={() => onSelectTab('budgets')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'budgets'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Metas</span>
        </button>
      </div>
    </nav>
  );
};
