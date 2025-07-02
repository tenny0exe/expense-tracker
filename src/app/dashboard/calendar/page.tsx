
"use client";

import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useProductivity } from '@/context/ProductivityContext';
import type { TransactionCategory, ToDoItem, ReminderItem } from '@/lib/types';
import { format, isSameDay, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getCategoryInfo, CATEGORIES_INFO } from '@/lib/mockData';
import { ListChecks, Bell, AlertCircle, DollarSign, ArrowUpCircle, ArrowDownCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext'; 

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { transactions, addTransaction } = useTransactions();
  const { 
    todos, 
    reminders, 
    addTodo, 
    toggleTodoCompleted, 
    deleteTodo, 
    addReminder, 
    deleteReminder,
    loading: productivityLoading 
  } = useProductivity();
  const { selectedCurrency, formatCurrency } = useCurrency();

  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
  const [newIncomeDescription, setNewIncomeDescription] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState<number | ''>('');

  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<TransactionCategory | ''>('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');

  const [isAddToDoDialogOpen, setIsAddToDoDialogOpen] = useState(false);
  const [newToDoDescription, setNewToDoDescription] = useState('');

  const [isAddReminderDialogOpen, setIsAddReminderDialogOpen] = useState(false);
  const [newReminderDescription, setNewReminderDescription] = useState('');

  const dailyTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter(transaction => 
      isSameDay(parseISO(transaction.date), selectedDate)
    );
  }, [selectedDate, transactions]);

  const dailyTodos = useMemo(() => {
    if (!selectedDate) return [];
    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
    return todos.filter(todo => isSameDay(parseISO(todo.date), selectedDateString));
  }, [selectedDate, todos]);

  const dailyReminders = useMemo(() => {
    if (!selectedDate) return [];
    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
    return reminders.filter(reminder => isSameDay(parseISO(reminder.date), selectedDateString));
  }, [selectedDate, reminders]);


  const dailySummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    dailyTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
      }
    });
    return { income, expenses };
  }, [dailyTransactions]);

  const availableCategoriesForAddExpense = useMemo(() => {
    return CATEGORIES_INFO
      .filter(c => c.name !== "Income") 
      .map(c => c.name as TransactionCategory);
  }, []);

  const handleAddIncome = async () => {
    if (!selectedDate || !newIncomeDescription || typeof newIncomeAmount !== 'number' || newIncomeAmount <= 0) {
      alert("Please fill all fields correctly for income. Amount must be greater than 0.");
      return;
    }
    try {
      await addTransaction({
        description: newIncomeDescription,
        category: "Income",
        amount: Math.abs(newIncomeAmount),
        type: 'income',
      }, selectedDate);
      setNewIncomeDescription('');
      setNewIncomeAmount('');
      setIsAddIncomeDialogOpen(false);
    } catch (error) {
      alert("Failed to add income. Please try again.");
      console.error("Failed to add income:", error);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedDate || !newExpenseDescription || !newExpenseCategory || typeof newExpenseAmount !== 'number' || newExpenseAmount <= 0) {
      alert("Please fill all fields correctly for expense. Amount must be greater than 0.");
      return;
    }
    try {
      await addTransaction({
        description: newExpenseDescription,
        category: newExpenseCategory as TransactionCategory,
        amount: -Math.abs(newExpenseAmount),
        type: 'expense',
      }, selectedDate);
      setNewExpenseDescription('');
      setNewExpenseCategory('');
      setNewExpenseAmount('');
      setIsAddExpenseDialogOpen(false);
    } catch (error) {
      alert("Failed to add expense. Please try again.");
      console.error("Failed to add expense:", error);
    }
  };

  const handleAddToDo = async () => {
    if (!selectedDate || !newToDoDescription.trim()) {
      alert("Please enter a description for your to-do.");
      return;
    }
    try {
      await addTodo(newToDoDescription.trim(), format(selectedDate, "yyyy-MM-dd"));
      setNewToDoDescription('');
      setIsAddToDoDialogOpen(false);
    } catch (error) {
      alert("Failed to add to-do. Please try again.");
      console.error("Failed to add to-do:", error);
    }
  };

  const handleAddReminder = async () => {
    if (!selectedDate || !newReminderDescription.trim()) {
      alert("Please enter a description for your reminder.");
      return;
    }
    try {
      await addReminder(newReminderDescription.trim(), format(selectedDate, "yyyy-MM-dd"));
      setNewReminderDescription('');
      setIsAddReminderDialogOpen(false);
    } catch (error) {
      alert("Failed to add reminder. Please try again.");
      console.error("Failed to add reminder:", error);
    }
  };


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Select a day to view activities or add new items.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            Activities for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "No date selected"}
          </CardTitle>
          <CardDescription>Manage your finances, to-dos, and reminders for the selected day.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <ScrollArea className="h-[calc(100vh-220px)] pr-3"> 
              <div className="space-y-6">
                <section>
                  <div className="flex gap-2 mb-4">
                    <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 flex-1">
                          <ArrowUpCircle className="mr-2 h-4 w-4" /> Add Income
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Income for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input id="income-description-cal" value={newIncomeDescription} onChange={(e) => setNewIncomeDescription(e.target.value)} placeholder="Description (e.g., Salary)" />
                          <Input id="income-amount-cal" type="number" value={newIncomeAmount} onChange={(e) => setNewIncomeAmount(parseFloat(e.target.value) || '')} placeholder={`Amount (e.g., 100.00 in ${selectedCurrency.code})`} min="0.01" step="0.01" />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddIncomeDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddIncome}>Add Income</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1">
                          <ArrowDownCircle className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Expense for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input id="expense-description-cal" value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} placeholder="Description (e.g., Lunch)" />
                          <Select value={newExpenseCategory} onValueChange={(value) => setNewExpenseCategory(value as TransactionCategory)}>
                            <SelectTrigger id="expense-category-cal"><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                              {availableCategoriesForAddExpense.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Input id="expense-amount-cal" type="number" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || '')} placeholder={`Amount (e.g., 25.00 in ${selectedCurrency.code})`} min="0.01" step="0.01"/>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddExpense}>Add Expense</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle></CardHeader>
                      <CardContent><div className="text-2xl font-bold">{formatCurrency(dailySummary.income)}</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle></CardHeader>
                      <CardContent><div className="text-2xl font-bold">{formatCurrency(dailySummary.expenses)}</div></CardContent>
                    </Card>
                  </div>

                  {dailyTransactions.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold">Transactions:</h4>
                      {dailyTransactions.map(transaction => {
                        const categoryInfo = getCategoryInfo(transaction.category);
                        const Icon = categoryInfo.icon;
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md text-sm">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <Badge variant="outline" className={`text-xs ${categoryInfo.color} border-current`}>{transaction.category}</Badge>
                              </div>
                            </div>
                            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount)).replace(selectedCurrency.symbol, '')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No transactions for this day.</p>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" /> To-Do List</h4>
                    <Dialog open={isAddToDoDialogOpen} onOpenChange={setIsAddToDoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add To-Do</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add To-Do for {format(selectedDate, "MMMM d")}</DialogTitle></DialogHeader>
                        <Textarea value={newToDoDescription} onChange={(e) => setNewToDoDescription(e.target.value)} placeholder="Enter to-do description..." />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddToDoDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddToDo}>Add To-Do</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {productivityLoading ? <p>Loading to-dos...</p> : dailyTodos.length > 0 ? (
                    <div className="space-y-2">
                      {dailyTodos.map(todo => (
                        <div key={todo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md text-sm">
                          <div className="flex items-center gap-2">
                            <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => toggleTodoCompleted(todo.id)} />
                            <Label htmlFor={`todo-${todo.id}`} className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.description}</Label>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteTodo(todo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No to-dos for this day.</p>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold flex items-center"><Bell className="mr-2 h-5 w-5 text-primary" /> Reminders</h4>
                    <Dialog open={isAddReminderDialogOpen} onOpenChange={setIsAddReminderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Reminder</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Set Reminder for {format(selectedDate, "MMMM d")}</DialogTitle></DialogHeader>
                        <Textarea value={newReminderDescription} onChange={(e) => setNewReminderDescription(e.target.value)} placeholder="Enter reminder note..." />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddReminderDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddReminder}>Set Reminder</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {productivityLoading ? <p>Loading reminders...</p> : dailyReminders.length > 0 ? (
                     <div className="space-y-2">
                      {dailyReminders.map(reminder => (
                        <div key={reminder.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md text-sm">
                          <p className="flex-1">{reminder.description}</p>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteReminder(reminder.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No reminders for this day.</p>
                  )}
                </section>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p>Please select a day on the calendar to see details and add items.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
