import React from 'react';
import { Home, MessageSquare, Receipt, Plus } from 'lucide-react';

export type CleanNavTab = 'home' | 'chat' | 'reports';

interface MobileBottomNavProps {
  currentTab: CleanNavTab;
  onSelectTab: (tab: CleanNavTab) => void;
  onOpenAdd: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Início */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all ${
            currentTab === 'home'
              ? 'text-indigo-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        {/* Tab 2: Chat IA */}
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all ${
            currentTab === 'chat'
              ? 'text-indigo-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-[10px]">Chat IA</span>
        </button>

        {/* Tab 3: Extrato & Gráficos */}
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all ${
            currentTab === 'reports'
              ? 'text-indigo-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Extrato</span>
        </button>
      </div>
    </nav>
  );
};
