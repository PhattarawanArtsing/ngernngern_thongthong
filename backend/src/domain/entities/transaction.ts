export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  description: string
  category: string
  date?: string
}

export interface UpdateTransactionInput {
  type?: TransactionType
  amount?: number
  description?: string
  category?: string
  date?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  count: number
}
