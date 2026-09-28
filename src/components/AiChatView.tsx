import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Check, Undo2, ArrowDownLeft, ArrowUpRight, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { Transaction } from '../types/finance';
import { parseNaturalLanguageTransaction, queryAiAdvisor } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdTransactionId?: string;
  transactionSnapshot?: Transaction;
}

interface AiChatViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  onDeleteTransaction: (id: string) => void;
  hideValues: boolean;
  balance: number;
}

const QUICK_EXAMPLES = [
  'Gastei 50 com mercado',
  'Recebi 50 de um trabalho',
  'Uber 25 no debito',
  'Investi 100 no cdb',
  'Quanto gastei este mês?',
];

export const AiChatView: React.FC<AiChatViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  hideValues,
  balance,
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá! Sou seu assistente de finanças 💬.\n\nVocê pode simplesmente me mandar uma mensagem como:\n• *"gastei 50 com mercado"*\n• *"recebi 50 de um trabalho"*\n• *"uber 25 no debito"*\n\nEu adiciono tudo automaticamente no seu extrato! Como posso te ajudar agora?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const text = (customText || input).trim();
    if (!text || isTyping) return;

    const userMessage: ChatEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsTyping(true);

    // 1. Check if the message is a transaction command
    const parsed = parseNaturalLanguageTransaction(text);

    if (parsed) {
      // It's a transaction! Add it automatically
      const createdTx = onAddTransaction({
        title: parsed.title,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        date: parsed.date,
        paymentMethod: parsed.paymentMethod,
        status: 'paid',
      });

      const newBalance =
        parsed.type === 'revenue'
          ? balance + parsed.amount
          : balance - parsed.amount;

      const isRev = parsed.type === 'revenue';
      const isInv = parsed.type === 'investment';

      const typeLabel = isRev ? 'Receita' : isInv ? 'Investimento' : 'Despesa';
      const icon = isRev ? '🎉' : isInv ? '📈' : '✅';

      const replyText = `${icon} **Lançamento registrado!**\n\n• **${parsed.title}**: ${formatCurrency(parsed.amount, hideValues)} (${typeLabel})\n• **Categoria**: ${parsed.category}\n• **Pagamento**: ${parsed.paymentMethod}\n\n*Saldo atualizado: ${formatCurrency(newBalance, hideValues)}*`;

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdTransactionId: createdTx.id,
            transactionSnapshot: createdTx,
          },
        ]);
        setIsTyping(false);
      }, 350);

      return;
    }

    // 2. Otherwise, treat as a financial query / advice question
    try {
      const answer = await queryAiAdvisor(text, transactions);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: 'Desculpe, não consegui processar agora. Tente digitar algo como "gastei 50 com mercado" ou "quanto gastei este mês?".',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUndo = (msgId: string, txId: string) => {
    onDeleteTransaction(txId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              text: `↩️ *Lançamento desfeito e removido do extrato.*`,
              createdTransactionId: undefined,
            }
          : m
      )
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[680px] bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Header of Chat */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Assistente de Lançamento
            </h3>
            <p className="text-[11px] text-slate-400">
              Digite e lance em segundos
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold block">Saldo Atual</span>
          <span className="text-xs font-extrabold font-mono text-slate-900">
            {formatCurrency(balance, hideValues)}
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/50 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/70'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('• ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 my-0.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Inline Undo Button if a transaction was just created */}
                {msg.createdTransactionId && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleUndo(msg.id, msg.createdTransactionId!)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 font-semibold transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Desfazer lançamento</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 px-1 mt-1 font-medium">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl w-fit shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Processando seu comando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5">
        {QUICK_EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => handleSend(example)}
            disabled={isTyping}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1 rounded-xl whitespace-nowrap transition-colors font-medium shrink-0"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: 'gastei 50 com mercado' ou 'recebi 50 de um trabalho'..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 border border-transparent text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-xs"
            aria-label="Enviar comando"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
