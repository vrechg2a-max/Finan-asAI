import { Transaction } from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Receitas
  {
    id: 'tx-1',
    title: 'Salário Mensal',
    amount: 7200.00,
    type: 'revenue',
    category: 'Salário',
    date: '2026-09-05',
    notes: 'Pagamento CLT + benefícios',
  },
  {
    id: 'tx-2',
    title: 'Freelance Design & UI',
    amount: 1800.00,
    type: 'revenue',
    category: 'Freelance & Projetos',
    date: '2026-09-18',
    notes: 'Projeto landing page cliente Tech',
  },
  {
    id: 'tx-3',
    title: 'Dividendos FIIs',
    amount: 250.00,
    type: 'revenue',
    category: 'Dividendos',
    date: '2026-09-15',
    notes: 'Rendimentos mensais de fundos imobiliários',
  },

  // Investimentos
  {
    id: 'tx-4',
    title: 'Aporte Tesouro Selic',
    amount: 1500.00,
    type: 'investment',
    category: 'Renda Fixa',
    date: '2026-09-06',
    notes: 'Reserva e rentabilidade com liquidez diária',
  },
  {
    id: 'tx-5',
    title: 'Aporte em FIIs & ETFs',
    amount: 600.00,
    type: 'investment',
    category: 'Ações & FIIs',
    date: '2026-09-10',
    notes: 'Carteira de renda passiva de longo prazo',
  },

  // Despesas Fixas (como mencionado no exemplo: Aluguel ~68%, Internet ~7%, etc.)
  {
    id: 'tx-6',
    title: 'Aluguel do Apartamento',
    amount: 2450.00,
    type: 'fixed_expense',
    category: 'Aluguel',
    date: '2026-09-05',
    notes: 'Aluguel + condomínio incluso',
  },
  {
    id: 'tx-7',
    title: 'Internet Fibra 600MB',
    amount: 139.90,
    type: 'fixed_expense',
    category: 'Internet',
    date: '2026-09-10',
    notes: 'Plano fibra óptica residencial',
  },
  {
    id: 'tx-8',
    title: 'Energia Elétrica & Água',
    amount: 260.00,
    type: 'fixed_expense',
    category: 'Energia & Água',
    date: '2026-09-12',
    notes: 'Contas básicas da casa',
  },
  {
    id: 'tx-9',
    title: 'Assinaturas Digitais (Netflix, Spotify)',
    amount: 89.90,
    type: 'fixed_expense',
    category: 'Streaming & Assinaturas',
    date: '2026-09-08',
    notes: 'Streaming de filmes e músicas',
  },

  // Despesas Variáveis
  {
    id: 'tx-10',
    title: 'Supermercado Mensal',
    amount: 840.50,
    type: 'variable_expense',
    category: 'Supermercado',
    date: '2026-09-14',
    notes: 'Compras de mantimentos para o mês',
  },
  {
    id: 'tx-11',
    title: 'Jantar Restaurante Fim de Semana',
    amount: 215.00,
    type: 'variable_expense',
    category: 'Lazer & Restaurantes',
    date: '2026-09-20',
    notes: 'Comemoração com amigos',
  },
  {
    id: 'tx-12',
    title: 'Combustível / Uber',
    amount: 190.00,
    type: 'variable_expense',
    category: 'Transporte',
    date: '2026-09-22',
    notes: 'Deslocamentos urbanos',
  },
  {
    id: 'tx-13',
    title: 'Farmácia & Vitaminas',
    amount: 110.00,
    type: 'variable_expense',
    category: 'Saúde',
    date: '2026-09-25',
    notes: 'Suplementos e medicamentos',
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Aluguel': '#3B82F6', // Blue
  'Internet': '#06B6D4', // Cyan
  'Supermercado': '#10B981', // Emerald
  'Energia & Água': '#F59E0B', // Amber
  'Streaming & Assinaturas': '#8B5CF6', // Purple
  'Transporte': '#EC4899', // Pink
  'Lazer & Restaurantes': '#F97316', // Orange
  'Saúde': '#EF4444', // Red
  'Educação': '#6366F1', // Indigo
  'Outros': '#64748B', // Slate

  // Receitas
  'Salário': '#10B981',
  'Freelance & Projetos': '#14B8A6',
  'Dividendos': '#059669',
  'Outras Receitas': '#34D399',

  // Investimentos
  'Renda Fixa': '#6366F1',
  'Ações & FIIs': '#8B5CF6',
  'Reserva de Emergência': '#3B82F6',
  'Cripto': '#F59E0B',
};
