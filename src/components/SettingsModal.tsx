import React, { useState } from 'react';
import { X, Key, Download, RotateCcw, Trash2, Check, ShieldCheck, Sparkles, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey } from '../services/aiService';
import { exportTransactionsToCSV } from '../utils/formatters';
import { Transaction } from '../types/finance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onResetData: () => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onResetData,
  onClearData,
}) => {
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Ajustes & Dados
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Preferências, inteligência artificial e backup
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {/* Gemini API Key Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Google Gemini AI (Opcional)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Conecte sua API Key para respostas live do Gemini 2.5
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Cole sua API Key do Google AI Studio..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Obter chave gratuita</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvo!</span>
                    </>
                  ) : (
                    <span>Salvar Chave</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Export section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">
              Exportação & Relatórios
            </h4>
            <button
              onClick={handleExportCSV}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar Planilha CSV (Excel/Sheets)</span>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Danger zone / Data reset */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700">
              Gerenciar Banco Local
            </h4>

            <button
              onClick={() => {
                if (confirm('Restaurar dados padrão de demonstração?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Restaurar Lançamentos de Demonstração</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Atenção: Deseja apagar TODOS os lançamentos? Essa ação não pode ser desfeita.')) {
                  onClearData();
                  onClose();
                }
              }}
              className="w-full p-3 rounded-2xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2.5 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Limpar Todos os Dados</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 flex items-center gap-2 border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Seus dados são salvos 100% no seu próprio navegador de forma segura e privada.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
