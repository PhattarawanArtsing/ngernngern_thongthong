import type { CreateTransactionInput, Transaction, TransactionSummary, UpdateTransactionInput } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    if (type !== 'income' && type !== 'expense') {
      throw new ValidationError('type must be income or expense')
    }
    return this.transactionRepository.findByType(type)
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    this.validateDate(startDate)
    this.validateDate(endDate)
    if (startDate > endDate) throw new ValidationError('startDate must be before or equal to endDate')
    return this.transactionRepository.findByDateRange(startDate, endDate)
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validateTransaction(input)
    return this.transactionRepository.create(input)
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.type !== undefined && input.type !== 'income' && input.type !== 'expense') {
      throw new ValidationError('type must be income or expense')
    }
    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError('amount must be greater than 0')
    }

    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  async getSummary(): Promise<TransactionSummary> {
    return this.transactionRepository.getSummary()
  }

  private validateTransaction(input: CreateTransactionInput): void {
    if (input.type !== 'income' && input.type !== 'expense') {
      throw new ValidationError('type must be income or expense')
    }
    if (input.amount <= 0) throw new ValidationError('amount must be greater than 0')
    if (!input.description?.trim()) throw new ValidationError('description is required')
    if (!input.category?.trim()) throw new ValidationError('category is required')
    if (input.date) this.validateDate(input.date)
  }

  private validateDate(date: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError('date must be in YYYY-MM-DD format')
    }
  }
}
