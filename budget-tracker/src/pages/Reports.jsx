// src/pages/Reports.js
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, isWithinInterval, startOfWeek, endOfWeek, addDays, subMonths } from 'date-fns';

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
  
  label {
    margin-right: 0.5rem;
    font-weight: 600;
    color: #333;
  }
  
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

const WideChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  grid-column: 1 / -1;
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

const CategoryTable = styled.div`
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const CategoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryName = styled.span`
  font-weight: 500;
`;

const CategoryAmount = styled.span`
  color: #666;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

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

  const categoryData = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0));
    const yearEnd = endOfYear(new Date(selectedYear, 0));
    
    const yearTransactions = transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start: yearStart, end: yearEnd }) &&
      t.type === 'expense'
    );
    
    // Group by category
    const categoryTotals = yearTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});
    
    // Convert to array and sort by amount
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedYear]);

  const weeklyComparisons = useMemo(() => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    const previousWeekStart = startOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
    const previousWeekEnd = endOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
    
    // Calculate same week in previous month
    const lastMonth = subMonths(today, 1);
    const currentWeekOfMonth = Math.ceil((today.getDate() + startOfMonth(today).getDay()) / 7);
    
    // Find the same week number in previous month
    const prevMonthStart = startOfMonth(lastMonth);
    const prevMonthSameWeekStart = addDays(prevMonthStart, (currentWeekOfMonth - 1) * 7 - prevMonthStart.getDay() + 1);
    const prevMonthSameWeekEnd = endOfWeek(prevMonthSameWeekStart, { weekStartsOn: 1 });
    
    const categories = [...new Set(transactions
      .filter(t => t.type === 'expense')
      .map(t => t.category)
    )];
    
    const calculateWeekData = (weekStart, weekEnd, label) => {
      const weekExpenses = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd }) &&
        t.type === 'expense'
      );
      
      const weekData = {
        period: label,
        total: weekExpenses.reduce((sum, t) => sum + t.amount, 0)
      };
      
      categories.forEach(category => {
        const categoryTotal = weekExpenses
          .filter(t => t.category === category)
          .reduce((sum, t) => sum + t.amount, 0);
        weekData[category] = Number(categoryTotal.toFixed(2));
      });
      
      return weekData;
    };
    
    return {
      thisWeekVsLast: [
        calculateWeekData(previousWeekStart, previousWeekEnd, 'Last Week'),
        calculateWeekData(currentWeekStart, currentWeekEnd, 'This Week')
      ],
      thisWeekVsSameLastMonth: [
        calculateWeekData(prevMonthSameWeekStart, prevMonthSameWeekEnd, 'Same Week Last Month'),
        calculateWeekData(currentWeekStart, currentWeekEnd, 'This Week')
      ]
    };
  }, [transactions]);

  const monthlyCategoryData = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0));
    const yearEnd = endOfYear(new Date(selectedYear, 0));
    
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    const categories = [...new Set(transactions
      .filter(t => t.type === 'expense')
      .map(t => t.category)
    )];
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthExpenses = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }) &&
        t.type === 'expense'
      );
      
      const monthData = {
        month: format(month, 'MMM'),
      };
      
      categories.forEach(category => {
        const categoryTotal = monthExpenses
          .filter(t => t.category === category)
          .reduce((sum, t) => sum + t.amount, 0);
        monthData[category] = Number(categoryTotal.toFixed(2));
      });
      
      return monthData;
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

  // Get top 5 categories for the stacked bar chart
  const topCategories = categoryData.slice(0, 5).map(cat => cat.name);

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
        <label>Year:</label>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
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

        <ChartCard>
          <ChartTitle>Spending by Category ({selectedYear})</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <CategoryTable>
            {categoryData.map((category, index) => (
              <CategoryRow key={category.name}>
                <CategoryName>{category.name}</CategoryName>
                <CategoryAmount>R{category.value.toFixed(2)}</CategoryAmount>
              </CategoryRow>
            ))}
          </CategoryTable>
        </ChartCard>

        <ChartCard>
          <ChartTitle>This Week vs Last Week</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyComparisons.thisWeekVsLast} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
              <Legend />
              {topCategories.map((category, index) => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  fill={COLORS[index % COLORS.length]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>This Week vs Same Week Last Month</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyComparisons.thisWeekVsSameLastMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
              <Legend />
              {topCategories.map((category, index) => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  fill={COLORS[index % COLORS.length]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <WideChartCard>
          <ChartTitle>Monthly Spending by Category (Top 5)</ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R${value.toFixed(2)}`} />
              <Legend />
              {topCategories.map((category, index) => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </WideChartCard>
      </ChartsGrid>
    </PageContainer>
  );
};

export default Reports;