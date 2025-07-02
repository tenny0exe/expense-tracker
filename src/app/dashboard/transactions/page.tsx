
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryInfo, CATEGORIES_INFO } from '@/lib/mockData';
import type { Transaction, TransactionCategory } from '@/lib/types';
import { format } from 'date-fns';
import { Download, Filter, PlusCircle, Pencil, List, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTransactions } from '@/context/TransactionsContext'; 
import { useCurrency } from '@/context/CurrencyContext'; 

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransactionCategory } = useTransactions(); 
  const { selectedCurrency, formatCurrency } = useCurrency();
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<TransactionCategory | ''>('');

  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<TransactionCategory | ''>('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');

  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
  const [newIncomeDescription, setNewIncomeDescription] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState<number | ''>('');


  const handleOpenAddExpenseDialog = () => {
    setNewExpenseDescription('');
    setNewExpenseCategory('');
    setNewExpenseAmount('');
    setIsAddExpenseDialogOpen(true);
  };

  const handleSaveNewExpense = () => {
    if (!newExpenseDescription || !newExpenseCategory || typeof newExpenseAmount !== 'number' || newExpenseAmount <= 0) {
      alert("Please fill all fields correctly. Amount must be greater than 0.");
      return;
    }
    addTransaction({ 
      description: newExpenseDescription,
      category: newExpenseCategory as TransactionCategory,
      amount: -Math.abs(newExpenseAmount), 
      type: 'expense',
    });
    setIsAddExpenseDialogOpen(false);
  };

  const handleOpenAddIncomeDialog = () => {
    setNewIncomeDescription('');
    setNewIncomeAmount('');
    setIsAddIncomeDialogOpen(true);
  };

  const handleSaveNewIncome = () => {
    if (!newIncomeDescription || typeof newIncomeAmount !== 'number' || newIncomeAmount <= 0) {
      alert("Please fill all fields correctly for income. Amount must be greater than 0.");
      return;
    }
    addTransaction({ 
      description: newIncomeDescription,
      category: "Income",
      amount: Math.abs(newIncomeAmount),
      type: 'income',
    });
    setIsAddIncomeDialogOpen(false);
  };


  const handleOpenCategoryDialog = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        setEditingTransactionId(transactionId);
        setSelectedCategoryForEdit(availableCategoriesForEdit.includes(transaction.category) ? transaction.category : '');
        setIsCategoryDialogOpen(true);
    }
  };

  const handleSaveCategory = () => {
    if (editingTransactionId && selectedCategoryForEdit) {
      updateTransactionCategory(editingTransactionId, selectedCategoryForEdit as TransactionCategory); 
      setIsCategoryDialogOpen(false);
      setEditingTransactionId(null);
    }
  };

  const availableCategoriesForEdit = useMemo(() => {
    return CATEGORIES_INFO
      .filter(c => c.name !== "Income" && c.name !== "Other") 
      .map(c => c.name as TransactionCategory);
  }, []);

  const availableCategoriesForAddExpense = useMemo(() => {
    return CATEGORIES_INFO
      .filter(c => c.name !== "Income") 
      .map(c => c.name as TransactionCategory);
  }, []);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View and manage your GPay transactions.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            
            <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={handleOpenAddIncomeDialog}>
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Income</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new income. Category will be set to "Income".
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-description" className="text-right">Description</Label>
                    <Input
                      id="income-description"
                      value={newIncomeDescription}
                      onChange={(e) => setNewIncomeDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Monthly Salary, Freelance Project"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-amount" className="text-right">Amount ({selectedCurrency.symbol})</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      value={newIncomeAmount}
                      onChange={(e) => setNewIncomeAmount(parseFloat(e.target.value) || '')}
                      className="col-span-3"
                      placeholder={`e.g., 2500.00`}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddIncomeDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveNewIncome}>Add Income</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleOpenAddExpenseDialog}>
                  <ArrowDownCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new expense.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expense-description" className="text-right">Description</Label>
                    <Input
                      id="expense-description"
                      value={newExpenseDescription}
                      onChange={(e) => setNewExpenseDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Coffee with friends"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-add-expense" className="text-right">Category</Label>
                    <Select
                      value={newExpenseCategory}
                      onValueChange={(value) => setNewExpenseCategory(value as TransactionCategory)}
                    >
                      <SelectTrigger id="category-add-expense" className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategoriesForAddExpense.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expense-amount" className="text-right">Amount ({selectedCurrency.symbol})</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || '')}
                      className="col-span-3"
                      placeholder={`e.g., 15.50`}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveNewExpense}>Add Expense</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const categoryInfo = getCategoryInfo(transaction.category);
                    const Icon = categoryInfo.icon;
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-current ${categoryInfo.color}`}>
                            <Icon className={`mr-1 h-3 w-3 ${categoryInfo.color}`} />
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount)).replace(selectedCurrency.symbol, '')}
                        </TableCell>
                        <TableCell className="text-center">
                          {transaction.category === "Other" && transaction.type === "expense" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleOpenCategoryDialog(transaction.id)}
                              aria-label="Edit category"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <List className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">No transactions yet</h3>
              <p>Add transactions manually to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorize Expense</DialogTitle>
            <DialogDescription>
              Select a new category for the transaction: "{transactions.find(t => t.id === editingTransactionId)?.description}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-select-edit" className="text-right">
                Category
              </Label>
              <Select
                value={selectedCategoryForEdit}
                onValueChange={(value) => setSelectedCategoryForEdit(value as TransactionCategory)}
              >
                <SelectTrigger id="category-select-edit" className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategoriesForEdit.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={!selectedCategoryForEdit}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
