import type { CreateTransactionInput, Transaction, TransactionSummary, UpdateTransactionInput } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TransactionRow {
  id: string
  type: string
  amount: number
  description: string
  category: string
  date: string
  created_at: string
  updated_at: string
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as 'income' | 'expense',
    amount: row.amount,
    description: row.description,
    category: row.category,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, description, category, date, created_at, updated_at FROM transactions ORDER BY date DESC, created_at DESC')
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db
      .prepare('SELECT id, type, amount, description, category, date, created_at, updated_at FROM transactions WHERE id = ?')
      .bind(id)
      .first<TransactionRow>()
    return row ? toTransaction(row) : null
  }

  async findByType(type: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, description, category, date, created_at, updated_at FROM transactions WHERE type = ? ORDER BY date DESC')
      .bind(type)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, description, category, date, created_at, updated_at FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC')
      .bind(startDate, endDate)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const date = (input.date ?? now.split('T')[0] ?? "")
    await this.db
      .prepare('INSERT INTO transactions (id, type, amount, description, category, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.type, input.amount, input.description, input.category, date, now, now)
      .run()
    return { id, type: input.type, amount: input.amount, description: input.description, category: input.category, date, createdAt: now, updatedAt: now }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const type = input.type ?? existing.type
    const amount = input.amount ?? existing.amount
    const description = input.description ?? existing.description
    const category = input.category ?? existing.category
    const date = input.date ?? existing.date
    const updatedAt = new Date().toISOString()

    await this.db
      .prepare('UPDATE transactions SET type = ?, amount = ?, description = ?, category = ?, date = ?, updated_at = ? WHERE id = ?')
      .bind(type, amount, description, category, date, updatedAt, id)
      .run()
    return { ...existing, type, amount, description, category, date, updatedAt }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }

  async getSummary(): Promise<TransactionSummary> {
    const { results } = await this.db
      .prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(*) as count
        FROM transactions
      `)
      .all<{ total_income: number | null; total_expense: number | null; count: number }>()

    const row = results[0] ?? { total_income: 0, total_expense: 0, count: 0 }
    const totalIncome = row.total_income ?? 0
    const totalExpense = row.total_expense ?? 0

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: row.count,
    }
  }
}
