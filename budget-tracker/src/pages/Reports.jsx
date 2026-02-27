import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, isWithinInterval, startOfWeek, endOfWeek, addDays, subMonths } from 'date-fns';
import { exportTransactionsToCSV, getExportSummary } from '../services/exportService';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
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

const ExportSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const ExportTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
`;

const ExportControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
  }
  
  input {
    padding: 0.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      border-color: #2196F3;
    }
  }
`;

const ExportButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ExportInfo = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1976d2;
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffebee;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #c62828;
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
  const [exportStartDate, setExportStartDate] = React.useState('');
  const [exportEndDate, setExportEndDate] = React.useState('');
  const [exportError, setExportError] = React.useState('');

  const handleExport = () => {
    setExportError('');
    try {
      exportTransactionsToCSV(transactions, exportStartDate, exportEndDate);
    } catch (error) {
      setExportError(error.message);
    }
  };

  const exportDataSummary = useMemo(() => 
    getExportSummary(transactions, exportStartDate, exportEndDate),
    [transactions, exportStartDate, exportEndDate]
  );

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
      
      return {
        month: format(month, 'MMM'),
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        net: Number((income - expenses).toFixed(2))
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
    
    const categoryTotals = yearTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});
    
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
    
    const lastMonth = subMonths(today, 1);
    const currentWeekOfMonth = Math.ceil((today.getDate() + startOfMonth(today).getDay()) / 7);
    
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
      
      const weekData = { period: label };
      
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
      
      const monthData = { month: format(month, 'MMM') };
      
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
    
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      avgMonthlyIncome: totalIncome / 12,
      avgMonthlyExpenses: totalExpenses / 12
    };
  }, [chartData]);

  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

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
      
      <ControlsBar>
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
      </ControlsBar>

      <ExportSection>
        <ExportTitle>Export Financial Data</ExportTitle>
        <ExportControls>
          <DateGroup>
            <label>Start Date</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
            />
          </DateGroup>
          
          <DateGroup>
            <label>End Date</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
            />
          </DateGroup>
          
          <ExportButton 
            onClick={handleExport}
            disabled={!exportStartDate || !exportEndDate}
          >
            Export to CSV
          </ExportButton>
        </ExportControls>
        
        {exportDataSummary && (
          <ExportInfo>
            Selected range contains {exportDataSummary.total} transactions 
            ({exportDataSummary.income} income, {exportDataSummary.expenses} expenses)
          </ExportInfo>
        )}
        
        {exportError && <ErrorMessage>{exportError}</ErrorMessage>}
      </ExportSection>

      <SummaryGrid>
        <SummaryCard>
          <SummaryTitle>Total Income</SummaryTitle>
          <SummaryAmount type="income">R{yearSummary.totalIncome.toFixed(2)}</SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Total Expenses</SummaryTitle>
          <SummaryAmount type="expense">R{yearSummary.totalExpenses.toFixed(2)}</SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Net Amount</SummaryTitle>
          <SummaryAmount type={yearSummary.netAmount >= 0 ? 'income' : 'expense'}>
            R{yearSummary.netAmount.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Avg Monthly Income</SummaryTitle>
          <SummaryAmount type="income">R{yearSummary.avgMonthlyIncome.toFixed(2)}</SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Avg Monthly Expenses</SummaryTitle>
          <SummaryAmount type="expense">R{yearSummary.avgMonthlyExpenses.toFixed(2)}</SummaryAmount>
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
            {categoryData.map((category) => (
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