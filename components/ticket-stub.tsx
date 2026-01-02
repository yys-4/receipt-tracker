'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TicketStubProps {
    title: string;
    value: string;
    subtitle?: string;
    onClick?: () => void;
    variant?: 'default' | 'income' | 'expense';
    className?: string;
    icon?: ReactNode;
}

export function TicketStub({
    title,
    value,
    subtitle,
    onClick,
    variant = 'default',
    className,
    icon
}: TicketStubProps) {
    const isClickable = !!onClick;

    return (
        <motion.div
            whileHover={isClickable ? { scale: 1.02, x: 2 } : undefined}
            whileTap={isClickable ? { scale: 0.98 } : undefined}
            className={cn(
                'ticket-stub p-4 pr-8 cursor-default transition-shadow',
                isClickable && 'cursor-pointer hover:shadow-[4px_4px_0_var(--ink)]',
                className
            )}
            onClick={onClick}
        >
            {/* Ticket Title */}
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-lg">{icon}</span>}
                <span className="text-xs uppercase tracking-widest text-[var(--ink-faded)]">
                    {title}
                </span>
            </div>

            {/* Value */}
            <div className={cn(
                'text-2xl font-bold tracking-tight',
                variant === 'income' && 'text-[var(--ink)]',
                variant === 'expense' && 'text-[var(--ink)]'
            )}>
                {variant === 'income' && '+ '}
                {variant === 'expense' && '- '}
                {value}
            </div>

            {/* Subtitle */}
            {subtitle && (
                <div className="text-xs text-[var(--ink-faded)] mt-1">
                    {subtitle}
                </div>
            )}

            {/* Perforation Line */}
            <div className="absolute right-6 top-0 bottom-0 flex items-center">
                <div className="w-px h-full border-l-2 border-dashed border-[var(--ink-faded)]" />
            </div>
        </motion.div>
    );
}

// Summary row component for inside tickets
interface TicketRowProps {
    label: string;
    value: string;
    className?: string;
}

export function TicketRow({ label, value, className }: TicketRowProps) {
    return (
        <div className={cn('flex justify-between items-center py-1', className)}>
            <span className="text-xs uppercase tracking-wide">{label}</span>
            <span className="text-sm font-bold">{value}</span>
        </div>
    );
}
