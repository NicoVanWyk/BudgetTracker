// src/components/TransactionCard.js
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import styled from 'styled-components';
import { format } from 'date-fns';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const Category = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const Description = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const Date = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

const Amount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.type === 'income' ? '#4CAF50' : '#f44336'};
  margin-right: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.$danger ? '#ffebee' : '#f0f0f0'};
    color: ${props => props.$danger ? '#f44336' : '#333'};
  }
`;

const EditForm = styled.form`
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 2fr 1.5fr 2fr auto;
    align-items: end;
  }
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TransactionCard = ({ transaction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const getDateValue = (dateValue) => {
    if (!dateValue) return new Date();
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate(); // Firestore Timestamp
    }
    if (Object.prototype.toString.call(dateValue) === '[object Date]') {
      return dateValue;
    }
    return new Date(dateValue);
  };

  const [editData, setEditData] = useState({
    amount: transaction.amount,
    category: transaction.category,
    date: format(getDateValue(transaction.date), 'yyyy-MM-dd'),
    description: transaction.description || ''
  });
  const [saving, setSaving] = useState(false);

  const { categories, editTransaction, removeTransaction } = useData();

  const filteredCategories = categories.filter(cat => 
    cat.type === transaction.type || cat.type === 'both'
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      amount: transaction.amount,
      category: transaction.category,
      date: format(getDateValue(transaction.date), 'yyyy-MM-dd'),
      description: transaction.description || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const result = await editTransaction(transaction.id, {
      ...editData,
      amount: parseFloat(editData.amount),
      description: editData.description.trim() || null
    });
    
    if (result.success) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await removeTransaction(transaction.id);
    }
  };

  return (
    <Card>
      <CardContent>
        <TransactionInfo>
          <Category>{transaction.category}</Category>
          {transaction.description && (
            <Description>{transaction.description}</Description>
          )}
          <Date>{format(getDateValue(transaction.date), 'MMM d, yyyy')}</Date>
        </TransactionInfo>
        
        <Amount type={transaction.type}>
          {transaction.type === 'income' ? '+' : '-'}R{transaction.amount.toFixed(2)}
        </Amount>
        
        <Actions>
          <ActionButton onClick={handleEdit} title="Edit">
            ✏️
          </ActionButton>
          <ActionButton onClick={handleDelete} $danger title="Delete">
            🗑️
          </ActionButton>
        </Actions>
      </CardContent>

      {isEditing && (
        <EditForm onSubmit={handleSave}>
          <FormGroup>
            <label>Amount</label>
            <Input
              type="number"
              step="0.01"
              value={editData.amount}
              onChange={(e) => setEditData({...editData, amount: e.target.value})}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label>Category</label>
            <Select
              value={editData.category}
              onChange={(e) => setEditData({...editData, category: e.target.value})}
              required
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <label>Date</label>
            <Input
              type="date"
              value={editData.date}
              onChange={(e) => setEditData({...editData, date: e.target.value})}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label>Description</label>
            <Input
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              placeholder="Optional"
            />
          </FormGroup>
          
          <div>
            <SaveButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </SaveButton>
            <ActionButton type="button" onClick={handleCancel}>
              Cancel
            </ActionButton>
          </div>
        </EditForm>
      )}
    </Card>
  );
};

export default TransactionCard;