// src/pages/Categories.js
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const AddCategoryForm = styled.form`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1976D2;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CategoriesList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const CategoryColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const CategoryDetails = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #333;
`;

const CategoryType = styled.div`
  font-size: 0.85rem;
  color: #666;
  text-transform: capitalize;
`;

const EditInput = styled.input`
  font-weight: 600;
  color: #333;
  border: none;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  
  &:focus {
    outline: 2px solid #2196F3;
  }
`;

const EditSelect = styled.select`
  font-size: 0.85rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.$danger ? '#ffebee' : props.$primary ? '#e3f2fd' : '#f0f0f0'};
  }
`;

const Error = styled.div`
  color: #f44336;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #666;
`;

const Categories = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', type: '' });

  const { categories, createCategory, removeCategory, editCategory, error, clearError } = useData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    clearError();
    setLoading(true);

    const colorMap = {
      income: '#4CAF50',
      expense: '#f44336',
      both: '#FF9800'
    };

    const result = await createCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: colorMap[newCategoryType]
    });

    if (result.success) {
      setNewCategoryName('');
      setNewCategoryType('expense');
    }

    setLoading(false);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditData({ name: category.name, type: category.type });
  };

  const handleSaveEdit = async (categoryId) => {
    const result = await editCategory(categoryId, {
      name: editData.name.trim(),
      type: editData.type
    });
    
    if (result.success) {
      setEditingId(null);
      setEditData({ name: '', type: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', type: '' });
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await removeCategory(categoryId);
    }
  };

  // Group categories by type
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const bothCategories = categories.filter(cat => cat.type === 'both');

  const renderCategory = (category) => (
    <CategoryItem key={category.id}>
      <CategoryInfo>
        <CategoryColor color={category.color} />
        <CategoryDetails>
          {editingId === category.id ? (
            <>
              <EditInput
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(category.id)}
              />
              <EditSelect
                value={editData.type}
                onChange={(e) => setEditData({...editData, type: e.target.value})}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="both">Both</option>
              </EditSelect>
            </>
          ) : (
            <>
              <CategoryName>{category.name}</CategoryName>
              <CategoryType>{category.type}</CategoryType>
            </>
          )}
        </CategoryDetails>
      </CategoryInfo>
      <ActionButtons>
        {editingId === category.id ? (
          <>
            <ActionButton $primary onClick={() => handleSaveEdit(category.id)}>
              ✓
            </ActionButton>
            <ActionButton onClick={handleCancelEdit}>
              ✕
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton onClick={() => handleEdit(category)}>
              ✏️
            </ActionButton>
            <ActionButton $danger onClick={() => handleDelete(category.id)}>
              🗑️
            </ActionButton>
          </>
        )}
      </ActionButtons>
    </CategoryItem>
  );

  return (
    <PageContainer>
      <PageTitle>Manage Categories</PageTitle>

      <AddCategoryForm onSubmit={handleSubmit}>
        {error && <e>{error}</e>}
        <FormRow>
          <Input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
          <Select
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="both">Both</option>
          </Select>
          <AddButton type="submit" disabled={loading || !newCategoryName.trim()}>
            {loading ? 'Adding...' : 'Add Category'}
          </AddButton>
        </FormRow>
      </AddCategoryForm>

      <CategoriesList>
        {categories.length > 0 ? (
          <>
            {incomeCategories.length > 0 && (
              <>
                <SectionHeader>Income Categories</SectionHeader>
                {incomeCategories.map(renderCategory)}
              </>
            )}

            {expenseCategories.length > 0 && (
              <>
                <SectionHeader>Expense Categories</SectionHeader>
                {expenseCategories.map(renderCategory)}
              </>
            )}

            {bothCategories.length > 0 && (
              <>
                <SectionHeader>General Categories</SectionHeader>
                {bothCategories.map(renderCategory)}
              </>
            )}
          </>
        ) : (
          <EmptyState>
            No categories yet. Add your first category above!
          </EmptyState>
        )}
      </CategoriesList>
    </PageContainer>
  );
};

export default Categories;