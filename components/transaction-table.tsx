'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/lib/store';
import { formatCurrency } from '@/lib/parser';
import { Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';

export function TransactionTable() {
    const { transactions, deleteTransaction } = useTransactions();
    const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'category'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.category === filter;
    });

    // Sort transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'timestamp') {
            comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } else if (sortField === 'amount') {
            comparison = a.amount - b.amount;
        } else if (sortField === 'category') {
            comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = (field: 'timestamp' | 'amount' | 'category') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }: { field: 'timestamp' | 'amount' | 'category' }) => {
        if (sortField !== field) return <span className="opacity-30">↕</span>;
        return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
    };

    if (transactions.length === 0) {
        return (
            <div className="border-4 border-[var(--ink)] bg-[var(--paper-bg)] p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <div className="text-sm text-[var(--ink-faded)]">BELUM ADA DATA</div>
                <div className="text-xs text-[var(--ink-light)] mt-2">
                    Gunakan command bar untuk menambah transaksi
                </div>
            </div>
        );
    }

    return (
        <div className="border-4 border-[var(--ink)] bg-[var(--paper-bg)]">
            {/* Header */}
            <div className="border-b-4 border-[var(--ink)] p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold tracking-widest">
                        📋 DATA TRANSAKSI
                    </h2>
                    <div className="text-xs text-[var(--ink-faded)]">
                        {sortedTransactions.length} dari {transactions.length} item
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {(['all', 'expense', 'income'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'px-3 py-1 text-xs font-bold tracking-wide border-2 border-[var(--ink)] transition-colors',
                                filter === f
                                    ? 'bg-[var(--ink)] text-[var(--paper-bg)]'
                                    : 'bg-transparent hover:bg-[var(--paper-bg-alt)]'
                            )}
                        >
                            {f === 'all' ? 'SEMUA' : f === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-dashed border-[var(--ink)]">
                            <th
                                className="text-left p-3 font-bold text-xs tracking-wider cursor-pointer hover:bg-[var(--paper-bg-alt)]"
                                onClick={() => handleSort('timestamp')}
                            >
                                TANGGAL <SortIcon field="timestamp" />
                            </th>
                            <th className="text-left p-3 font-bold text-xs tracking-wider">
                                DESKRIPSI
                            </th>
                            <th
                                className="text-left p-3 font-bold text-xs tracking-wider cursor-pointer hover:bg-[var(--paper-bg-alt)]"
                                onClick={() => handleSort('category')}
                            >
                                TIPE <SortIcon field="category" />
                            </th>
                            <th
                                className="text-right p-3 font-bold text-xs tracking-wider cursor-pointer hover:bg-[var(--paper-bg-alt)]"
                                onClick={() => handleSort('amount')}
                            >
                                JUMLAH <SortIcon field="amount" />
                            </th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {sortedTransactions.map((transaction, index) => (
                                <TransactionTableRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    index={index}
                                    onDelete={() => deleteTransaction(transaction.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="border-t-4 border-[var(--ink)] p-4 bg-[var(--paper-bg-alt)]">
                <div className="flex justify-between text-xs">
                    <span className="tracking-wider">TOTAL {filter === 'all' ? '' : filter === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}</span>
                    <span className="font-bold">
                        {formatCurrency(
                            sortedTransactions.reduce((sum, t) =>
                                sum + (filter === 'all'
                                    ? (t.category === 'income' ? t.amount : -t.amount)
                                    : t.amount
                                ), 0)
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface TransactionTableRowProps {
    transaction: Transaction;
    index: number;
    onDelete: () => void;
}

function TransactionTableRow({ transaction, index, onDelete }: TransactionTableRowProps) {
    const date = new Date(transaction.timestamp);
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
    });
    const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const isIncome = transaction.category === 'income';

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ delay: index * 0.02 }}
            className="border-b border-dashed border-[var(--ink-light)] hover:bg-[var(--paper-bg-alt)] group"
        >
            <td className="p-3">
                <div className="text-xs">{formattedDate}</div>
                <div className="text-xs text-[var(--ink-faded)]">{formattedTime}</div>
            </td>
            <td className="p-3 font-medium">
                {transaction.description}
            </td>
            <td className="p-3">
                <span className={cn(
                    'px-2 py-1 text-xs font-bold',
                    isIncome
                        ? 'bg-[var(--ink)] text-[var(--paper-bg)]'
                        : 'border border-[var(--ink)]'
                )}>
                    {isIncome ? '+ MASUK' : '- KELUAR'}
                </span>
            </td>
            <td className={cn(
                'p-3 text-right font-bold',
                isIncome ? 'text-[var(--ink)]' : 'text-[var(--ink)]'
            )}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </td>
            <td className="p-3 text-center">
                <motion.button
                    onClick={onDelete}
                    className="opacity-50 hover:opacity-100 px-2 py-1 text-xs hover:bg-red-700 hover:text-white transition-all"
                    whileTap={{ scale: 0.9 }}
                    title="Hapus"
                >
                    ✕
                </motion.button>
            </td>
        </motion.tr>
    );
}
