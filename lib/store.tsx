'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Transaction } from '@/types/transaction';

interface TransactionStore {
    transactions: Transaction[];
    initialBalance: number;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
    deleteTransaction: (id: string) => void;
    deleteMultipleTransactions: (ids: string[]) => void;
    clearTransactions: () => void;
    setInitialBalance: (amount: number) => void;
    resetInitialBalance: () => void;
    getBalance: () => number;
    getTotalIncome: () => number;
    getTotalExpense: () => number;
    getThisWeekTransactions: () => Transaction[];
    getThisMonthTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionStore | null>(null);

const STORAGE_KEY = 'receipt-tracker-transactions';
const BALANCE_STORAGE_KEY = 'receipt-tracker-initial-balance';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [initialBalance, setInitialBalanceState] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                const withDates = parsed.map((t: Transaction & { timestamp: string }) => ({
                    ...t,
                    timestamp: new Date(t.timestamp)
                }));
                setTransactions(withDates);
            }
            // Load initial balance
            const storedBalance = localStorage.getItem(BALANCE_STORAGE_KEY);
            if (storedBalance) {
                setInitialBalanceState(parseFloat(storedBalance));
            }
        } catch (e) {
            console.error('Failed to load transactions from localStorage:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever transactions change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        }
    }, [transactions, isLoaded]);

    // Save initial balance to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(BALANCE_STORAGE_KEY, initialBalance.toString());
        }
    }, [initialBalance, isLoaded]);

    const setInitialBalance = (amount: number) => {
        setInitialBalanceState(amount);
    };

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: generateId(),
            timestamp: new Date()
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const deleteMultipleTransactions = (ids: string[]) => {
        const idSet = new Set(ids);
        setTransactions(prev => prev.filter(t => !idSet.has(t.id)));
    };

    const clearTransactions = () => {
        setTransactions([]);
        setInitialBalanceState(0);
    };

    const resetInitialBalance = () => {
        setInitialBalanceState(0);
    };

    const getBalance = () => {
        return transactions.reduce((acc, t) => {
            return acc + (t.category === 'income' ? t.amount : -t.amount);
        }, initialBalance);
    };

    const getTotalIncome = () => {
        return transactions
            .filter(t => t.category === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const getTotalExpense = () => {
        return transactions
            .filter(t => t.category === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const getThisWeekTransactions = () => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return transactions.filter(t => new Date(t.timestamp) >= weekStart);
    };

    const getThisMonthTransactions = () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter(t => new Date(t.timestamp) >= monthStart);
    };

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                initialBalance,
                addTransaction,
                deleteTransaction,
                deleteMultipleTransactions,
                clearTransactions,
                setInitialBalance,
                resetInitialBalance,
                getBalance,
                getTotalIncome,
                getTotalExpense,
                getThisWeekTransactions,
                getThisMonthTransactions
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
}
