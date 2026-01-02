'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseTransaction, parseSpecialCommand, formatCurrency } from '@/lib/parser';
import { useTransactions } from '@/lib/store';
import { cn } from '@/lib/utils';

// Sound effect for thermal printer
const playPrintSound = () => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create a series of short bursts to simulate thermal printer
    const playBurst = (time: number, frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'square';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.05, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

        oscillator.start(time);
        oscillator.stop(time + duration);
    };

    const now = audioContext.currentTime;
    // Create rapid bursts simulating print head
    for (let i = 0; i < 8; i++) {
        playBurst(now + i * 0.03, 800 + Math.random() * 400, 0.02);
    }
};

interface SmartCommandBarProps {
    className?: string;
}

export function SmartCommandBar({ className }: SmartCommandBarProps) {
    const [input, setInput] = useState('');
    const [lastParsed, setLastParsed] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { addTransaction, clearTransactions, setInitialBalance } = useTransactions();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Check for special commands first
        const specialCommand = parseSpecialCommand(input);
        if (specialCommand) {
            if (specialCommand.type === 'reset') {
                setShowResetConfirm(true);
                return;
            }
            if (specialCommand.type === 'set_balance') {
                try {
                    playPrintSound();
                } catch (e) {
                    console.log('Audio not available:', e);
                }
                setInitialBalance(specialCommand.amount);
                setLastParsed(`🏦 SALDO AWAL: ${formatCurrency(specialCommand.amount)}`);
                setIsSubmitting(true);
                setTimeout(() => {
                    setInput('');
                    setIsSubmitting(false);
                }, 150);
                setTimeout(() => setLastParsed(null), 3000);
                return;
            }
        }

        const parsed = parseTransaction(input);

        if (parsed) {
            // Play thermal print sound
            try {
                playPrintSound();
            } catch (e) {
                // Audio might not be available
                console.log('Audio not available:', e);
            }

            // Add transaction
            addTransaction({
                amount: parsed.amount,
                description: parsed.description,
                category: parsed.category
            });

            // Show feedback
            setLastParsed(
                `${parsed.category === 'income' ? '+' : '-'}${formatCurrency(parsed.amount)} • ${parsed.description}`
            );

            // Trigger submit animation
            setIsSubmitting(true);

            // Clear input after animation
            setTimeout(() => {
                setInput('');
                setIsSubmitting(false);
            }, 150);

            // Clear feedback after a delay
            setTimeout(() => {
                setLastParsed(null);
            }, 3000);
        }
    }, [input, addTransaction, setInitialBalance]);

    const handleReset = useCallback(() => {
        try {
            playPrintSound();
        } catch (e) {
            console.log('Audio not available:', e);
        }
        clearTransactions();
        setShowResetConfirm(false);
        setInput('');
        setLastParsed('🗑️ SEMUA DATA TELAH DIHAPUS');
        setTimeout(() => setLastParsed(null), 3000);
    }, [clearTransactions]);

    return (
        <div className={cn('w-full max-w-2xl mx-auto', className)}>
            {/* Main Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="border-2 border-[var(--ink)] bg-[var(--paper-bg)] p-1">
                    <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--ink)]">
                        <span className="text-lg">▸</span>
                        <motion.input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="ketik: kopi 25k, gajian 5jt, 50000 makan..."
                            className={cn(
                                'flex-1 bg-transparent outline-none text-lg placeholder:text-[var(--ink-light)]',
                                'tracking-wide'
                            )}
                            animate={isSubmitting ? { opacity: [1, 0, 1] } : undefined}
                        />
                        <motion.button
                            type="submit"
                            className="px-4 py-1 bg-[var(--ink)] text-[var(--paper-bg)] text-sm font-bold tracking-widest"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            CATAT
                        </motion.button>
                    </div>
                </div>
            </form>

            {/* Last Parsed Feedback */}
            <AnimatePresence>
                {lastParsed && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mt-2 text-center"
                    >
                        <div className="inline-block px-4 py-2 bg-[var(--ink)] text-[var(--paper-bg)] text-sm tracking-wide">
                            ✓ TERCATAT: {lastParsed}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setShowResetConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--paper-bg)] border-4 border-[var(--ink)] p-6 max-w-sm mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-2">⚠️</div>
                                <h3 className="text-lg font-bold tracking-wide">RESET SEMUA DATA?</h3>
                                <p className="text-sm text-[var(--ink-faded)] mt-2">
                                    Semua transaksi dan saldo awal akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <motion.button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 py-2 px-4 border-2 border-[var(--ink)] text-sm font-bold tracking-widest"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    BATAL
                                </motion.button>
                                <motion.button
                                    onClick={handleReset}
                                    className="flex-1 py-2 px-4 bg-[var(--ink)] text-[var(--paper-bg)] text-sm font-bold tracking-widest"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    YA, RESET
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Helper Text */}
            <div className="mt-3 text-center text-xs text-[var(--ink-faded)] space-y-1">
                <div>
                    <span className="tracking-wide">TRANSAKSI:</span>
                    <span className="ml-2">makan 25k | 5jt gajian | 100rb bensin</span>
                </div>
                <div>
                    <span className="tracking-wide">PERINTAH:</span>
                    <span className="ml-2">saldo 1jt | saldo awal 500k | reset</span>
                </div>
            </div>
        </div>
    );
}
