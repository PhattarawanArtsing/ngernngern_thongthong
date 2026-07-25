<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, UpdateTransactionBody, Transaction } from '@/models'

const transactionStore = useTransactionStore()
const { transactions, summary, isLoading, error } = storeToRefs(transactionStore)

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Type', key: 'type' },
  { title: 'Category', key: 'category' },
  { title: 'Description', key: 'description' },
  { title: 'Amount', key: 'amount', align: 'end' as const },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody & UpdateTransactionBody>({
  amount: 0,
  type: 'expense',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
})

const typeOptions = [
  { title: 'Income', value: 'income' },
  { title: 'Expense', value: 'expense' },
]

function openCreate() {
  editingTransaction.value = null
  form.value = {
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  }
  dialog.value = true
}

function openEdit(transaction: Transaction) {
  editingTransaction.value = transaction
  form.value = {
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date.slice(0, 10),
  }
  dialog.value = true
}

function openDelete(transaction: Transaction) {
  deletingTransaction.value = transaction
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    dialog.value = false
    await transactionStore.fetchSummary()
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
    await transactionStore.fetchSummary()
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function typeColor(type: string) {
  return type === 'income' ? 'success' : 'error'
}

function typeLabel(type: string) {
  return type === 'income' ? 'Income' : 'Expense'
}

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <VRow class="mb-4">
      <VCol cols="12" md="4">
        <VCard color="success" variant="tonal">
          <VCardTitle class="text-success">
            <VIcon icon="ri-arrow-up-line" class="me-2" />
            Total Income
          </VCardTitle>
          <VCardText class="text-h5 font-weight-bold text-success">
            {{ formatCurrency(summary?.totalIncome ?? 0) }}
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard color="error" variant="tonal">
          <VCardTitle class="text-error">
            <VIcon icon="ri-arrow-down-line" class="me-2" />
            Total Expense
          </VCardTitle>
          <VCardText class="text-h5 font-weight-bold text-error">
            {{ formatCurrency(summary?.totalExpense ?? 0) }}
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard color="primary" variant="tonal">
          <VCardTitle class="text-primary">
            <VIcon icon="ri-wallet-line" class="me-2" />
            Balance
          </VCardTitle>
          <VCardText class="text-h5 font-weight-bold text-primary">
            {{ formatCurrency(summary?.balance ?? 0) }}
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Transactions</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          Add Transaction
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="transactions"
        :loading="isLoading"
        hover
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.type="{ item }">
          <VChip :color="typeColor(item.type)" size="small">
            {{ typeLabel(item.type) }}
          </VChip>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">Edit</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">Delete</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No transactions yet. Click "Add Transaction" to create one.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="560" persistent>
      <VCard :title="editingTransaction ? 'Edit Transaction' : 'Add Transaction'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VSelect
              v-model="form.type"
              :items="typeOptions"
              item-title="title"
              item-value="value"
              label="Type"
              prepend-inner-icon="ri-exchange-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model.number="form.amount"
              label="Amount"
              type="number"
              prepend-inner-icon="ri-money-baht-circle-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.category"
              label="Category"
              prepend-inner-icon="ri-folder-line"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.description"
              label="Description"
              prepend-inner-icon="ri-file-text-line"
              class="mb-4"
            />
            <VTextField
              v-model="form.date"
              label="Date"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Transaction">
        <VCardText>
          Are you sure you want to delete this <strong>{{ deletingTransaction?.type }}</strong> transaction of <strong>{{ formatCurrency(deletingTransaction?.amount ?? 0) }}</strong>? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
