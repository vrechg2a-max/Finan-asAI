export type TransactionType = 'revenue' | 'fixed_expense' | 'variable_expense' | 'investment';

export type ExpenseCategory = 
  | 'Aluguel'
  | 'Internet'
  | 'Supermercado'
  | 'Energia & Água'
  | 'Streaming & Assinaturas'
  | 'Transporte'
  | 'Lazer & Restaurantes'
  | 'Saúde'
  | 'Educação'
  | 'Outros';

export type RevenueCategory =
  | 'Salário'
  | 'Freelance & Projetos'
  | 'Dividendos'
  | 'Outras Receitas';

export type InvestmentCategory =
  | 'Renda Fixa'
  | 'Ações & FIIs'
  | 'Reserva de Emergência'
  | 'Cripto';

export type AllCategories = ExpenseCategory | RevenueCategory | InvestmentCategory;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: AllCategories;
  date: string; // ISO format: YYYY-MM-DD
  notes?: string;
}

export type CategoryFilter = 'all' | 'revenue' | 'fixed_expense' | 'variable_expense';

export interface SummaryData {
  revenue: number;
  investment: number;
  expenses: number;
  balance: number;
}
