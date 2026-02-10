// src/pages/Reports.js
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const YearSelector = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  select {
    padding: 0.5rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
`;

const SummaryTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const SummaryAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.type === 'income' ? '#4CAF50' : props.type === 'expense' ? '#f44336' : '#2196F3'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Reports = () => {
  const { transactions, loading } = useData();
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const chartData = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0));
    const yearEnd = endOfYear(new Date(selectedYear, 0));
    
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const net = income - expenses;
      
      return {
        month: format(month, 'MMM'),
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        net: Number(net.toFixed(2))
      };
    });
  }, [transactions, selectedYear]);

  const yearSummary = useMemo(() => {
    const totalIncome = chartData.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = chartData.reduce((sum, month) => sum + month.expenses, 0);
    const netAmount = totalIncome - totalExpenses;
    const avgMonthlyIncome = totalIncome / 12;
    const avgMonthlyExpenses = totalExpenses / 12;
    
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      avgMonthlyIncome,
      avgMonthlyExpenses
    };
  }, [chartData]);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (transactions.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Reports</PageTitle>
        <EmptyState>
          <h3>No Data Available</h3>
          <p>Add some transactions to see your financial reports.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Financial Reports</PageTitle>
      
      <YearSelector>
        <label>
          Year: 
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </YearSelector>

      <SummaryGrid>
        <SummaryCard>
          <SummaryTitle>Total Income</SummaryTitle>
          <SummaryAmount type="income">
            R{yearSummary.totalIncome.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Total Expenses</SummaryTitle>
          <SummaryAmount type="expense">
            R{yearSummary.totalExpenses.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Net Amount</SummaryTitle>
          <SummaryAmount type={yearSummary.netAmount >= 0 ? 'income' : 'expense'}>
            R{yearSummary.netAmount.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Avg Monthly Income</SummaryTitle>
          <SummaryAmount type="income">
            R{yearSummary.avgMonthlyIncome.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Avg Monthly Expenses</SummaryTitle>
          <SummaryAmount type="expense">
            R{yearSummary.avgMonthlyExpenses.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
      </SummaryGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Monthly Income vs Expenses</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Income" />
              <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Net Profit/Loss Timeline</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#2196F3" 
                strokeWidth={3}
                name="Net Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </PageContainer>
  );
};

export default Reports;