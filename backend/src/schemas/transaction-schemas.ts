import z from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])

export const transactionSchema = z.object({
  id: z.uuid(),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const typeParamSchema = z.object({
  type: z.enum(['income', 'expense']),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })
export const transactionSummarySchema = z.object({
  data: z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    balance: z.number(),
    count: z.number(),
  }),
})

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
