
'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import type { Currency, CurrencyCode } from '@/lib/types';

const LOCAL_STORAGE_CURRENCY_KEY = 'expenseTrackerSelectedCurrency';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const DEFAULT_CURRENCY_CODE: CurrencyCode = "USD";

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrencyCode: (code: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(DEFAULT_CURRENCY_CODE);

  useEffect(() => {
    try {
      const storedCurrencyCode = localStorage.getItem(LOCAL_STORAGE_CURRENCY_KEY) as CurrencyCode | null;
      if (storedCurrencyCode && SUPPORTED_CURRENCIES.some(c => c.code === storedCurrencyCode)) {
        setCurrencyCode(storedCurrencyCode);
      }
    } catch (error) {
        console.error("Error reading currency from localStorage:", error);
        // If localStorage is unavailable or corrupt, default will be used.
    }
  }, []);

  const handleSetSelectedCurrencyCode = useCallback((code: CurrencyCode) => {
    if (SUPPORTED_CURRENCIES.some(c => c.code === code)) {
      setCurrencyCode(code);
      try {
        localStorage.setItem(LOCAL_STORAGE_CURRENCY_KEY, code);
      } catch (error) {
        console.error("Error saving currency to localStorage:", error);
        // Notify user or handle error appropriately if localStorage is full/unavailable
      }
    }
  }, []);

  const selectedCurrency = useMemo(() => {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE)!;
  }, [currencyCode]);

  const formatCurrency = useCallback((amount: number): string => {
    try {
      return new Intl.NumberFormat(undefined, { 
        style: 'currency',
        currency: selectedCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      // Fallback for environments where Intl might not support the currency or has other issues
      return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
    }
  }, [selectedCurrency]);

  const contextValue = useMemo(() => ({
    selectedCurrency,
    setSelectedCurrencyCode: handleSetSelectedCurrencyCode,
    formatCurrency,
  }), [selectedCurrency, handleSetSelectedCurrencyCode, formatCurrency]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
