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
 * Smart Natural Language Parser for Quick Transaction Addition.
 * Extracts title, amount, type, category, and payment method from a natural language phrase.
 * Example: "Almoço 45 reais no debito" -> Title: Almoço, Amount: 45, Type: variable_expense, Category: Lazer & Restaurantes
 */
export const parseNaturalLanguageTransaction = (input: string): {
  title: string;
  amount: number;
  type: TransactionType;
  category: AllCategories;
  paymentMethod?: PaymentMethod;
  date: string;
} | null => {
  const text = input.trim();
  if (!text) return null;

  // Extract amount: e.g. R$ 45,50, 45.50, 45,00, 45 reais, 1.200,00
  const amountMatch = text.match(/(?:R\$\s*|r\$\s*)?(\d{1,3}(?:\.\d{3})*|\d+)(?:[.,](\d{1,2}))?\s*(?:reais|real|conto|pila)?/i);
  let amount = 0;
  if (amountMatch) {
    let cleanNumberStr = amountMatch[1].replace(/\./g, '');
    if (amountMatch[2]) {
      cleanNumberStr += '.' + amountMatch[2];
    }
    amount = parseFloat(cleanNumberStr);
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  const lower = text.toLowerCase();

  // Detect payment method
  let paymentMethod: PaymentMethod = 'Pix';
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartao de credito')) {
    paymentMethod = 'Cartão de Crédito';
  } else if (lower.includes('débito') || lower.includes('debito')) {
    paymentMethod = 'Cartão de Débito';
  } else if (lower.includes('dinheiro') || lower.includes('cash') || lower.includes('em espécie')) {
    paymentMethod = 'Dinheiro';
  } else if (lower.includes('boleto')) {
    paymentMethod = 'Boleto';
  } else if (lower.includes('transferencia') || lower.includes('ted')) {
    paymentMethod = 'Transferência';
  }

  // Detect Type & Category
  let type: TransactionType = 'variable_expense';
  let category: AllCategories = 'Outros';

  if (
    lower.includes('salário') ||
    lower.includes('salario') ||
    lower.includes('recebi') ||
    lower.includes('pagamento') ||
    lower.includes('freela') ||
    lower.includes('freelance') ||
    lower.includes('dividendo') ||
    lower.includes('rendimento') ||
    lower.includes('venda')
  ) {
    type = 'revenue';
    if (lower.includes('salário') || lower.includes('salario')) {
      category = 'Salário';
    } else if (lower.includes('freela') || lower.includes('freelance') || lower.includes('projeto')) {
      category = 'Freelance & Projetos';
    } else if (lower.includes('dividendo') || lower.includes('fii')) {
      category = 'Dividendos';
    } else {
      category = 'Outras Receitas';
    }
  } else if (
    lower.includes('investi') ||
    lower.includes('aporte') ||
    lower.includes('tesouro') ||
    lower.includes('selic') ||
    lower.includes('cdb') ||
    lower.includes('cripto') ||
    lower.includes('bitcoin') ||
    lower.includes('fundo') ||
    lower.includes('reserva')
  ) {
    type = 'investment';
    if (lower.includes('tesouro') || lower.includes('selic') || lower.includes('cdb') || lower.includes('renda fixa')) {
      category = 'Renda Fixa';
    } else if (lower.includes('cripto') || lower.includes('bitcoin') || lower.includes('eth')) {
      category = 'Cripto';
    } else if (lower.includes('reserva')) {
      category = 'Reserva de Emergência';
    } else {
      category = 'Ações & FIIs';
    }
  } else if (
    lower.includes('aluguel') ||
    lower.includes('condomínio') ||
    lower.includes('condominio') ||
    lower.includes('internet') ||
    lower.includes('wifi') ||
    lower.includes('luz') ||
    lower.includes('água') ||
    lower.includes('energia') ||
    lower.includes('netflix') ||
    lower.includes('spotify') ||
    lower.includes('assinatura') ||
    lower.includes('mensalidade') ||
    lower.includes('escola') ||
    lower.includes('faculdade')
  ) {
    type = 'fixed_expense';
    if (lower.includes('aluguel') || lower.includes('condomínio')) category = 'Aluguel';
    else if (lower.includes('internet') || lower.includes('wifi')) category = 'Internet';
    else if (lower.includes('luz') || lower.includes('água') || lower.includes('energia')) category = 'Energia & Água';
    else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('assinatura')) category = 'Streaming & Assinaturas';
    else if (lower.includes('faculdade') || lower.includes('escola') || lower.includes('curso')) category = 'Educação';
  } else {
    // Variable expense categories
    type = 'variable_expense';
    if (lower.includes('mercado') || lower.includes('supermercado') || lower.includes('compras') || lower.includes('padaria') || lower.includes('açougue')) {
      category = 'Supermercado';
    } else if (lower.includes('uber') || lower.includes('gasolina') || lower.includes('combustivel') || lower.includes('estacionamento') || lower.includes('onibus')) {
      category = 'Transporte';
    } else if (lower.includes('almoço') || lower.includes('jantar') || lower.includes('restaurante') || lower.includes('ifood') || lower.includes('lanche') || lower.includes('pizza') || lower.includes('bar') || lower.includes('cerveja')) {
      category = 'Lazer & Restaurantes';
    } else if (lower.includes('farmacia') || lower.includes('farmácia') || lower.includes('remedio') || lower.includes('medico') || lower.includes('dentista')) {
      category = 'Saúde';
    } else {
      category = 'Outros';
    }
  }

  // Extract clean title: remove amount, currency and filler words
  let cleanTitle = text
    .replace(/(?:R\$\s*|r\$\s*)?(\d{1,3}(?:\.\d{3})*|\d+)(?:[.,](\d{1,2}))?\s*(?:reais|real|conto|pila)?/gi, '')
    .replace(/\b(no|na|de|do|da|com|em|para|pro|pra|pix|credito|crédito|debito|débito|cartao|cartão|dinheiro|paguei|gastei|recebi|investi|comprei)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = category;
  } else {
    // Capitalize first letter
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    title: cleanTitle,
    amount,
    type,
    category,
    paymentMethod,
    date: todayStr,
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

  // Find top expense categories
  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] || ['Nenhuma', 0];

  // 50-30-20 Rule Analysis
  // Ideal: 50% Fixed/Needs, 30% Variable/Wants, 20% Investments
  const ruleAnalysis = {
    needs: { current: Math.round(fixedRate), target: 50, status: fixedRate <= 50 ? 'ideal' : 'warning' },
    wants: { current: Math.round(variableRate), target: 30, status: variableRate <= 30 ? 'ideal' : 'warning' },
    investments: { current: Math.round(investmentRate), target: 20, status: investmentRate >= 20 ? 'ideal' : 'alert' },
  };

  const tips: string[] = [];

  if (fixedRate > 55) {
    tips.push(`Seus custos fixos estão consumindo ${Math.round(fixedRate)}% da sua renda (o ideal é até 50%). Revise assinaturas recorrentes e contratos de internet/energia.`);
  }

  if (variableRate > 35) {
    tips.push(`Seus gastos variáveis (${topCategory[0]} lidera com R$ ${topCategory[1].toFixed(2)}) somam ${Math.round(variableRate)}%. Tente estipular um limite semanal para lazer e delivery.`);
  }

  if (investmentRate < 15) {
    tips.push(`Sua taxa de investimento atual está em ${Math.round(investmentRate)}%. Aumente seus aportes automáticos assim que o salário cair para bater a meta de 20%.`);
  } else {
    tips.push(`Excelente disciplina financeira! Seus aportes representam ${Math.round(investmentRate)}% da receita.`);
  }

  if (balance < 0) {
    tips.push(`Atenção: O saldo projetado está negativo em R$ ${Math.abs(balance).toFixed(2)}. É fundamental cortar despesas não essenciais imediatamente.`);
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

  // If Gemini API Key is available, use real Gemini LLM!
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Você é o "Finanças AI", um consultor financeiro pessoal de elite, empático, direto, inteligente e focado na realidade brasileira (BRL).
Aqui está o resumo financeiro atual do usuário:
- Receita total: R$ ${diagnosis.revenue.toFixed(2)}
- Despesas totais: R$ ${diagnosis.totalExpenses.toFixed(2)} (Fixas: R$ ${diagnosis.fixedExpenses.toFixed(2)}, Variáveis: R$ ${diagnosis.variableExpenses.toFixed(2)})
- Investimentos: R$ ${diagnosis.investments.toFixed(2)}
- Saldo disponível: R$ ${diagnosis.balance.toFixed(2)}
- Taxa de Poupança/Investimento: ${diagnosis.savingsRate}%
- Maior categoria de gasto: ${diagnosis.topCategory.name} (R$ ${diagnosis.topCategory.amount.toFixed(2)})
- Regra 50-30-20: Necessidades ${diagnosis.fixedRate}% (alvo 50%), Desejos ${diagnosis.variableRate}% (alvo 30%), Aportes ${diagnosis.investmentRate}% (alvo 20%)

Pergunta do usuário: "${userQuestion}"

Instruções para sua resposta:
1. Responda em português brasileiro, de forma acolhedora, prática e objetiva (máximo 3 a 4 parágrafos curtos ou bullet points).
2. Utilize os números reais fornecidos acima para fundamentar seus conselhos.
3. Se o usuário perguntar se pode comprar algo, faça a conta com base no saldo e impacto no orçamento.
4. Mantenha um tom profissional de fintech moderna.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local heuristic advisor:', err);
    }
  }

  // Smart local heuristic response engine (zero setup needed)
  const q = userQuestion.toLowerCase();

  if (q.includes('economizar') || q.includes('cortar') || q.includes('gastar menos')) {
    return `Analisando seu padrão de gastos, a categoria com maior impacto é **${diagnosis.topCategory.name}**, somando **R$ ${diagnosis.topCategory.amount.toFixed(2)}**.\n\n` +
      `💡 **Recomendações Prontas:**\n` +
      `• Defina um teto máximo de orçamento para ${diagnosis.topCategory.name} na aba de Metas.\n` +
      `• Suas despesas variáveis estão em **${diagnosis.variableRate}%** da sua renda. Reduzir 15% delas liberaria cerca de **R$ ${(diagnosis.variableExpenses * 0.15).toFixed(2)}** todo mês para novos aportes!`;
  }

  if (q.includes('50/30/20') || q.includes('50-30-20') || q.includes('regra')) {
    return `📊 **Diagnóstico da Regra 50-30-20 no seu perfil:**\n\n` +
      `• **50% Necessidades (Fixas):** Você está usando **${diagnosis.fixedRate}%** ${diagnosis.fixedRate <= 50 ? '✅ (Dentro da meta)' : '⚠️ (Acima da meta recomendada)'}.\n` +
      `• **30% Desejos (Variáveis):** Você está usando **${diagnosis.variableRate}%** ${diagnosis.variableRate <= 30 ? '✅ (Controlado)' : '⚠️ (Ponto de atenção)'}.\n` +
      `• **20% Liberdade Financeira (Aportes):** Você está aportando **${diagnosis.investmentRate}%** ${diagnosis.investmentRate >= 20 ? '🌟 (Excelente performance)' : '🎯 (Meta: elevar para 20%)'}.\n\n` +
      `Sua taxa geral de poupança atual é de **${diagnosis.savingsRate}%**.`;
  }

  if (q.includes('investir') || q.includes('reserva') || q.includes('rendimento')) {
    return `📈 **Estratégia de Investimentos:**\n\n` +
      `Você já aportou **R$ ${diagnosis.investments.toFixed(2)}** este mês (${diagnosis.investmentRate}% da sua renda).\n\n` +
      `1. **Reserva de Emergência:** Garanta de 3 a 6 meses do seu custo fixo (aproximadamente R$ ${(diagnosis.fixedExpenses * 4).toFixed(2)}) em liquidez diária (Tesouro Selic ou CDB 100% CDI).\n` +
      `2. **Longo Prazo:** Com a reserva formada, direcione o excedente de R$ ${Math.max(0, diagnosis.balance).toFixed(2)} para FIIs e Renda Fixa IPCA+.`;
  }

  if (q.includes('comprar') || q.includes('posso') || q.includes('vale a pena')) {
    const safeToSpend = Math.max(0, diagnosis.balance * 0.4);
    return `🛍️ **Análise de Poder de Compra:**\n\n` +
      `Seu saldo disponível atual é de **R$ ${diagnosis.balance.toFixed(2)}**.\n\n` +
      `Recomendação prudente: para não comprometer sua margem de segurança e imprevistos, limite compras discricionárias à vista a no máximo **R$ ${safeToSpend.toFixed(2)}** este mês.\n` +
      `Se for parcelar no cartão de crédito, certifique-se de que a parcela mensal não ultrapasse 5% da sua receita líquida (R$ ${(diagnosis.revenue * 0.05).toFixed(2)}).`;
  }

  // Default general diagnosis
  return `Olá! Sou o seu **Finanças AI** 🤖.\n\n` +
    `Aqui está uma visão rápida do seu momento financeiro:\n` +
    `• **Receita:** R$ ${diagnosis.revenue.toFixed(2)}\n` +
    `• **Gastos Totais:** R$ ${diagnosis.totalExpenses.toFixed(2)}\n` +
    `• **Saldo Livre:** R$ ${diagnosis.balance.toFixed(2)}\n` +
    `• **Taxa de Poupança:** ${diagnosis.savingsRate}%\n\n` +
    `💡 **Dica do Dia:** ${diagnosis.tips[0] || 'Mantenha todos os seus gastos lançados no app para garantir precisão nas projeções!'}\n\n` +
    `*(Dica: você pode adicionar sua chave Gemini em Ajustes para ativar respostas com IA em tempo real!)*`;
};
