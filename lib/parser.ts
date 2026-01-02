import { ParsedInput } from '@/types/transaction';

// Special command types
export type SpecialCommand =
    | { type: 'reset' }
    | { type: 'set_balance'; amount: number };

// Check for special commands
export function parseSpecialCommand(input: string): SpecialCommand | null {
    const trimmed = input.trim().toLowerCase();

    // Reset command
    if (trimmed === 'reset' || trimmed === 'hapus semua' || trimmed === 'clear') {
        return { type: 'reset' };
    }

    // Set initial balance: "saldo awal 1jt", "saldo 500k"
    const balanceMatch = trimmed.match(/^saldo\s*(awal)?\s*(\d+(?:\.\d+)?)\s*(jt|juta|k|rb|ribu)?$/i);
    if (balanceMatch) {
        const num = parseFloat(balanceMatch[2]);
        const suffix = balanceMatch[3]?.toLowerCase();
        let multiplier = 1;
        if (suffix === 'jt' || suffix === 'juta') multiplier = 1000000;
        else if (suffix === 'k' || suffix === 'rb' || suffix === 'ribu') multiplier = 1000;
        return { type: 'set_balance', amount: num * multiplier };
    }

    return null;
}

// Keywords that indicate income
const INCOME_KEYWORDS = [
    'gaji', 'gajian', 'salary', 'upah', 'bonus', 'transfer masuk',
    'pendapatan', 'income', 'terima', 'dapat', 'freelance', 'project',
    'bayaran', 'fee', 'honor', 'honorarium', 'cashback', 'refund'
];

// Keywords that indicate expense (fallback is expense if ambiguous)
const EXPENSE_KEYWORDS = [
    'bayar', 'beli', 'makan', 'minum', 'kopi', 'bensin', 'parkir',
    'belanja', 'tagihan', 'listrik', 'wifi', 'internet', 'pulsa',
    'transport', 'ojol', 'grab', 'gojek', 'taxi', 'laundry', 'rokok',
    'snack', 'jajan', 'dinner', 'lunch', 'breakfast', 'groceries'
];

/**
 * Parse Indonesian currency formats:
 * - "25k" or "25K" -> 25000
 * - "5jt" or "5JT" -> 5000000
 * - "100rb" or "100RB" -> 100000
 * - "50000" -> 50000
 */
function parseAmount(input: string): number | null {
    // Remove spaces and convert to lowercase
    const cleaned = input.toLowerCase().replace(/\s+/g, '').replace(/[.,]/g, '');

    // Match patterns like: 25k, 5jt, 100rb, 50000
    const patterns = [
        { regex: /^(\d+(?:\.\d+)?)\s*jt$/i, multiplier: 1000000 },  // juta
        { regex: /^(\d+(?:\.\d+)?)\s*juta$/i, multiplier: 1000000 },
        { regex: /^(\d+(?:\.\d+)?)\s*k$/i, multiplier: 1000 },       // ribu (k)
        { regex: /^(\d+(?:\.\d+)?)\s*rb$/i, multiplier: 1000 },      // ribu
        { regex: /^(\d+(?:\.\d+)?)\s*ribu$/i, multiplier: 1000 },
        { regex: /^(\d+)$/i, multiplier: 1 },                        // plain number
    ];

    for (const { regex, multiplier } of patterns) {
        const match = cleaned.match(regex);
        if (match) {
            return parseFloat(match[1]) * multiplier;
        }
    }

    return null;
}

/**
 * Detect category based on keywords in description
 */
function detectCategory(description: string): 'income' | 'expense' {
    const lower = description.toLowerCase();

    // Check for income keywords first
    for (const keyword of INCOME_KEYWORDS) {
        if (lower.includes(keyword)) {
            return 'income';
        }
    }

    // Default to expense (most transactions are expenses)
    return 'expense';
}

/**
 * Parse loose input formats:
 * - "kopi 25k" -> { amount: 25000, description: "kopi", category: "expense" }
 * - "gajian 5jt" -> { amount: 5000000, description: "gajian", category: "income" }
 * - "50000 makan" -> { amount: 50000, description: "makan", category: "expense" }
 */
export function parseTransaction(input: string): ParsedInput | null {
    if (!input.trim()) return null;

    const trimmed = input.trim();
    const words = trimmed.split(/\s+/);

    if (words.length === 0) return null;

    let amount: number | null = null;
    let descriptionParts: string[] = [];

    // Try to find amount in each word
    for (const word of words) {
        const parsedAmount = parseAmount(word);
        if (parsedAmount !== null && amount === null) {
            amount = parsedAmount;
        } else {
            descriptionParts.push(word);
        }
    }

    // If no amount found, return null
    if (amount === null) return null;

    // If no description, use a default
    const description = descriptionParts.join(' ') || 'Transaksi';

    // Detect category based on description
    const category = detectCategory(description);

    return {
        amount,
        description,
        category
    };
}

/**
 * Format currency in Indonesian Rupiah style
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format compact currency (25k, 5jt)
 */
export function formatCompact(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}jt`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
    }
    return amount.toString();
}
