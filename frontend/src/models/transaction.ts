export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionBody {
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
}

export interface UpdateTransactionBody {
  amount?: number
  type?: 'income' | 'expense'
  category?: string
  description?: string
  date?: string
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  count: number
}

export interface TransactionSummaryResponse {
  data: TransactionSummary
}

export interface TransactionByTypeResponse {
  data: {
    type: 'income' | 'expense'
    total: number
    count: number
    transactions: Transaction[]
  }
}

export interface TransactionByDateRangeQuery {
  startDate: string
  endDate: string
}
