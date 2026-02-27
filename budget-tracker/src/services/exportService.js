// src/services/exportService.js
import { format } from 'date-fns';

export const exportTransactionsToCSV = (transactions, startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error('Start and end dates are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    throw new Error('Start date must be before end date');
  }

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  if (filteredTransactions.length === 0) {
    throw new Error('No transactions found in the selected date range');
  }

  // Sort by date
  filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Create CSV content
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  const csvRows = [headers.join(',')];

  filteredTransactions.forEach(transaction => {
    const row = [
      format(new Date(transaction.date), 'yyyy-MM-dd'),
      transaction.type,
      `"${transaction.category}"`,
      transaction.amount.toFixed(2),
      `"${transaction.description || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  // Add summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  csvRows.push('');
  csvRows.push('SUMMARY');
  csvRows.push(`Total Income,,,${totalIncome.toFixed(2)}`);
  csvRows.push(`Total Expenses,,,${totalExpenses.toFixed(2)}`);
  csvRows.push(`Net Amount,,,${netAmount.toFixed(2)}`);

  // Create and download file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `financial_data_${startDate}_to_${endDate}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const getExportSummary = (transactions, startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return null;

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const incomeCount = filteredTransactions.filter(t => t.type === 'income').length;
  const expenseCount = filteredTransactions.filter(t => t.type === 'expense').length;

  return {
    total: filteredTransactions.length,
    income: incomeCount,
    expenses: expenseCount
  };
};
