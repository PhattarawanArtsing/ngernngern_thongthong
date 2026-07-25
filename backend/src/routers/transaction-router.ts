import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createTransactionSchema,
  errorResponseSchema,
  idParamSchema,
  transactionListResponseSchema,
  transactionResponseSchema,
  transactionSummarySchema,
  typeParamSchema,
  updateTransactionSchema,
} from '../schemas/transaction-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createTransactionRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'List all transactions',
      responses: {
        200: { description: 'All transactions', content: jsonContent(transactionListResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.list(c)
  )

  router.get(
    '/summary',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get transaction summary',
      responses: {
        200: { description: 'Summary', content: jsonContent(transactionSummarySchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.getSummary(c)
  )

  router.get(
    '/type/:type',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get transactions by type',
      responses: {
        200: { description: 'Transactions by type', content: jsonContent(transactionListResponseSchema) },
        400: { description: 'Invalid type', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', typeParamSchema),
    (c) => c.get('container').transactionHandler.getByType(c)
  )

  router.get(
    '/date-range',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get transactions by date range',
      responses: {
        200: { description: 'Transactions in range', content: jsonContent(transactionListResponseSchema) },
        400: { description: 'Invalid date range', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.getByDateRange(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Create a transaction',
      responses: {
        201: { description: 'Transaction created', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createTransactionSchema),
    (c) => c.get('container').transactionHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get a transaction by id',
      responses: {
        200: { description: 'Transaction found', content: jsonContent(transactionResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Update a transaction',
      responses: {
        200: { description: 'Transaction updated', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateTransactionSchema),
    (c) => c.get('container').transactionHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      responses: {
        204: { description: 'Transaction deleted' },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.delete(c)
  )

  return router
}
