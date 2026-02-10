// src/pages/AllTransactions.js
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import styled from 'styled-components';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #333;
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const ClearButton = styled.button`
  padding: 10px 16px;
  background: #f5f5f5;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #eeeeee;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
`;

const TransactionsList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TransactionsContainer = styled.div`
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }
`;

const AllTransactions = () => {
  const { transactions, categories, loading } = useData();
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    return filtered;
  }, [transactions, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort();

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner fullHeight text="Loading transactions..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>All Transactions</PageTitle>
      </PageHeader>

      <FiltersContainer>
        <FilterRow>
          <FilterGroup>
            <label>Type</label>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <label>Category</label>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <label>Search</label>
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search description or category..."
            />
          </FilterGroup>
        </FilterRow>

        <FilterRow>
          <FilterGroup>
            <label>From Date</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <label>To Date</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <label>&nbsp;</label>
            <ClearButton onClick={clearFilters}>
              Clear All Filters
            </ClearButton>
          </FilterGroup>
        </FilterRow>
      </FiltersContainer>

      <ResultsInfo>
        <span>
          Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
        </span>
        <div>
          <label style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Sort by:</label>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="amount-desc">Amount (Highest First)</option>
            <option value="amount-asc">Amount (Lowest First)</option>
            <option value="category">Category (A-Z)</option>
          </SortSelect>
        </div>
      </ResultsInfo>

      <TransactionsList>
        <TransactionsContainer>
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <EmptyState>
              <h3>No transactions found</h3>
              <p>Try adjusting your filters or add some transactions to get started.</p>
            </EmptyState>
          )}
        </TransactionsContainer>
      </TransactionsList>
    </PageContainer>
  );
};

export default AllTransactions;