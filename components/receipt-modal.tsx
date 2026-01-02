'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ReceiptContainer } from './receipt-container';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/parser';
import { exportReceiptAsImage } from '@/lib/export';
import { useTransactions } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ReceiptModalProps {
    title: string;
    transactions: Transaction[];
    children: React.ReactNode;
    totalLabel?: string;
    totalValue?: number;
    onClear?: () => void;
    clearLabel?: string;
}

export function ReceiptModal({
    title,
    transactions,
    children,
    totalLabel = 'TOTAL',
    totalValue,
    onClear,
    clearLabel = 'HAPUS SEMUA'
}: ReceiptModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const { deleteTransaction } = useTransactions();

    const handleExport = async () => {
        if (!receiptRef.current) return;

        setIsExporting(true);
        try {
            await exportReceiptAsImage(receiptRef.current, `receipt-${title.toLowerCase().replace(/\s+/g, '-')}`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleClear = () => {
        if (onClear) {
            onClear();
            setShowClearConfirm(false);
        }
    };

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = new Date(transaction.timestamp).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const calculatedTotal = totalValue ?? transactions.reduce((sum, t) => {
        return sum + (t.category === 'income' ? t.amount : -t.amount);
    }, 0);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg bg-[var(--paper-bg-alt)] border-l-4 border-[var(--ink)] p-0 overflow-y-auto"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>

                <div className="p-6">
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-6">
                        <motion.button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={cn(
                                'flex-1 py-3 px-4 border-4 border-[var(--ink)] bg-[var(--paper-bg)]',
                                'text-sm font-bold tracking-widest',
                                'hover:bg-[var(--ink)] hover:text-[var(--paper-bg)] transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isExporting ? '⏳...' : '🖨️ PRINT'}
                        </motion.button>
                        {onClear && transactions.length > 0 && (
                            <motion.button
                                onClick={() => setShowClearConfirm(true)}
                                className={cn(
                                    'py-3 px-4 border-4 border-[var(--ink)] bg-[var(--paper-bg)]',
                                    'text-sm font-bold tracking-widest',
                                    'hover:bg-red-700 hover:text-[var(--paper-bg)] hover:border-red-700 transition-colors'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                🗑️ RESET
                            </motion.button>
                        )}
                    </div>

                    {/* Clear Confirmation */}
                    <AnimatePresence>
                        {showClearConfirm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-4 border-2 border-dashed border-[var(--ink)]"
                            >
                                <p className="text-sm text-center mb-3">
                                    ⚠️ {clearLabel}?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowClearConfirm(false)}
                                        className="flex-1 py-2 px-3 border-2 border-[var(--ink)] text-xs font-bold"
                                    >
                                        BATAL
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="flex-1 py-2 px-3 bg-red-700 text-white text-xs font-bold"
                                    >
                                        YA, HAPUS
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Receipt Content */}
                    <ReceiptContainer ref={receiptRef} title={title}>
                        {/* Transaction List */}
                        {Object.entries(groupedTransactions).length > 0 ? (
                            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                                <div key={date} className="mb-4">
                                    {/* Date Header */}
                                    <div className="text-xs text-[var(--ink-faded)] mb-2 tracking-wide">
                                        ── {date.toUpperCase()} ──
                                    </div>

                                    {/* Transactions */}
                                    {dayTransactions.map((transaction) => (
                                        <TransactionRow
                                            key={transaction.id}
                                            transaction={transaction}
                                            onDelete={() => deleteTransaction(transaction.id)}
                                        />
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-[var(--ink-faded)]">
                                <div className="text-2xl mb-2">📭</div>
                                <div className="text-sm">BELUM ADA TRANSAKSI</div>
                            </div>
                        )}

                        {/* Total */}
                        {transactions.length > 0 && (
                            <>
                                <div className="receipt-divider" />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-bold tracking-widest">{totalLabel}</span>
                                    <span className={cn(
                                        'text-xl font-bold',
                                        calculatedTotal >= 0 ? 'text-[var(--ink)]' : 'text-[var(--ink)]'
                                    )}>
                                        {calculatedTotal >= 0 ? '+' : ''}{formatCurrency(calculatedTotal)}
                                    </span>
                                </div>
                            </>
                        )}
                    </ReceiptContainer>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface TransactionRowProps {
    transaction: Transaction;
    onDelete: () => void;
}

function TransactionRow({ transaction, onDelete }: TransactionRowProps) {
    const time = new Date(transaction.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const isIncome = transaction.category === 'income';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, height: 0 }}
            className="flex justify-between items-center py-2 border-b border-dashed border-[var(--ink-light)] last:border-0"
        >
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                    {transaction.description}
                </div>
                <div className="text-xs text-[var(--ink-faded)]">
                    {time}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className={cn(
                    'text-sm font-bold whitespace-nowrap',
                    isIncome ? 'text-[var(--ink)]' : 'text-[var(--ink)]'
                )}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <motion.button
                    onClick={onDelete}
                    className="text-xs px-2 py-1 border border-[var(--ink-faded)] text-[var(--ink-faded)] hover:bg-[var(--ink)] hover:text-[var(--paper-bg)] hover:border-[var(--ink)] transition-colors"
                    whileTap={{ scale: 0.9 }}
                    title="Hapus transaksi"
                >
                    ✕
                </motion.button>
            </div>
        </motion.div>
    );
}

