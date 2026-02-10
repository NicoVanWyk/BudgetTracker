// src/components/TransactionForm.js - Enhanced with validation
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import LoadingSpinner from './LoadingSpinner';
import SearchableSelect from './SearchableSelect';
import styled from 'styled-components';
import { format } from 'date-fns';

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const TypeToggle = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
`;

const TypeButton = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? (props.type === 'income' ? '#4CAF50' : '#f44336') : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  
  &:hover {
    background: ${props => props.active ? 
      (props.type === 'income' ? '#4CAF50' : '#f44336') : 
      (props.type === 'income' ? '#e8f5e8' : '#ffebee')
    };
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border: 2px solid ${props => props.error ? '#f44336' : '#e0e0e0'};
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  background: ${props => props.error ? '#fffbfb' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#2196F3'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)'};
  }
  
  &::placeholder {
    color: #bbb;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 18px;
  border: 2px solid ${props => props.error ? '#f44336' : '#e0e0e0'};
  border-radius: 10px;
  font-size: 1rem;
  background: ${props => props.error ? '#fffbfb' : 'white'};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#2196F3'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)'};
  }
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: end;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AddCategoryButton = styled.button`
  padding: 14px 20px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    border-color: #ced4da;
  }
  
  @media (max-width: 480px) {
    margin-top: 0.5rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: ${props => props.$transactionType === 'income' ? '#4CAF50' : '#f44336'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.$transactionType === 'income' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorText = styled.div`
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #ffebee;
  border-radius: 8px;
  border-left: 4px solid #f44336;
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
`;

const TransactionForm = ({ onSuccess }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { categories, createTransaction, createCategory, error, clearError } = useData();

  const filteredCategories = categories.filter(cat => 
    cat.type === type || cat.type === 'both'
  );

  const validateForm = () => {
    const errors = {};

    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!showNewCategory && !category) {
      errors.category = 'Please select a category';
    }

    if (showNewCategory && !newCategory.trim()) {
      errors.newCategory = 'Please enter a category name';
    }

    if (!date) {
      errors.date = 'Please select a date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    let selectedCategory = category;

    // Create new category if needed
    if (showNewCategory && newCategory) {
      const categoryResult = await createCategory({
        name: newCategory.trim(),
        type: type,
        color: type === 'income' ? '#4CAF50' : '#f44336'
      });
      
      if (categoryResult.success) {
        selectedCategory = newCategory.trim();
      } else {
        setLoading(false);
        return;
      }
    }

    // Create transaction
    const transactionResult = await createTransaction({
      type,
      amount: parseFloat(amount),
      category: selectedCategory,
      date,
      description: description.trim() || null
    });

    if (transactionResult.success) {
      // Reset form
      setAmount('');
      setCategory('');
      setNewCategory('');
      setShowNewCategory(false);
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setValidationErrors({});
      
      setSuccessMessage(`${type === 'income' ? 'Income' : 'Expense'} of R${parseFloat(amount).toFixed(2)} added successfully!`);
      
      if (onSuccess) onSuccess();
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <FormContainer>
        <LoadingSpinner text="Adding transaction..." />
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <TypeToggle>
        <TypeButton 
          type="income"
          active={type === 'income'} 
          onClick={() => setType('income')}
        >
          💰 Income (DT)
        </TypeButton>
        <TypeButton 
          type="expense"
          active={type === 'expense'} 
          onClick={() => setType('expense')}
        >
          💸 Expense (CT)
        </TypeButton>
      </TypeToggle>

      {error && <e>{error}</e>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Amount *</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            error={validationErrors.amount}
          />
          {validationErrors.amount && <ErrorText>{validationErrors.amount}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <label>Category *</label>
          {showNewCategory ? (
            <CategoryRow>
              <div style={{ flex: 1 }}>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  error={validationErrors.newCategory}
                />
                {validationErrors.newCategory && <ErrorText>{validationErrors.newCategory}</ErrorText>}
              </div>
              <AddCategoryButton 
                type="button"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategory('');
                  setValidationErrors({...validationErrors, newCategory: undefined});
                }}
              >
                Cancel
              </AddCategoryButton>
            </CategoryRow>
          ) : (
            <CategoryRow>
              <div style={{ flex: 1 }}>
                <SearchableSelect
                  value={category}
                  onChange={(value) => setCategory(value)}
                  options={filteredCategories.map(cat => cat.name)}
                  placeholder="Select or search category"
                  error={validationErrors.category}
                  required
                />
                {validationErrors.category && <ErrorText>{validationErrors.category}</ErrorText>}
              </div>
              <AddCategoryButton 
                type="button"
                onClick={() => setShowNewCategory(true)}
              >
                + New Category
              </AddCategoryButton>
            </CategoryRow>
          )}
        </FormGroup>

        <FormGroup>
          <label>Date *</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={validationErrors.date}
          />
          {validationErrors.date && <ErrorText>{validationErrors.date}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <label>Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note (optional)"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading} $transactionType={type}>
          {loading ? 'Adding...' : `💾 Add ${type === 'income' ? 'Income' : 'Expense'}`}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default TransactionForm;