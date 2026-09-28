import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, BrainCircuit, TrendingDown, Target, Lightbulb, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Transaction, ChatMessage } from '../types/finance';
import { generateFinancialDiagnosis, queryAiAdvisor, getGeminiApiKey } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  hideValues: boolean;
}

const QUICK_PROMPTS = [
  '💡 Como posso economizar este mês?',
  '📊 Analise meu perfil na regra 50-30-20',
  '📈 Qual estratégia de investimentos seguir?',
  '🛍️ Posso fazer uma compra extra de R$ 500?',
];

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  transactions,
  hideValues,
}) => {
  const diagnosis = generateFinancialDiagnosis(transactions);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá! Sou o seu **Finanças AI** 🤖.\n\nAnalisei suas transações deste mês. Sua receita atual é de **${formatCurrency(diagnosis.revenue, hideValues)}** e você possui uma taxa de poupança/investimentos de **${diagnosis.savingsRate}%**.\n\nComo posso te ajudar a planejar ou economizar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const hasGeminiKey = Boolean(getGeminiApiKey());

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await queryAiAdvisor(text, transactions);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: 'Desculpe, ocorreu uma instabilidade ao processar sua consulta. Tente novamente em instantes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full sm:max-w-md h-[90vh] sm:h-full bg-white rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none shadow-2xl flex flex-col border-l border-slate-100 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Consultor Finanças AI
                </h3>
                {hasGeminiKey ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                    Gemini Live
                  </span>
                ) : (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-bold">
                    IA Heurística
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Diagnóstico & Planejamento Financeiro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Snapshot Bar */}
        <div className="bg-slate-50 border-b border-slate-200/60 p-3">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Regra 50-30-20 Atual</span>
            <span className="font-mono text-slate-700">Taxa Poupança: {diagnosis.savingsRate}%</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block font-semibold">Fixas (50%)</span>
              <strong className={`font-mono text-xs ${diagnosis.ruleAnalysis.needs.status === 'ideal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {diagnosis.ruleAnalysis.needs.current}%
              </strong>
            </div>

            <div className="bg-white p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block font-semibold">Variáveis (30%)</span>
              <strong className={`font-mono text-xs ${diagnosis.ruleAnalysis.wants.status === 'ideal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {diagnosis.ruleAnalysis.wants.current}%
              </strong>
            </div>

            <div className="bg-white p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block font-semibold">Aportes (20%)</span>
              <strong className={`font-mono text-xs ${diagnosis.ruleAnalysis.investments.status === 'ideal' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                {diagnosis.ruleAnalysis.investments.current}%
              </strong>
            </div>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('• ')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 my-1">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{line.substring(2)}</span>
                          </div>
                        );
                      }
                      return <p key={idx} className={idx > 0 ? 'mt-1' : ''}>{line}</p>;
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 px-1 mt-0.5">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50/80 px-3 py-2 rounded-2xl w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Finanças AI está analisando seus dados...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={isTyping}
              className="text-[11px] bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors shadow-2xs shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao seu assistente..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
