import type { CreateTransactionBody, UpdateTransactionBody, TransactionListResponse, TransactionResponse, TransactionSummaryResponse, TransactionByTypeResponse } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions`

export const transactionApi = {
  list: () => request<TransactionListResponse>(BASE),
  get: (id: string) => request<TransactionResponse>(`${BASE}/${id}`),
  create: (body: CreateTransactionBody) => request<TransactionResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateTransactionBody) => request<TransactionResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
  summary: () => request<TransactionSummaryResponse>(`${BASE}/summary`),
  byType: (type: 'income' | 'expense') => request<TransactionByTypeResponse>(`${BASE}/by-type/${type}`),
  byDateRange: (startDate: string, endDate: string) => request<TransactionListResponse>(`${BASE}/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
}
