'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ReceiptContainerProps {
    children: ReactNode;
    className?: string;
    showHeader?: boolean;
    title?: string;
    timestamp?: Date;
}

export const ReceiptContainer = forwardRef<HTMLDivElement, ReceiptContainerProps>(
    ({ children, className, showHeader = true, title, timestamp }, ref) => {
        const now = timestamp || new Date();
        const formattedDate = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-[var(--paper-bg)] text-[var(--ink)] p-6 w-full max-w-md mx-auto torn-edges',
                    className
                )}
            >
                {showHeader && (
                    <div className="text-center mb-4">
                        <div className="text-2xl font-bold tracking-widest">
                            ════════════════════
                        </div>
                        <h1 className="text-xl font-bold my-2 tracking-wide">
                            {title || 'RECEIPT TRACKER'}
                        </h1>
                        <div className="text-xs text-[var(--ink-faded)]">
                            {formattedDate}
                        </div>
                        <div className="text-xs text-[var(--ink-faded)]">
                            {formattedTime}
                        </div>
                        <div className="text-2xl font-bold tracking-widest">
                            ════════════════════
                        </div>
                    </div>
                )}

                {children}

                <div className="mt-6 text-center">
                    <div className="receipt-divider" />
                    <div className="text-xs text-[var(--ink-faded)] mt-2">
                        TERIMA KASIH
                    </div>
                    <div className="text-xs text-[var(--ink-light)]">
                        ** SIMPAN STRUK INI **
                    </div>
                </div>
            </div>
        );
    }
);

ReceiptContainer.displayName = 'ReceiptContainer';
