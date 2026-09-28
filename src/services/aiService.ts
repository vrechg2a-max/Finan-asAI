import { GoogleGenAI } from '@google/genai';
import { Transaction, TransactionType, AllCategories, PaymentMethod } from '../types/finance';

const API_KEY_STORAGE = 'financas_ai_gemini_key';

export const getGeminiApiKey = (): string => {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const setGeminiApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Failed to store Gemini API key', e);
  }
};

/**
 * Natural Language Transaction Result
 */
export interface ParsedTransactionResult {
  title: string;
  amount: number;
  type: TransactionType;
  category: AllCategories;
  paymentMethod: PaymentMethod;
  date: string;
  confidence: number;
}

/**
 * Smart Natural Language Parser for Quick Conversational Addition.
 * Supports natural Portuguese phrases like:
 * - "gastei 50 com mercado"
 * - "gastei 50 no mercado"
 * - "recebi 50 de um trabalho"
 * - "recebi 1500 de freela"
 * - "uber 25 no debito"
 * - "paguei aluguel 1200"
 * - "investi 200 no cdb"
 * - "comprei cafe 15"
 * - "salario 7200"
 */
export const parseNaturalLanguageTransaction = (input: string): ParsedTransactionResult | null => {
  const text = input.trim();
  if (!text) return null;

  // Extract amount: e.g. R$ 50,00 / 50.00 / 50 reais / 50
  // Look for numbers optionally preceded by R$ or followed by reais/real
  const amountRegex = /(?:R\$\s*|r\$\s*)?(\d{1,3}(?:\.\d{3})*|\d+)(?:[.,](\d{1,2}))?\s*(?:reais|real|conto|pila)?/i;
  const match = text.match(amountRegex);

  if (!match) return null;

  let intPart = match[1].replace(/\./g, '');
  let decimalPart = match[2] || '';
  let amountStr = decimalPart ? `${intPart}.${decimalPart}` : intPart;
  let amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) return null;

  const lower = text.toLowerCase();

  // Detect Payment Method
  let paymentMethod: PaymentMethod = 'Pix';
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartao de credito')) {
    paymentMethod = 'Cartão de Crédito';
  } else if (lower.includes('débito') || lower.includes('debito')) {
    paymentMethod = 'Cartão de Débito';
  } else if (lower.includes('dinheiro') || lower.includes('cash') || lower.includes('em espécie')) {
    paymentMethod = 'Dinheiro';
  } else if (lower.includes('boleto')) {
    paymentMethod = 'Boleto';
  } else if (lower.includes('ted') || lower.includes('transferencia') || lower.includes('transferência')) {
    paymentMethod = 'Transferência';
  }

  // Detect Type & Category
  let type: TransactionType = 'variable_expense';
  let category: AllCategories = 'Outros';
  let titleCandidate = '';

  const isRevenue =
    lower.includes('recebi') ||
    lower.includes('ganhei') ||
    lower.includes('salario') ||
    lower.includes('salário') ||
    lower.includes('freela') ||
    lower.includes('freelance') ||
    lower.includes('trabalho') ||
    lower.includes('serviço') ||
    lower.includes('servico') ||
    lower.includes('bico') ||
    lower.includes('venda') ||
    lower.includes('entrou') ||
    lower.includes('dividendo');

  const isInvestment =
    lower.includes('investi') ||
    lower.includes('guardei') ||
    lower.includes('aporte') ||
    lower.includes('cdb') ||
    lower.includes('selic') ||
    lower.includes('tesouro') ||
    lower.includes('reserva') ||
    lower.includes('cripto') ||
    lower.includes('bitcoin') ||
    lower.includes('fii') ||
    lower.includes('ações') ||
    lower.includes('acoes');

  const isFixed =
    lower.includes('aluguel') ||
    lower.includes('condominio') ||
    lower.includes('condomínio') ||
    lower.includes('internet') ||
    lower.includes('wifi') ||
    lower.includes('luz') ||
    lower.includes('água') ||
    lower.includes('agua') ||
    lower.includes('energia') ||
    lower.includes('netflix') ||
    lower.includes('spotify') ||
    lower.includes('mensalidade') ||
    lower.includes('escola') ||
    lower.includes('faculdade');

  if (isRevenue) {
    type = 'revenue';
    if (lower.includes('salario') || lower.includes('salário')) {
      category = 'Salário';
      titleCandidate = 'Salário';
    } else if (lower.includes('dividendo')) {
      category = 'Dividendos';
      titleCandidate = 'Dividendos';
    } else if (lower.includes('freela') || lower.includes('trabalho') || lower.includes('servico') || lower.includes('bico')) {
      category = 'Freelance & Projetos';
      titleCandidate = lower.includes('freela') ? 'Freelance' : 'Trabalho Extra';
    } else {
      category = 'Outras Receitas';
      titleCandidate = 'Receita Extra';
    }
  } else if (isInvestment) {
    type = 'investment';
    if (lower.includes('reserva')) {
      category = 'Reserva de Emergência';
      titleCandidate = 'Reserva de Emergência';
    } else if (lower.includes('cripto') || lower.includes('bitcoin')) {
      category = 'Cripto';
      titleCandidate = 'Criptoativos';
    } else if (lower.includes('fii') || lower.includes('acoes') || lower.includes('ações')) {
      category = 'Ações & FIIs';
      titleCandidate = 'Ações & FIIs';
    } else {
      category = 'Renda Fixa';
      titleCandidate = 'Aporte Renda Fixa';
    }
  } else if (isFixed) {
    type = 'fixed_expense';
    if (lower.includes('aluguel') || lower.includes('condominio') || lower.includes('condomínio')) {
      category = 'Aluguel';
      titleCandidate = 'Aluguel';
    } else if (lower.includes('internet') || lower.includes('wifi')) {
      category = 'Internet';
      titleCandidate = 'Internet';
    } else if (lower.includes('luz') || lower.includes('energia') || lower.includes('agua') || lower.includes('água')) {
      category = 'Energia & Água';
      titleCandidate = lower.includes('luz') || lower.includes('energia') ? 'Energia Elétrica' : 'Água';
    } else if (lower.includes('netflix') || lower.includes('spotify')) {
      category = 'Streaming & Assinaturas';
      titleCandidate = lower.includes('netflix') ? 'Netflix' : 'Spotify';
    } else if (lower.includes('escola') || lower.includes('faculdade')) {
      category = 'Educação';
      titleCandidate = 'Mensalidade Escolar';
    }
  } else {
    // Variable expense
    type = 'variable_expense';
    if (lower.includes('mercado') || lower.includes('supermercado') || lower.includes('compras') || lower.includes('feira') || lower.includes('padaria') || lower.includes('açougue')) {
      category = 'Supermercado';
      titleCandidate = 'Supermercado';
    } else if (lower.includes('uber') || lower.includes('gasolina') || lower.includes('combustivel') || lower.includes('onibus') || lower.includes('estacionamento')) {
      category = 'Transporte';
      titleCandidate = lower.includes('uber') ? 'Uber' : lower.includes('gasolina') ? 'Gasolina' : 'Transporte';
    } else if (lower.includes('restaurante') || lower.includes('almoco') || lower.includes('almoço') || lower.includes('jantar') || lower.includes('pizza') || lower.includes('lanche') || lower.includes('ifood') || lower.includes('cafe') || lower.includes('café') || lower.includes('bar')) {
      category = 'Lazer & Restaurantes';
      titleCandidate = lower.includes('pizza') ? 'Pizza' : lower.includes('ifood') ? 'iFood' : lower.includes('almoço') || lower.includes('almoco') ? 'Almoço' : 'Restaurante';
    } else if (lower.includes('farmacia') || lower.includes('farmácia') || lower.includes('remedio') || lower.includes('remédio') || lower.includes('medico') || lower.includes('dentista')) {
      category = 'Saúde';
      titleCandidate = lower.includes('farmacia') || lower.includes('farmácia') ? 'Farmácia' : 'Saúde';
    } else {
      category = 'Outros';
      titleCandidate = 'Despesa';
    }
  }

  // Extract clean custom title from sentence if user gave a descriptive name
  // Remove match, currency words, and common prepositions
  let stripped = text
    .replace(/(?:R\$\s*|r\$\s*)?(\d{1,3}(?:\.\d{3})*|\d+)(?:[.,](\d{1,2}))?\s*(?:reais|real|conto|pila)?/gi, '')
    .replace(/\b(gastei|comprei|paguei|recebi|ganhei|investi|guardei|coloquei|com|no|na|de|do|da|um|uma|uns|umas|meu|minha|pro|pra|para|em|via|pelo|pela|pix|credito|crédito|debito|débito|cartao|cartão|dinheiro)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let finalTitle = titleCandidate;
  if (stripped && stripped.length >= 3) {
    finalTitle = stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    title: finalTitle,
    amount,
    type,
    category,
    paymentMethod,
    date: todayStr,
    confidence: 0.95,
  };
};

/**
 * Generate Comprehensive Financial Insights & Diagnosis
 */
export const generateFinancialDiagnosis = (transactions: Transaction[]) => {
  let revenue = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;
  let investments = 0;

  const categoryExpenses: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'revenue') {
      revenue += tx.amount;
    } else if (tx.type === 'fixed_expense') {
      fixedExpenses += tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    } else if (tx.type === 'variable_expense') {
      variableExpenses += tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    } else if (tx.type === 'investment') {
      investments += tx.amount;
    }
  });

  const totalExpenses = fixedExpenses + variableExpenses;
  const balance = revenue - totalExpenses - investments;
  const savingsRate = revenue > 0 ? ((investments + Math.max(0, balance)) / revenue) * 100 : 0;
  const fixedRate = revenue > 0 ? (fixedExpenses / revenue) * 100 : 0;
  const variableRate = revenue > 0 ? (variableExpenses / revenue) * 100 : 0;
  const investmentRate = revenue > 0 ? (investments / revenue) * 100 : 0;

  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] || ['Nenhuma', 0];

  const ruleAnalysis = {
    needs: { current: Math.round(fixedRate), target: 50, status: fixedRate <= 50 ? 'ideal' : 'warning' },
    wants: { current: Math.round(variableRate), target: 30, status: variableRate <= 30 ? 'ideal' : 'warning' },
    investments: { current: Math.round(investmentRate), target: 20, status: investmentRate >= 20 ? 'ideal' : 'alert' },
  };

  const tips: string[] = [];

  if (fixedRate > 55) {
    tips.push(`Custos fixos em ${Math.round(fixedRate)}% (o ideal é até 50%). Tente renegociar contratos de internet e assinaturas.`);
  }

  if (variableRate > 35) {
    tips.push(`Gastos variáveis em ${Math.round(variableRate)}%. ${topCategory[0]} foi a maior despesa (R$ ${topCategory[1].toFixed(2)}).`);
  }

  if (investmentRate < 15) {
    tips.push(`Sua taxa de investimento está em ${Math.round(investmentRate)}%. Aumente aportes automáticos para atingir 20%.`);
  } else {
    tips.push(`Excelente disciplina! Aportes somam ${Math.round(investmentRate)}% da sua renda.`);
  }

  return {
    revenue,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    investments,
    balance,
    savingsRate: Math.round(savingsRate),
    fixedRate: Math.round(fixedRate),
    variableRate: Math.round(variableRate),
    investmentRate: Math.round(investmentRate),
    topCategory: { name: topCategory[0], amount: topCategory[1] },
    ruleAnalysis,
    tips,
  };
};

/**
 * Ask AI Advisor a question (supports Gemini API or smart local intelligence)
 */
export const queryAiAdvisor = async (
  userQuestion: string,
  transactions: Transaction[]
): Promise<string> => {
  const diagnosis = generateFinancialDiagnosis(transactions);
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Você é o "Finanças AI", consultor financeiro pessoal minimalista, amigável e direto.
Dados atuais do usuário:
- Receita: R$ ${diagnosis.revenue.toFixed(2)}
- Despesas: R$ ${diagnosis.totalExpenses.toFixed(2)} (Fixas: R$ ${diagnosis.fixedExpenses.toFixed(2)}, Variáveis: R$ ${diagnosis.variableExpenses.toFixed(2)})
- Investimentos: R$ ${diagnosis.investments.toFixed(2)}
- Saldo: R$ ${diagnosis.balance.toFixed(2)}
- Maior gasto: ${diagnosis.topCategory.name} (R$ ${diagnosis.topCategory.amount.toFixed(2)})

Pergunta do usuário: "${userQuestion}"

Instruções:
- Seja conciso e direto ao ponto (máximo 2 a 3 parágrafos curtos).
- Use linguagem simples e acolhedora em português brasileiro.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API call error, using local fallback:', err);
    }
  }

  // Smart local heuristic response
  const q = userQuestion.toLowerCase();

  if (q.includes('economizar') || q.includes('cortar') || q.includes('gastar menos')) {
    return `💡 **Dica rápida:** A sua maior despesa variável este mês foi **${diagnosis.topCategory.name}** (R$ ${diagnosis.topCategory.amount.toFixed(2)}).\n\nReduzir 15% nos gastos variáveis liberaria cerca de **R$ ${(diagnosis.variableExpenses * 0.15).toFixed(2)}** todos os meses para novos investimentos!`;
  }

  if (q.includes('quanto gastei') || q.includes('total gasto') || q.includes('gastos')) {
    return `📊 **Resumo de Gastos:**\nVocê já gastou um total de **R$ ${diagnosis.totalExpenses.toFixed(2)}** este mês.\n• Fixas: R$ ${diagnosis.fixedExpenses.toFixed(2)}\n• Variáveis: R$ ${diagnosis.variableExpenses.toFixed(2)}\n\nSeu saldo atual livre é de **R$ ${diagnosis.balance.toFixed(2)}**.`;
  }

  if (q.includes('investir') || q.includes('reserva')) {
    return `📈 **Investimentos:**\nVocê já aportou **R$ ${diagnosis.investments.toFixed(2)}** (${diagnosis.investmentRate}% da renda).\nRecomendo manter de 3 a 6 meses de custos fixos (cerca de R$ ${(diagnosis.fixedExpenses * 4).toFixed(2)}) no Tesouro Selic ou CDB de liquidez diária.`;
  }

  return `Seu saldo atual é de **R$ ${diagnosis.balance.toFixed(2)}** com receitas de **R$ ${diagnosis.revenue.toFixed(2)}** e despesas de **R$ ${diagnosis.totalExpenses.toFixed(2)}**.\n\nVocê pode simplesmente digitar *"gastei 50 com mercado"* ou *"recebi 100 de freela"* aqui no chat que eu lanço na hora para você!`;
};
