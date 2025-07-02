
import type { LucideIcon } from 'lucide-react';

export type TransactionCategory = 
  | "Food" 
  | "Shopping" 
  | "Transport" 
  | "Utilities" 
  | "Entertainment" 
  | "Health"
  | "Income"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  category: TransactionCategory;
  amount: number; // positive for income, negative for expenses
  type: 'expense' | 'income';
}

export interface CategoryInfo {
  name: TransactionCategory;
  icon: LucideIcon;
  color: string; // tailwind color class e.g. text-blue-500
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
  spent: number; // This will be calculated from transactions
}

export interface SpendingInsight {
  category: TransactionCategory;
  totalSpent: number;
  percentage: number;
}

export interface ToDoItem {
  id: string;
  date: string; // ISO string for the day it's associated with
  description: string;
  completed: boolean;
  createdAt: string; // ISO string
}

export interface ReminderItem {
  id: string;
  date: string; // ISO string for the day it's associated with
  description: string;
  createdAt: string; // ISO string
}

// Currency Types
export type CurrencyCode = "USD" | "EUR" | "INR" | "JPY" | "GBP";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}
