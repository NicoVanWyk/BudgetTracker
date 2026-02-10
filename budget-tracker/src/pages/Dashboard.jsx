// src/pages/Dashboard.js - Enhanced Version
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const WelcomeText = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.8rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LogoutButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background: #d32f2f;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryAmount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.type === 'income' ? '#4CAF50' : props.type === 'expense' ? '#f44336' : '#2196F3'};
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const TransactionsSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 480px) {
    padding: 1.5rem 1.5rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.4rem;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f0f8ff;
  }
`;

const TransactionsList = styled.div`
  padding: 1rem 2rem 2rem;
  max-height: 600px;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    padding: 1rem 1.5rem 2rem;
  }
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #666;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }
  
  p {
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }
`;

const GetStartedButton = styled.button`
  padding: 1rem 2rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #1976D2;
  }
`;

const QuickAddButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #2196F3;
  color: white;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  transition: all 0.3s;
  
  &:hover {
    background: #1976D2;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    bottom: 90px;
    right: 15px;
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #f44336;
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { transactions, loading, error } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  // Calculate current month summary
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthTransactions = transactions.filter(t =>
    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
  );

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = monthlyIncome - monthlyExpenses;
  const recentTransactions = transactions.slice(0, 10);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner fullHeight text="Loading your dashboard..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <WelcomeText>
          Welcome back, {user?.displayName || 'User'}!
        </WelcomeText>
        <LogoutButton onClick={handleLogout}>
          Logout
        </LogoutButton>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <SummaryGrid>
        <SummaryCard>
          <SummaryTitle>This Month Income</SummaryTitle>
          <SummaryAmount type="income">
            ${monthlyIncome.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>This Month Expenses</SummaryTitle>
          <SummaryAmount type="expense">
            ${monthlyExpenses.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryTitle>Net Amount</SummaryTitle>
          <SummaryAmount type={netAmount >= 0 ? 'income' : 'expense'}>
            ${netAmount.toFixed(2)}
          </SummaryAmount>
        </SummaryCard>
      </SummaryGrid>

      <TransactionsSection>
        <SectionHeader>
          <SectionTitle>Recent Transactions</SectionTitle>
          {transactions.length > 0 && (
            <ViewAllButton onClick={() => navigate('/transactions')}>
              View All ({transactions.length})
            </ViewAllButton>
          )}
        </SectionHeader>
        
        <TransactionsList>
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <EmptyState>
              <h3>No transactions yet</h3>
              <p>Start tracking your finances by adding your first transaction!</p>
              <GetStartedButton onClick={() => navigate('/add-entry')}>
                Add First Transaction
              </GetStartedButton>
            </EmptyState>
          )}
        </TransactionsList>
      </TransactionsSection>

      <QuickAddButton onClick={() => navigate('/add-entry')}>
        +
      </QuickAddButton>
    </PageContainer>
  );
};

export default Dashboard;