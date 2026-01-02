export interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: 'income' | 'expense';
    timestamp: Date;
}

export interface ParsedInput {
    amount: number;
    description: string;
    category: 'income' | 'expense';
}
