// src/pages/AddEntry.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #4CAF50;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
`;

const AddEntry = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <PageContainer>
      <PageTitle>Add Transaction</PageTitle>
      
      {showSuccess && (
        <SuccessMessage>
          Transaction added successfully!
        </SuccessMessage>
      )}
      
      <TransactionForm onSuccess={handleSuccess} />
    </PageContainer>
  );
};

export default AddEntry;