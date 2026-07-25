import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionApi } from '@/apis/transaction-api'
import type { CreateTransactionBody, UpdateTransactionBody, Transaction, TransactionSummary } from '@/models'

export const useTransactionStore = defineStore('TransactionStore', () => {
  const transactions = ref<Transaction[]>([])
  const summary = ref<TransactionSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTransactions() {
    isLoading.value = true
    error.value = null
    try {
      const res = await transactionApi.list()
      transactions.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchSummary() {
    error.value = null
    try {
      const res = await transactionApi.summary()
      summary.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
  }

  async function createTransaction(body: CreateTransactionBody) {
    const res = await transactionApi.create(body)
    transactions.value.unshift(res.data)
    return res.data
  }

  async function updateTransaction(id: string, body: UpdateTransactionBody) {
    const res = await transactionApi.update(id, body)
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = res.data
    return res.data
  }

  async function deleteTransaction(id: string) {
    await transactionApi.remove(id)
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  async function fetchByType(type: 'income' | 'expense') {
    isLoading.value = true
    error.value = null
    try {
      const res = await transactionApi.byType(type)
      return res.data
    }
    catch (e: any) {
      error.value = e.message
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchByDateRange(startDate: string, endDate: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await transactionApi.byDateRange(startDate, endDate)
      transactions.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    transactions,
    summary,
    isLoading,
    error,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchByType,
    fetchByDateRange,
  }
})
