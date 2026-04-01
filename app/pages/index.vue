<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import dayjs from 'dayjs'

const { transactions, isLoading, fetchTransactions, addTransaction } = useTransaction()
const { exportToCSV, importFromCSV } = useImportExport()
const groupId = "shared-group"

const filterType = ref('all')
const filterCategory = ref('all')
const filterDateType = ref('this-week')
const customFromDate = ref('')
const customToDate = ref('')
const fileInput = ref(null)
const importStatus = ref(null)
const currentSlide = ref(0)

onMounted(() => {
  fetchTransactions(groupId)
  const now = dayjs()
  customFromDate.value = now.startOf('week').format('YYYY-MM-DD')
  customToDate.value = now.endOf('week').format('YYYY-MM-DD')
})

const getDateRange = () => {
  const now = dayjs()
  let start, end

  switch (filterDateType.value) {
    case 'this-week':
      start = now.startOf('week')
      end = now.endOf('week')
      break
    case 'last-week':
      start = now.subtract(1, 'week').startOf('week')
      end = now.subtract(1, 'week').endOf('week')
      break
    case 'this-month':
      start = now.startOf('month')
      end = now.endOf('month').add(1, 'millisecond')
      break
    case 'last-month':
      start = now.subtract(1, 'month').startOf('month')
      end = now.subtract(1, 'month').endOf('month').add(1, 'millisecond')
      break
    case 'custom':
      start = dayjs(customFromDate.value)
      end = dayjs(customToDate.value).endOf('day')
      break
    default:
      start = now.startOf('week')
      end = now.endOf('week')
  }

  return {
    start: start.valueOf(),
    end: end.valueOf()
  }
}

const getDateFilterLabel = () => {
  switch (filterDateType.value) {
    case 'this-week':
      return 'This Week'
    case 'last-week':
      return 'Last Week'
    case 'this-month':
      return 'This Month'
    case 'last-month':
      return 'Last Month'
    case 'custom':
      return `${dayjs(customFromDate.value).format('DD MMM')} - ${dayjs(customToDate.value).format('DD MMM')}`
    default:
      return 'This Week'
  }
}

const handleExport = () => {
  exportToCSV(transactions.value)
}

const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  importStatus.value = null
  try {
    const result = await importFromCSV(file, addTransaction, groupId)
    importStatus.value = result
  } catch (err) {
    importStatus.value = { imported: 0, errors: [err?.message ?? 'Import failed'] }
  }
  if (fileInput.value) fileInput.value.value = ''
}

const totalBalance = computed(() => {
  return transactions.value.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount
  }, 0)
})

const getFilteredTransactionsByDate = () => {
  const dateRange = getDateRange()
  return transactions.value.filter(t => t.createdAt >= dateRange.start && t.createdAt <= dateRange.end)
}

const totalExpenses = computed(() => {
  return getFilteredTransactionsByDate()
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const expensesByCategory = computed(() => {
  const filtered = getFilteredTransactionsByDate().filter(t => t.type === 'expense')
  const grouped = {}
  filtered.forEach(t => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount
  })
  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
})

const categorySlides = computed(() => {
  const slides = []
  const itemsPerSlide = 2
  for (let i = 0; i < expensesByCategory.value.length; i += itemsPerSlide) {
    slides.push(expensesByCategory.value.slice(i, i + itemsPerSlide))
  }
  return slides
})

const slides = computed(() => {
  const dateLabel = getDateFilterLabel()
  const allSlides = [
    {
      type: 'balance',
      title: 'Total Balance',
      value: totalBalance.value
    },
    {
      type: 'expenses',
      title: `Total Expenses (${dateLabel})`,
      value: totalExpenses.value
    }
  ]
  categorySlides.value.forEach((items, idx) => {
    allSlides.push({
      type: 'category',
      title: `Top Expenses ${idx + 1} (${dateLabel})`,
      items
    })
  })
  return allSlides
})

// Reset currentSlide if it exceeds slides length when filters change
watch(() => slides.value.length, (newLength) => {
  if (currentSlide.value >= newLength && newLength > 0) {
    currentSlide.value = 0
  }
})

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

const getPercentage = (amount) => {
  return totalExpenses.value > 0 ? Math.round((amount / totalExpenses.value) * 100) : 0
}

const filteredTransactions = computed(() => {
  const dateRange = getDateRange()
  return transactions.value
    .filter(t => {
      const typeMatch = filterType.value === 'all' || t.type === filterType.value
      const catMatch = filterCategory.value === 'all' || t.category === filterCategory.value
      const dateMatch = t.createdAt >= dateRange.start && t.createdAt <= dateRange.end
      return typeMatch && catMatch && dateMatch
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Overview</h1>
      <div class="flex items-center gap-2">
        <button @click="handleExport" class="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium transition-colors">⬇ Export</button>
        <button @click="fileInput.click()" class="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium transition-colors">⬆ Import</button>
        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleImport" />
        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
      </div>
    </header>

    <div v-if="importStatus" :class="['p-3 rounded-xl text-sm font-medium', importStatus.errors?.length ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200']">
      <div>✓ Imported {{ importStatus.imported }} transaction{{ importStatus.imported !== 1 ? 's' : '' }}.</div>
      <ul v-if="importStatus.errors?.length" class="mt-1 text-xs list-disc list-inside">
        <li v-for="(e, i) in importStatus.errors" :key="i">{{ e }}</li>
      </ul>
    </div>

    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
      <div class="flex justify-between items-start mb-4">
        <div>
          <div class="text-blue-100 text-sm font-medium mb-1">{{ slides[currentSlide].title }}</div>
          <div v-if="slides[currentSlide].type !== 'category'" class="text-4xl font-bold tracking-tight">
            Rp {{ Math.abs(slides[currentSlide].value || 0).toLocaleString() }}
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="prevSlide" class="p-1.5 hover:bg-blue-500 rounded-lg transition-colors">‹</button>
          <button @click="nextSlide" class="p-1.5 hover:bg-blue-500 rounded-lg transition-colors">›</button>
        </div>
      </div>

      <!-- Category Slide Content -->
      <div v-if="slides[currentSlide].type === 'category'" class="space-y-3">
        <div v-for="item in slides[currentSlide].items" :key="item.category" class="flex justify-between items-center bg-blue-500 bg-opacity-40 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <div class="text-lg">{{ getCategoryMeta(item.category).emoji }}</div>
            <div>
              <div class="font-semibold text-sm">{{ getCategoryMeta(item.category).label }}</div>
              <div class="text-xs text-blue-100">{{ getPercentage(item.amount) }}% of total</div>
            </div>
          </div>
          <div class="font-bold">Rp {{ item.amount.toLocaleString() }}</div>
        </div>
      </div>

      <!-- Slide Indicators -->
      <div class="flex justify-center gap-1.5 mt-4">
        <div v-for="(_, idx) in slides" :key="idx" :class="['h-1.5 rounded-full transition-all', idx === currentSlide ? 'bg-white w-6' : 'bg-blue-300 w-1.5']"></div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-700">Recent Transactions</h2>
        <span class="text-sm text-gray-400">{{ filteredTransactions.length }} records</span>
      </div>

      <!-- Filters -->
      <div class="space-y-3 mb-4">
        <div class="flex bg-gray-100 p-1 rounded-lg gap-1">
          <button
            v-for="opt in [{ value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]"
            :key="opt.value"
            @click="filterType = opt.value"
            :class="['flex-1 py-1.5 rounded-md font-medium text-sm transition-colors',
              filterType === opt.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']"
          >{{ opt.label }}</button>
        </div>

        <select v-model="filterCategory" class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Categories</option>
          <optgroup label="Expenses">
            <option v-for="(meta, key) in EXPENSE_CATEGORIES" :key="key" :value="key">{{ meta.emoji }} {{ meta.label }}</option>
          </optgroup>
          <optgroup label="Income">
            <option v-for="(meta, key) in INCOME_CATEGORIES" :key="key" :value="key">{{ meta.emoji }} {{ meta.label }}</option>
          </optgroup>
        </select>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in ['this-week', 'last-week', 'this-month', 'last-month']"
            :key="option"
            @click="filterDateType = option"
            :class="['px-3 py-1.5 rounded-lg font-medium transition-colors text-sm',
              filterDateType === option
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            {{ option === 'this-week' ? 'This Week' :
               option === 'last-week' ? 'Last Week' :
               option === 'this-month' ? 'This Month' : 'Last Month' }}
          </button>
          <button
            @click="filterDateType = 'custom'"
            :class="['px-3 py-1.5 rounded-lg font-medium transition-colors text-sm',
              filterDateType === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            Custom
          </button>
        </div>

        <div v-if="filterDateType === 'custom'" class="flex gap-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-600 mb-1">From</label>
            <input v-model="customFromDate" type="date" class="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-600 mb-1">To</label>
            <input v-model="customToDate" type="date" class="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <!-- Transaction List -->
      <div class="space-y-3">
        <!-- Loading Skeleton -->
        <template v-if="isLoading">
          <div v-for="i in 3" :key="`skeleton-${i}`" class="border-l-4 border-gray-200 flex justify-between items-center p-4 bg-white rounded-xl shadow-sm animate-pulse">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-40"></div>
              </div>
            </div>
            <div class="h-5 bg-gray-200 rounded w-20 ml-2"></div>
          </div>
        </template>

        <!-- Loaded Transactions -->
        <template v-else>
          <div
            v-for="t in filteredTransactions"
            :key="t.id"
            :style="{ borderLeftColor: getCategoryMeta(t.category).colorHex }"
            class="border-l-4 flex justify-between items-center p-4 bg-white rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm cursor-pointer"
            @click="navigateTo('/edit/' + t.id)"
          >
            <div class="flex items-center gap-4">
              <div
                :style="{ backgroundColor: getCategoryMeta(t.category).bgHex }"
                class="w-12 h-12 rounded-full flex items-center justify-center shadow-sm text-xl shrink-0"
              >
                {{ getCategoryMeta(t.category).emoji }}
              </div>
              <div>
                <div class="font-semibold text-gray-800">{{ getCategoryMeta(t.category).label }}</div>
                <div class="text-xs text-gray-500 font-medium">{{ dayjs(t.createdAt).format('DD MMM YYYY') }} • {{ t.note }}</div>
              </div>
            </div>
            <div :class="['font-bold whitespace-nowrap ml-2', t.type === 'income' ? 'text-green-500' : 'text-gray-800']">
              {{ t.type === 'income' ? '+' : '-' }}Rp {{ t.amount.toLocaleString() }}
            </div>
          </div>

          <div v-if="filteredTransactions.length === 0" class="text-center text-gray-400 py-8">
            No transactions found.
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
