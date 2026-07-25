<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'

const transactionStore = useTransactionStore()
const { transactions, summary, isLoading, error } = storeToRefs(transactionStore)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

const recentTransactions = computed(() => {
  return [...transactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

const incomePercentage = computed(() => {
  const total = (summary.value?.totalIncome ?? 0) + (summary.value?.totalExpense ?? 0)
  if (total === 0) return 0
  return Math.round(((summary.value?.totalIncome ?? 0) / total) * 100)
})

const expensePercentage = computed(() => {
  const total = (summary.value?.totalIncome ?? 0) + (summary.value?.totalExpense ?? 0)
  if (total === 0) return 0
  return Math.round(((summary.value?.totalExpense ?? 0) / total) * 100)
})

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <h1 class="text-h4 mb-6">
      <VIcon icon="ri-dashboard-line" class="me-2" />
      Dashboard
    </h1>

    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard elevation="2">
          <VCardItem>
            <template #prepend>
              <VAvatar color="success" variant="tonal" size="48">
                <VIcon icon="ri-arrow-up-line" size="24" />
              </VAvatar>
            </template>
            <VCardTitle class="text-success">Total Income</VCardTitle>
            <VCardText class="text-h5 font-weight-bold">
              {{ formatCurrency(summary?.totalIncome ?? 0) }}
            </VCardText>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard elevation="2">
          <VCardItem>
            <template #prepend>
              <VAvatar color="error" variant="tonal" size="48">
                <VIcon icon="ri-arrow-down-line" size="24" />
              </VAvatar>
            </template>
            <VCardTitle class="text-error">Total Expense</VCardTitle>
            <VCardText class="text-h5 font-weight-bold">
              {{ formatCurrency(summary?.totalExpense ?? 0) }}
            </VCardText>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard elevation="2">
          <VCardItem>
            <template #prepend>
              <VAvatar color="primary" variant="tonal" size="48">
                <VIcon icon="ri-wallet-line" size="24" />
              </VAvatar>
            </template>
            <VCardTitle class="text-primary">Balance</VCardTitle>
            <VCardText class="text-h5 font-weight-bold">
              {{ formatCurrency(summary?.balance ?? 0) }}
            </VCardText>
          </VCardItem>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard elevation="2">
          <VCardItem>
            <template #prepend>
              <VAvatar color="info" variant="tonal" size="48">
                <VIcon icon="ri-file-list-line" size="24" />
              </VAvatar>
            </template>
            <VCardTitle class="text-info">Transactions</VCardTitle>
            <VCardText class="text-h5 font-weight-bold">
              {{ summary?.count ?? 0 }}
            </VCardText>
          </VCardItem>
        </VCard>
      </VCol>
    </VRow>

    <!-- Progress Bars -->
    <VCard class="mb-6" title="Income vs Expense">
      <VCardText>
        <div class="d-flex align-center mb-2">
          <span class="text-success me-2">Income</span>
          <VProgressLinear
            :model-value="incomePercentage"
            color="success"
            height="12"
            rounded
            class="flex-grow-1"
          />
          <span class="ms-2">{{ incomePercentage }}%</span>
        </div>
        <div class="d-flex align-center">
          <span class="text-error me-2">Expense</span>
          <VProgressLinear
            :model-value="expensePercentage"
            color="error"
            height="12"
            rounded
            class="flex-grow-1"
          />
          <span class="ms-2">{{ expensePercentage }}%</span>
        </div>
      </VCardText>
    </VCard>

    <!-- Recent Transactions -->
    <VCard title="Recent Transactions" :loading="isLoading">
      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VList v-if="recentTransactions.length > 0" lines="two">
        <VListItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :subtitle="`${transaction.category} • ${transaction.description || 'No description'}`"
        >
          <template #prepend>
            <VAvatar :color="transaction.type === 'income' ? 'success' : 'error'" variant="tonal" size="40">
              <VIcon :icon="transaction.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'" />
            </VAvatar>
          </template>

          <template #title>
            <div class="d-flex justify-space-between align-center">
              <span>{{ formatDate(transaction.date) }}</span>
              <span
                :class="transaction.type === 'income' ? 'text-success' : 'text-error'"
                class="font-weight-bold"
              >
                {{ transaction.type === 'income' ? '+' : '-' }} {{ formatCurrency(transaction.amount) }}
              </span>
            </div>
          </template>

          <template #append>
            <VChip :color="transaction.type === 'income' ? 'success' : 'error'" size="small">
              {{ transaction.type === 'income' ? 'Income' : 'Expense' }}
            </VChip>
          </template>
        </VListItem>
      </VList>

      <VCardText v-else class="text-center py-8 text-disabled">
        No transactions yet.
      </VCardText>
    </VCard>
  </div>
</template>
