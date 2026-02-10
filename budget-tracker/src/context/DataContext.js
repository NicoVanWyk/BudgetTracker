// src/context/DataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeToUserTransactions,
  addCategory,
  updateCategory,
  deleteCategory,
  subscribeToUserCategories
} from '../firebase/firestore';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribeTransactions = subscribeToUserTransactions(user.uid, (newTransactions) => {
      setTransactions(newTransactions);
      setLoading(false);
    });

    const unsubscribeCategories = subscribeToUserCategories(user.uid, (newCategories) => {
      setCategories(newCategories);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [user]);

  // Transaction operations
  const createTransaction = async (transactionData) => {
    setError(null);
    const result = await addTransaction(user.uid, transactionData);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const editTransaction = async (transactionId, updates) => {
    setError(null);
    const result = await updateTransaction(transactionId, updates);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const removeTransaction = async (transactionId) => {
    setError(null);
    const result = await deleteTransaction(transactionId);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  // Category operations
  const createCategory = async (categoryData) => {
    setError(null);
    const result = await addCategory(user.uid, categoryData);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const editCategory = async (categoryId, updates) => {
    setError(null);
    const result = await updateCategory(categoryId, updates);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const removeCategory = async (categoryId) => {
    setError(null);
    const result = await deleteCategory(categoryId);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const clearError = () => setError(null);

  const value = {
    transactions,
    categories,
    loading,
    error,
    createTransaction,
    editTransaction,
    removeTransaction,
    createCategory,
    editCategory,
    removeCategory,
    clearError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};