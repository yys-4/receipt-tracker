'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ActivityChartProps {
    className?: string;
}

export function ActivityChart({ className }: ActivityChartProps) {
    const { transactions } = useTransactions();

    // Calculate daily totals for last 7 days
    const chartData = useMemo(() => {
        const days: { date: Date; income: number; expense: number; label: string }[] = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayTransactions = transactions.filter(t => {
                const timestamp = new Date(t.timestamp);
                return timestamp >= date && timestamp < nextDate;
            });

            const income = dayTransactions
                .filter(t => t.category === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = dayTransactions
                .filter(t => t.category === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            days.push({
                date,
                income,
                expense,
                label: date.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase()
            });
        }

        return days;
    }, [transactions]);

    // Find max value for scaling
    const maxValue = Math.max(
        ...chartData.map(d => Math.max(d.income, d.expense)),
        100000 // Minimum scale
    );

    return (
        <div className={cn('w-full', className)}>
            {/* Chart Title */}
            <div className="text-xs uppercase tracking-widest text-[var(--ink-faded)] mb-4 text-center">
                ▪ AKTIVITAS 7 HARI TERAKHIR ▪
            </div>

            {/* Dot Matrix Chart */}
            <div className="flex items-end justify-between gap-2 h-32 px-4">
                {chartData.map((day, i) => {
                    const expenseHeight = maxValue > 0 ? (day.expense / maxValue) * 100 : 0;
                    const hasData = day.expense > 0 || day.income > 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            {/* Bar */}
                            <div className="w-full h-24 flex flex-col justify-end items-center relative">
                                {hasData ? (
                                    <div
                                        className="w-full max-w-8 bg-[var(--ink)] transition-all duration-300"
                                        style={{ height: `${Math.max(expenseHeight, 8)}%` }}
                                    >
                                        {/* Dot matrix overlay */}
                                        <div className="absolute inset-0 opacity-20 dot-matrix" />
                                    </div>
                                ) : (
                                    <div className="w-full max-w-8 h-2 border-2 border-dashed border-[var(--ink-light)]" />
                                )}
                            </div>

                            {/* Day Label */}
                            <div className="text-xs font-bold tracking-wider">
                                {day.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6 text-xs text-[var(--ink-faded)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--ink)]" />
                    <span>PENGELUARAN</span>
                </div>
            </div>
        </div>
    );
}
