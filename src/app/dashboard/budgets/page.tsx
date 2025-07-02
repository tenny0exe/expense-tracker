
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES_INFO, getCategoryInfo } from '@/lib/mockData'; 
import type { Budget, TransactionCategory } from '@/lib/types'; 
import { DollarSign, Edit3, PlusCircle, Save, Trash2, XCircle, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from '@/context/TransactionsContext';
import { useCurrency } from '@/context/CurrencyContext';

interface EditableBudget extends Budget {
  isEditing?: boolean;
  tempLimit?: number; 
}

export default function BudgetsPage() {
  const { transactions, loading: transactionsLoading } = useTransactions(); 
  const { selectedCurrency, formatCurrency } = useCurrency();

  const [budgets, setBudgets] = useState<EditableBudget[]>([]); 
  
  const [isAdding, setIsAdding] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState<TransactionCategory | ''>('');
  const [newBudgetLimit, setNewBudgetLimit] = useState<number | ''>('');

  const budgetsWithCalculatedSpent = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
      return { ...budget, spent };
    });
  }, [transactions, budgets]);


  const availableCategories = useMemo(() => {
    const budgetedCategories = budgets.map(b => b.category);
    return CATEGORIES_INFO.filter(c => c.name !== "Income" && !budgetedCategories.includes(c.name)).map(c => c.name as TransactionCategory);
  }, [budgets]);

  const handleEdit = (category: TransactionCategory) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, isEditing: true, tempLimit: b.limit } : b));
  };

  const handleSave = (category: TransactionCategory) => {
    setBudgets(prev => prev.map(b => {
      if (b.category === category) {
        return { ...b, limit: b.tempLimit !== undefined ? b.tempLimit : b.limit, isEditing: false, tempLimit: undefined };
      }
      return b;
    }));
  };
  
  const handleCancelEdit = (category: TransactionCategory) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, isEditing: false, tempLimit: undefined } : b));
  };

  const handleLimitChange = (category: TransactionCategory, value: string) => {
    const numValue = parseFloat(value);
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, tempLimit: isNaN(numValue) ? 0 : numValue } : b));
  };

  const handleAddBudget = () => {
    if (newBudgetCategory && typeof newBudgetLimit === 'number' && newBudgetLimit > 0) {
      setBudgets(prev => [...prev, { category: newBudgetCategory, limit: newBudgetLimit, spent: 0, isEditing: false }]);
      setNewBudgetCategory('');
      setNewBudgetLimit('');
      setIsAdding(false);
    }
  };
  
  const handleDeleteBudget = (category: TransactionCategory) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  if (transactionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading budgets and transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Set and manage your monthly spending limits. (Budgets are not yet saved)</CardDescription>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
                <DialogDescription>
                  Choose a category and set a monthly limit.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Select 
                    value={newBudgetCategory}
                    onValueChange={(value) => setNewBudgetCategory(value as TransactionCategory)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="limit" className="text-right">Limit ({selectedCurrency.symbol})</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(parseFloat(e.target.value) || '')}
                    className="col-span-3"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleAddBudget} disabled={!newBudgetCategory || typeof newBudgetLimit !== 'number' || newBudgetLimit <= 0}>Add Budget</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {budgetsWithCalculatedSpent.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {budgetsWithCalculatedSpent.map((budget) => {
                const categoryInfo = getCategoryInfo(budget.category);
                const Icon = categoryInfo.icon;
                const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                const remaining = budget.limit - budget.spent;
                const isOverBudget = budget.spent > budget.limit;

                return (
                  <Card key={budget.category} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-6 w-6 ${categoryInfo.color}`} />
                          <CardTitle className="text-lg">{budget.category}</CardTitle>
                        </div>
                        {!budget.isEditing ? (
                           <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(budget.category)}>
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteBudget(budget.category)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                           </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSave(budget.category)}>
                                <Save className="h-4 w-4 text-green-500 hover:text-green-600" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCancelEdit(budget.category)}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      {budget.isEditing ? (
                        <div>
                          <Label htmlFor={`limit-${budget.category}`}>Set Limit ({selectedCurrency.symbol})</Label>
                          <Input
                            id={`limit-${budget.category}`}
                            type="number"
                            value={budget.tempLimit !== undefined ? budget.tempLimit : budget.limit}
                            onChange={(e) => handleLimitChange(budget.category, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold">{formatCurrency(budget.spent)}</span>
                            <span className="text-sm text-muted-foreground">/ {formatCurrency(budget.limit)}</span>
                          </div>
                          <Progress value={progress} aria-label={`${budget.category} budget progress`} className={isOverBudget ? "[&>div]:bg-destructive" : ""} />
                          <div className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {isOverBudget 
                              ? `${formatCurrency(Math.abs(remaining))} Over Budget`
                              : `${formatCurrency(remaining)} Remaining`}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">No budgets set</h3>
              <p>Click "Add Budget" to start planning your finances.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
