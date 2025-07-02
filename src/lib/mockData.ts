import type { Transaction, CategoryInfo, Budget, TransactionCategory } from '@/lib/types';
import { Utensils, ShoppingBag, Car, Bolt, Film, HeartPulse, Shapes, HandCoins } from 'lucide-react'; // DollarSign removed as Income uses HandCoins now

export const CATEGORIES_INFO: CategoryInfo[] = [
  { name: "Food", icon: Utensils, color: "text-red-500" },
  { name: "Shopping", icon: ShoppingBag, color: "text-blue-500" },
  { name: "Transport", icon: Car, color: "text-yellow-500" },
  { name: "Utilities", icon: Bolt, color: "text-green-500" },
  { name: "Entertainment", icon: Film, color: "text-purple-500" },
  { name: "Health", icon: HeartPulse, color: "text-pink-500" },
  { name: "Income", icon: HandCoins, color: "text-emerald-500" },
  { name: "Other", icon: Shapes, color: "text-gray-500" },
];

export const getCategoryInfo = (categoryName: TransactionCategory): CategoryInfo => {
  return CATEGORIES_INFO.find(c => c.name === categoryName) || CATEGORIES_INFO.find(c => c.name === "Other")!;
};

export const MOCK_TRANSACTIONS: Transaction[] = []; // Emptied mock transactions

export const MOCK_BUDGETS: Budget[] = []; // Emptied mock budgets
