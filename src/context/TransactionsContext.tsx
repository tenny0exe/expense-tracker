
'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import type { Transaction, TransactionCategory } from '@/lib/types';

const LOCAL_STORAGE_TRANSACTIONS_KEY = 'expenseTrackerTransactions';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (newTransactionData: Omit<Transaction, 'id' | 'date'>, transactionDate?: Date) => Promise<void>;
  updateTransactionCategory: (transactionId: string, newCategory: TransactionCategory) => Promise<void>;
  clearAllTransactions: () => Promise<void>; // New function
  loading: boolean; 
  error: string | null;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions) as Transaction[];
        setTransactions(parsedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (err) {
      console.error("Error loading transactions from localStorage:", err);
      setError("Failed to load transactions from local storage.");
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      try {
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
      } catch (err) {
        console.error("Error saving transactions to localStorage:", err);
        setError("Failed to save transactions to local storage. Data might not persist.");
      }
    }
  }, [transactions, loading, error]);

  const addTransaction = useCallback(async (newTransactionData: Omit<Transaction, 'id' | 'date'>, transactionDate?: Date) => {
    setError(null); 
    try {
      const newTransaction: Transaction = {
        ...newTransactionData,
        id: crypto.randomUUID(),
        date: (transactionDate || new Date()).toISOString(),
      };
      setTransactions(prevTransactions => 
        [...prevTransactions, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction.");
      throw err; 
    }
  }, []);

  const updateTransactionCategory = useCallback(async (transactionId: string, newCategory: TransactionCategory) => {
    setError(null);
    try {
      setTransactions(prevTransactions =>
        prevTransactions.map(t =>
          t.id === transactionId ? { ...t, category: newCategory } : t
        )
      );
    } catch (err) {
      console.error("Error updating transaction category:", err);
      setError("Failed to update transaction category.");
      throw err;
    }
  }, []);

  const clearAllTransactions = useCallback(async () => {
    setError(null);
    try {
      setTransactions([]);
      localStorage.removeItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    } catch (err) {
      console.error("Error clearing transactions:", err);
      setError("Failed to clear transaction history.");
      throw err;
    }
  }, []);

  const contextValue = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransactionCategory,
    clearAllTransactions,
    loading,
    error
  }), [transactions, addTransaction, updateTransactionCategory, clearAllTransactions, loading, error]);

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = (): TransactionsContextType => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
