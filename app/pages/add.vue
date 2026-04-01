<script setup>
import { ref, onMounted, watch } from 'vue'
import dayjs from 'dayjs'

const { addTransaction, fetchTransactions, isAddingTransaction } = useTransaction()
const groupId = "shared-group"

const amount = ref('')
const note = ref('')
const type = ref('expense')
const category = ref('food')
const transactionDate = ref(dayjs().format('YYYY-MM-DD'))

// Split Bill State
const isSplit = ref(false)
const user1Amount = ref('')
const user2Amount = ref('')
const error = ref('')

onMounted(() => {
  fetchTransactions(groupId)
})

watch(type, (newVal) => {
  category.value = newVal === 'income' ? 'salary' : 'food'
})

const submit = async () => {
  error.value = ''
  const transactionData = {
    groupId: "shared-group",
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    note: note.value,
    createdAt: dayjs(transactionDate.value).valueOf(),
    ...(isSplit.value && {
      split: [
        { userId: "user1", amount: Number(user1Amount.value) },
        { userId: "user2", amount: Number(user2Amount.value) }
      ],
      paidBy: "user1" // Hardcoded for demo
    })
  }

  try {
    await addTransaction(transactionData)
    navigateTo('/')
  } catch (err) {
    console.error('addTransaction failed:', err)
    error.value = err?.message ?? 'Failed to save. Check console for details.'
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-800 text-xl">←</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Add Record</h1>
    </div>

    <div class="space-y-4">
      <div class="flex bg-gray-100 p-1 rounded-lg">
        <button @click="type = 'expense'; category = 'food'" :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', type === 'expense' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']">Expense</button>
        <button @click="type = 'income'; category = 'salary'" :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', type === 'income' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']">Income</button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Amount</label>
        <input v-model="amount" type="number" placeholder="0" class="w-full bg-gray-50 border border-gray-200 text-2xl p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Date</label>
        <input v-model="transactionDate" type="date" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select v-model="category" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="(meta, key) in (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)" :key="key" :value="key">{{ meta.emoji }} {{ meta.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Note</label>
          <input v-model="note" type="text" placeholder="Lunch..." class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div class="pt-4 border-t border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <label class="font-medium text-gray-700">Split Bill?</label>
          <input type="checkbox" v-model="isSplit" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
        </div>

        <div v-if="isSplit" class="flex gap-4">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">User 1 (You)</label>
            <input v-model="user1Amount" type="number" placeholder="Rp" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl" />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">User 2</label>
            <input v-model="user2Amount" type="number" placeholder="Rp" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl" />
          </div>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

      <button @click="submit" :disabled="isAddingTransaction" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2">
        <span v-if="isAddingTransaction" class="inline-block animate-spin">⏳</span>
        {{ isAddingTransaction ? 'Saving...' : 'Save Transaction' }}
      </button>
    </div>
  </div>
</template>
