import { Transaction } from '../types/finance';

export const formatCurrency = (value: number, hideValues = false): string => {
  if (hideValues) return '••••••';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1).replace('.', ',')}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Hoje';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Ontem';
  }
  
  return formatDate(dateString);
};

export const formatMonthYear = (monthStr: string): string => {
  // Format "YYYY-MM" to "Mês AAAA"
  const [year, month] = monthStr.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${months[mIndex] || month} ${year}`;
};

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = ['ID', 'Data', 'Título', 'Tipo', 'Categoria', 'Valor (R$)', 'Forma de Pagamento', 'Status', 'Observações'];
  
  const typeMap: Record<string, string> = {
    revenue: 'Receita',
    fixed_expense: 'Despesa Fixa',
    variable_expense: 'Despesa Variável',
    investment: 'Investimento',
  };

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    `"${t.title.replace(/"/g, '""')}"`,
    typeMap[t.type] || t.type,
    `"${t.category}"`,
    t.amount.toFixed(2).replace('.', ','),
    t.paymentMethod || 'Não especificado',
    t.status === 'pending' ? 'Pendente' : 'Pago',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinancasAI_Lancamentos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
