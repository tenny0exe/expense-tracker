
'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import type { ToDoItem, ReminderItem } from '@/lib/types';

const LOCAL_STORAGE_TODOS_KEY = 'expenseTrackerTodos';
const LOCAL_STORAGE_REMINDERS_KEY = 'expenseTrackerReminders';

interface ProductivityContextType {
  todos: ToDoItem[];
  reminders: ReminderItem[];
  addTodo: (description: string, date: string) => Promise<void>;
  toggleTodoCompleted: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addReminder: (description: string, date: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export const ProductivityProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    setError(null);
    setLoading(true);
    try {
      const storedTodos = localStorage.getItem(LOCAL_STORAGE_TODOS_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos) as ToDoItem[]);
      }
      const storedReminders = localStorage.getItem(LOCAL_STORAGE_REMINDERS_KEY);
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders) as ReminderItem[]);
      }
    } catch (err) {
      console.error("Error loading productivity data from localStorage:", err);
      setError("Failed to load to-dos/reminders from local storage.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (!loading && !error) {
      try {
        localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
      } catch (err) {
        console.error("Error saving todos to localStorage:", err);
        // Potentially set an error state to inform the user
      }
    }
  }, [todos, loading, error]);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    if (!loading && !error) {
      try {
        localStorage.setItem(LOCAL_STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
      } catch (err) {
        console.error("Error saving reminders to localStorage:", err);
        // Potentially set an error state
      }
    }
  }, [reminders, loading, error]);

  const addTodo = useCallback(async (description: string, date: string) => {
    setError(null);
    try {
      const newTodo: ToDoItem = {
        id: crypto.randomUUID(),
        date,
        description,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos(prevTodos => [...prevTodos, newTodo].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Failed to add to-do.");
      throw err;
    }
  }, []);

  const toggleTodoCompleted = useCallback(async (id: string) => {
    setError(null);
    try {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (err) {
      console.error("Error toggling todo:", err);
      setError("Failed to update to-do status.");
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setError(null);
    try {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete to-do.");
      throw err;
    }
  }, []);

  const addReminder = useCallback(async (description: string, date: string) => {
    setError(null);
    try {
      const newReminder: ReminderItem = {
        id: crypto.randomUUID(),
        date,
        description,
        createdAt: new Date().toISOString(),
      };
      setReminders(prevReminders => [...prevReminders, newReminder].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError("Failed to add reminder.");
      throw err;
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    setError(null);
    try {
      setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError("Failed to delete reminder.");
      throw err;
    }
  }, []);

  const contextValue = useMemo(() => ({
    todos,
    reminders,
    addTodo,
    toggleTodoCompleted,
    deleteTodo,
    addReminder,
    deleteReminder,
    loading,
    error
  }), [todos, reminders, addTodo, toggleTodoCompleted, deleteTodo, addReminder, deleteReminder, loading, error]);

  return (
    <ProductivityContext.Provider value={contextValue}>
      {children}
    </ProductivityContext.Provider>
  );
};

export const useProductivity = (): ProductivityContextType => {
  const context = useContext(ProductivityContext);
  if (context === undefined) {
    throw new Error('useProductivity must be used within a ProductivityProvider');
  }
  return context;
};
