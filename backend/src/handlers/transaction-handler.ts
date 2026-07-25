import type { Context } from 'hono'
import type { CreateTransactionInput, UpdateTransactionInput } from '../domain/entities/transaction'
import { ValidationError } from '../domain/errors'
import type { TransactionService } from '../services/transaction-service'

export class TransactionHandler {
  constructor(private readonly transactionService: TransactionService) {}

  list = async (c: Context) => {
    const transactions = await this.transactionService.listTransactions()
    return c.json({ data: transactions })
  }

  get = async (c: Context) => {
    const transaction = await this.transactionService.getTransaction(this.param(c, 'id'))
    return c.json({ data: transaction })
  }

  getByType = async (c: Context) => {
    const type = this.param(c, 'type')
    const transactions = await this.transactionService.getTransactionsByType(type)
    return c.json({ data: transactions })
  }

  getByDateRange = async (c: Context) => {
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    if (!startDate || !endDate) throw new ValidationError('startDate and endDate query params are required')
    const transactions = await this.transactionService.getTransactionsByDateRange(startDate, endDate)
    return c.json({ data: transactions })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateTransactionInput>(c)
    const transaction = await this.transactionService.createTransaction(body)
    return c.json({ data: transaction }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateTransactionInput>(c)
    const transaction = await this.transactionService.updateTransaction(this.param(c, 'id'), body)
    return c.json({ data: transaction })
  }

  delete = async (c: Context) => {
    await this.transactionService.deleteTransaction(this.param(c, 'id'))
    return c.body(null, 204)
  }

  getSummary = async (c: Context) => {
    const summary = await this.transactionService.getSummary()
    return c.json({ data: summary })
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
