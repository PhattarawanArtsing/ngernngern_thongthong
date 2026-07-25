import type { CreateTransactionInput, Transaction, TransactionSummary, UpdateTransactionInput } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

export class MemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = []

  async findAll(): Promise<Transaction[]> {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id === id) ?? null
  }

  async findByType(type: string): Promise<Transaction[]> {
    return this.transactions.filter((t) => t.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.transactions
      .filter((t) => t.date >= startDate && t.date <= endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const now = new Date().toISOString()
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: input.amount,
      description: input.description,
      category: input.category,
      date: input.date ?? now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    }
    this.transactions.push(transaction)
    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const idx = this.transactions.findIndex((t) => t.id === id)
    if (idx === -1) return null

    const existing = this.transactions[idx]
    const updated: Transaction = {
      ...existing,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      date: input.date ?? existing.date,
      updatedAt: new Date().toISOString(),
    }
    this.transactions[idx] = updated
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.transactions.findIndex((t) => t.id === id)
    if (idx === -1) return false
    this.transactions.splice(idx, 1)
    return true
  }

  async getSummary(): Promise<TransactionSummary> {
    const totalIncome = this.transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = this.transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: this.transactions.length,
    }
  }
}
