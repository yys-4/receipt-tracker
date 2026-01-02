'use client';

import { motion } from 'framer-motion';
import { SmartCommandBar } from '@/components/smart-command-bar';
import { TicketStub } from '@/components/ticket-stub';
import { ActivityChart } from '@/components/activity-chart';
import { ReceiptModal } from '@/components/receipt-modal';
import { TransactionTable } from '@/components/transaction-table';
import { useTransactions } from '@/lib/store';
import { formatCurrency, formatCompact } from '@/lib/parser';

export function Dashboard() {
    const {
        transactions,
        getBalance,
        getTotalIncome,
        getTotalExpense,
        getThisWeekTransactions,
        getThisMonthTransactions,
        deleteMultipleTransactions,
        resetInitialBalance,
        clearTransactions
    } = useTransactions();

    const balance = getBalance();
    const totalIncome = getTotalIncome();
    const totalExpense = getTotalExpense();
    const weekTransactions = getThisWeekTransactions();
    const monthTransactions = getThisMonthTransactions();

    const weekExpense = weekTransactions
        .filter(t => t.category === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = monthTransactions
        .filter(t => t.category === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Clear handlers for each card
    const handleClearAll = () => {
        clearTransactions();
    };

    const handleClearWeek = () => {
        deleteMultipleTransactions(weekTransactions.map(t => t.id));
    };

    const handleClearMonth = () => {
        deleteMultipleTransactions(monthTransactions.map(t => t.id));
    };

    const handleClearIncome = () => {
        const incomeIds = transactions.filter(t => t.category === 'income').map(t => t.id);
        deleteMultipleTransactions(incomeIds);
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg-alt)] py-8 px-4">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold tracking-[0.3em] mb-2">
                    RECEIPT
                </h1>
                <p className="text-sm text-[var(--ink-faded)] tracking-widest">
                    ▪▪▪ TRACKER ▪▪▪
                </p>
                <div className="mt-2 text-xs text-[var(--ink-light)]">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            </motion.header>

            {/* Smart Command Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
            >
                <SmartCommandBar />
            </motion.div>

            {/* Ticket Stub Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto mb-10"
            >
                <div className="text-xs uppercase tracking-widest text-[var(--ink-faded)] mb-4 text-center">
                    ── RINGKASAN ──
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Balance */}
                    <ReceiptModal
                        title="SEMUA TRANSAKSI"
                        transactions={transactions}
                        totalLabel="SALDO"
                        totalValue={balance}
                        onClear={handleClearAll}
                        clearLabel="Hapus semua transaksi & reset saldo"
                    >
                        <TicketStub
                            title="Saldo"
                            value={formatCurrency(balance)}
                            subtitle={`${transactions.length} transaksi tercatat`}
                            icon="💰"
                            onClick={() => { }}
                        />
                    </ReceiptModal>

                    {/* This Week */}
                    <ReceiptModal
                        title="MINGGU INI"
                        transactions={weekTransactions}
                        totalLabel="PENGELUARAN MINGGU INI"
                        totalValue={-weekExpense}
                        onClear={handleClearWeek}
                        clearLabel="Hapus transaksi minggu ini"
                    >
                        <TicketStub
                            title="Minggu Ini"
                            value={formatCompact(weekExpense)}
                            subtitle={`${weekTransactions.length} transaksi`}
                            variant="expense"
                            icon="📅"
                            onClick={() => { }}
                        />
                    </ReceiptModal>

                    {/* This Month Expense */}
                    <ReceiptModal
                        title="BULAN INI"
                        transactions={monthTransactions}
                        totalLabel="PENGELUARAN BULAN INI"
                        totalValue={-monthExpense}
                        onClear={handleClearMonth}
                        clearLabel="Hapus transaksi bulan ini"
                    >
                        <TicketStub
                            title="Pengeluaran Bulan Ini"
                            value={formatCompact(monthExpense)}
                            subtitle={`${monthTransactions.filter(t => t.category === 'expense').length} pengeluaran`}
                            variant="expense"
                            icon="📊"
                            onClick={() => { }}
                        />
                    </ReceiptModal>

                    {/* Total Income */}
                    <ReceiptModal
                        title="PEMASUKAN"
                        transactions={transactions.filter(t => t.category === 'income')}
                        totalLabel="TOTAL PEMASUKAN"
                        totalValue={totalIncome}
                        onClear={handleClearIncome}
                        clearLabel="Hapus semua pemasukan"
                    >
                        <TicketStub
                            title="Total Pemasukan"
                            value={formatCompact(totalIncome)}
                            subtitle={`${transactions.filter(t => t.category === 'income').length} pemasukan`}
                            variant="income"
                            icon="💸"
                            onClick={() => { }}
                        />
                    </ReceiptModal>
                </div>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto p-6 border-4 border-[var(--ink)] bg-[var(--paper-bg)] mb-10"
            >
                <ActivityChart />
            </motion.div>

            {/* Transaction Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto mb-10"
            >
                <div className="text-xs uppercase tracking-widest text-[var(--ink-faded)] mb-4 text-center">
                    ── DATA LENGKAP ──
                </div>
                <TransactionTable />
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center text-xs text-[var(--ink-light)]"
            >
                <div className="tracking-widest">
                    ════════════════════════════════════
                </div>
                <div className="my-2">
                    RECEIPT TRACKER v1.1
                </div>
                <div className="tracking-widest">
                    ════════════════════════════════════
                </div>
            </motion.footer>
        </div>
    );
}
