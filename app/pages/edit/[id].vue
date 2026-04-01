<script setup>
import { ref, watch, onMounted } from 'vue'
import dayjs from 'dayjs'

const route = useRoute()
const { transactions, fetchTransactions, editTransaction, deleteTransaction, isEditingTransaction, isDeletingTransaction } = useTransaction()

const id = String(route.params.id)
const groupId = "shared-group"

const amount = ref('')
const note = ref('')
const txType = ref('expense')
const category = ref('food')
const transactionDate = ref(dayjs().format('YYYY-MM-DD'))
const isSplit = ref(false)
const user1Amount = ref('')
const user2Amount = ref('')
const error = ref('')
const loading = ref(true)

onMounted(() => {
  fetchTransactions(groupId)
})

watch(transactions, (list) => {
  const t = list.find(t => t.id === id)
  if (t && loading.value) {
    amount.value = String(t.amount)
    note.value = t.note
    txType.value = t.type
    category.value = t.category
    transactionDate.value = dayjs(t.createdAt).format('YYYY-MM-DD')
    if (t.split && t.split.length) {
      isSplit.value = true
      user1Amount.value = String(t.split[0]?.amount ?? '')
      user2Amount.value = String(t.split[1]?.amount ?? '')
    }
    loading.value = false
  }
}, { immediate: true })

const save = async () => {
  error.value = ''
  const transactionData = {
    groupId,
    amount: Number(amount.value),
    type: txType.value,
    category: category.value,
    note: note.value,
    createdAt: dayjs(transactionDate.value).valueOf(),
    ...(isSplit.value && {
      split: [
        { userId: "user1", amount: Number(user1Amount.value) },
        { userId: "user2", amount: Number(user2Amount.value) }
      ],
      paidBy: "user1"
    })
  }

  try {
    await editTransaction(id, transactionData)
    navigateTo('/')
  } catch (err) {
    console.error('editTransaction failed:', err)
    error.value = err?.message ?? 'Failed to save. Check console for details.'
  }
}

const remove = async () => {
  if (!confirm('Are you sure you want to delete this transaction?')) return
  try {
    await deleteTransaction(id)
    navigateTo('/')
  } catch (err) {
    console.error('deleteTransaction failed:', err)
    error.value = err?.message ?? 'Failed to delete. Check console for details.'
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-800 text-xl">←</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Edit Record</h1>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-16">Loading...</div>

    <div v-else class="space-y-4">
      <div class="flex bg-gray-100 p-1 rounded-lg">
        <button @click="txType = 'expense'; category = 'food'" :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', txType === 'expense' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']">Expense</button>
        <button @click="txType = 'income'; category = 'salary'" :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', txType === 'income' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']">Income</button>
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
            <option v-for="(meta, key) in (txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)" :key="key" :value="key">{{ meta.emoji }} {{ meta.label }}</option>
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

      <div class="flex gap-3 mt-6">
        <button @click="remove" :disabled="isDeletingTransaction" class="flex-1 bg-red-50 hover:bg-red-100 disabled:bg-red-50 disabled:cursor-not-allowed text-red-600 disabled:text-red-400 font-semibold text-lg py-4 rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2">
          <span v-if="isDeletingTransaction" class="inline-block animate-spin">⏳</span>
          {{ isDeletingTransaction ? 'Deleting...' : 'Delete' }}
        </button>
        <button @click="save" :disabled="isEditingTransaction" class="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
          <span v-if="isEditingTransaction" class="inline-block animate-spin">⏳</span>
          {{ isEditingTransaction ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
