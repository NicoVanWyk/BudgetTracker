// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, loginUser, registerUser, logoutUser } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError(null);
    const result = await loginUser(email, password);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const register = async (email, password, displayName) => {
    setError(null);
    const result = await registerUser(email, password, displayName);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const logout = async () => {
    setError(null);
    const result = await logoutUser();
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};