/**
 * Hooks API pour le module Finances
 * Utilise les mock data pour le développement
 * À remplacer par de vraies API calls en production
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  mockTransactions,
  mockInvoices,
  mockBudgets,
  mockPaymentRecords,
  getTransactionById,
  getInvoiceById,
  getBudgetById,
  getTransactionsByType,
  getTransactionsByStatus,
  getInvoicesByStatus,
  getBudgetsByStatus,
  getTotalRevenue,
  getTotalExpenses,
  getPendingAmount,
  getOverdueAmount,
  type Transaction,
  type Invoice,
  type Budget,
  type PaymentRecord,
} from '@/lib/data/finances/mockData';

// Simule un délai réseau
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ================================
// useTransactions
// ================================
interface UseTransactionsOptions {
  type?: Transaction['type'];
  status?: Transaction['status'];
  bureau?: string;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(300);

      let filtered = [...mockTransactions];

      if (options.type) {
        filtered = filtered.filter((t) => t.type === options.type);
      }

      if (options.status) {
        filtered = filtered.filter((t) => t.status === options.status);
      }

      if (options.bureau) {
        filtered = filtered.filter((t) => t.bureau === options.bureau);
      }

      if (options.startDate) {
        filtered = filtered.filter((t) => t.date >= options.startDate!);
      }

      if (options.endDate) {
        filtered = filtered.filter((t) => t.date <= options.endDate!);
      }

      // Sort by date descending
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData(filtered);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.type, options.status, options.bureau, options.startDate, options.endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refetch = useCallback(() => {
    return fetchTransactions();
  }, [fetchTransactions]);

  return { data, isLoading, error, refetch };
}

// ================================
// useTransaction (single)
// ================================
export function useTransaction(id: string | null) {
  const [data, setData] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        setData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await delay(200);
        const transaction = getTransactionById(id);
        if (!transaction) {
          throw new Error('Transaction not found');
        }
        setData(transaction);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  return { data, isLoading, error };
}

// ================================
// useInvoices
// ================================
interface UseInvoicesOptions {
  status?: Invoice['status'];
  paymentStatus?: Invoice['paymentStatus'];
  bureau?: string;
  client?: string;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const [data, setData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(300);

      let filtered = [...mockInvoices];

      if (options.status) {
        filtered = filtered.filter((i) => i.status === options.status);
      }

      if (options.paymentStatus) {
        filtered = filtered.filter((i) => i.paymentStatus === options.paymentStatus);
      }

      if (options.bureau) {
        filtered = filtered.filter((i) => i.bureau === options.bureau);
      }

      if (options.client) {
        filtered = filtered.filter((i) =>
          i.client.toLowerCase().includes(options.client!.toLowerCase())
        );
      }

      // Sort by issue date descending
      filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

      setData(filtered);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.paymentStatus, options.bureau, options.client]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const refetch = useCallback(() => {
    return fetchInvoices();
  }, [fetchInvoices]);

  return { data, isLoading, error, refetch };
}

// ================================
// useInvoice (single)
// ================================
export function useInvoice(id: string | null) {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await delay(200);
        const invoice = getInvoiceById(id);
        if (!invoice) {
          throw new Error('Invoice not found');
        }
        setData(invoice);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { data, isLoading, error };
}

// ================================
// useBudgets
// ================================
interface UseBudgetsOptions {
  status?: Budget['status'];
  bureau?: string;
  category?: string;
}

export function useBudgets(options: UseBudgetsOptions = {}) {
  const [data, setData] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(300);

      let filtered = [...mockBudgets];

      if (options.status) {
        filtered = filtered.filter((b) => b.status === options.status);
      }

      if (options.bureau) {
        filtered = filtered.filter((b) => b.bureau === options.bureau || b.bureau === 'Tous');
      }

      if (options.category) {
        filtered = filtered.filter((b) => b.category === options.category);
      }

      // Sort by percentage descending (most consumed first)
      filtered.sort((a, b) => b.percentage - a.percentage);

      setData(filtered);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.bureau, options.category]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const refetch = useCallback(() => {
    return fetchBudgets();
  }, [fetchBudgets]);

  return { data, isLoading, error, refetch };
}

// ================================
// useBudget (single)
// ================================
export function useBudget(id: string | null) {
  const [data, setData] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) {
        setData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await delay(200);
        const budget = getBudgetById(id);
        if (!budget) {
          throw new Error('Budget not found');
        }
        setData(budget);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [id]);

  return { data, isLoading, error };
}

// ================================
// useFinancialStats
// ================================
export function useFinancialStats() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    cashBalance: 0,
    budgetUtilization: 0,
    profitMargin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await delay(400);

        const totalRevenue = getTotalRevenue();
        const totalExpenses = getTotalExpenses();
        const netProfit = totalRevenue - totalExpenses;
        const pendingAmount = getPendingAmount();
        const overdueAmount = getOverdueAmount();
        const cashBalance = 892000000; // Mock value

        // Calculate budget utilization
        const totalAllocated = mockBudgets.reduce((sum, b) => sum + b.allocated, 0);
        const totalConsumed = mockBudgets.reduce((sum, b) => sum + b.consumed, 0);
        const budgetUtilization = totalAllocated > 0 ? (totalConsumed / totalAllocated) * 100 : 0;

        // Calculate profit margin
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setData({
          totalRevenue,
          totalExpenses,
          netProfit,
          pendingAmount,
          overdueAmount,
          cashBalance,
          budgetUtilization: Math.round(budgetUtilization),
          profitMargin: Math.round(profitMargin * 10) / 10,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, isLoading, error };
}

// ================================
// usePaymentRecords
// ================================
export function usePaymentRecords(invoiceId?: string) {
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await delay(200);

        let filtered = [...mockPaymentRecords];

        if (invoiceId) {
          filtered = filtered.filter((p) => p.invoiceId === invoiceId);
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData(filtered);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [invoiceId]);

  return { data, isLoading, error };
}

// ================================
// Mutation hooks (pour créer/modifier/supprimer)
// ================================

export function useCreateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(500);

      // Simulate API call
      const newTransaction: Transaction = {
        ...transaction,
        id: `TRX-2025-${String(mockTransactions.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In real app, this would be an API call
      mockTransactions.unshift(newTransaction);

      return { success: true, data: newTransaction };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createTransaction, isLoading, error };
}

export function useUpdateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(400);

      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }

      mockTransactions[index] = {
        ...mockTransactions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: mockTransactions[index] };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateTransaction, isLoading, error };
}

export function useDeleteTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(300);

      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }

      mockTransactions.splice(index, 1);

      return { success: true };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteTransaction, isLoading, error };
}

// Similar mutation hooks for invoices and budgets
export function useCreateInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(500);

      const newInvoice: Invoice = {
        ...invoice,
        id: `INV-2025-${String(mockInvoices.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockInvoices.unshift(newInvoice);

      return { success: true, data: newInvoice };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createInvoice, isLoading, error };
}

export function useUpdateInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    setIsLoading(true);
    setError(null);

    try {
      await delay(400);

      const index = mockInvoices.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Invoice not found');
      }

      mockInvoices[index] = {
        ...mockInvoices[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: mockInvoices[index] };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateInvoice, isLoading, error };
}

