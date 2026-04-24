<script setup>
import { onMounted, ref, computed } from 'vue'
import dayjs from 'dayjs'

const { transactions, isLoading, fetchTransactions, getDateRangeData } = useTransaction()
const { fetchCustomCategories } = useCategory()

const filterType = ref('this-week')
const customFromDate = ref('')
const customToDate = ref('')

// Initialize with current week
onMounted(() => {
  fetchTransactions("shared-group")
  fetchCustomCategories("shared-group")
  const now = dayjs()
  customFromDate.value = now.startOf('week').format('YYYY-MM-DD')
  customToDate.value = now.endOf('week').format('YYYY-MM-DD')
})

const getDateRange = () => {
  const now = dayjs()
  let start, end, compareStart, compareEnd

  switch (filterType.value) {
    case 'this-month':
      start = now.startOf('month')
      end = now.endOf('month')
      compareStart = now.subtract(1, 'month').startOf('month')
      compareEnd = now.subtract(1, 'month').endOf('month')
      break
    case 'last-month':
      start = now.subtract(1, 'month').startOf('month')
      end = now.subtract(1, 'month').endOf('month')
      compareStart = now.subtract(2, 'month').startOf('month')
      compareEnd = now.subtract(2, 'month').endOf('month')
      break
    case 'this-week':
      start = now.startOf('week')
      end = now.endOf('week')
      compareStart = now.subtract(1, 'week').startOf('week')
      compareEnd = now.subtract(1, 'week').endOf('week')
      break
    case 'last-week':
      start = now.subtract(1, 'week').startOf('week')
      end = now.subtract(1, 'week').endOf('week')
      compareStart = now.subtract(2, 'week').startOf('week')
      compareEnd = now.subtract(2, 'week').endOf('week')
      break
    case 'custom':
      start = dayjs(customFromDate.value)
      end = dayjs(customToDate.value)
      compareStart = start.subtract(1, 'month')
      compareEnd = end.subtract(1, 'month')
      break
    default:
      start = now.startOf('month')
      end = now.endOf('month')
      compareStart = now.subtract(1, 'month').startOf('month')
      compareEnd = now.subtract(1, 'month').endOf('month')
  }

  return {
    start: start.valueOf(),
    end: end.valueOf(),
    compareStart: compareStart.valueOf(),
    compareEnd: compareEnd.valueOf()
  }
}

const dateRangeLabel = computed(() => {
  const range = getDateRange()
  const start = dayjs(range.start).format('DD MMM')
  const end = dayjs(range.end).format('DD MMM YYYY')
  return `${start} - ${end}`
})

const compareDateRangeLabel = computed(() => {
  const range = getDateRange()
  const start = dayjs(range.compareStart).format('DD MMM')
  const end = dayjs(range.compareEnd).format('DD MMM YYYY')
  return `${start} - ${end}`
})

const chartData = computed(() => {
  const range = getDateRange()
  return getDateRangeData(range.start, range.end, range.compareStart, range.compareEnd)
})
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

    <!-- Date Filter Section -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h3 class="font-semibold text-gray-700">Filter by Date</h3>
      
      <!-- Preset Options -->
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="option in ['this-month', 'last-month', 'this-week', 'last-week']"
          :key="option"
          @click="filterType = option"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors text-sm',
            filterType === option 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
        >
          {{ option === 'this-month' ? 'This Month' : 
             option === 'last-month' ? 'Last Month' :
             option === 'this-week' ? 'This Week' : 'Last Week' }}
        </button>
        <button 
          @click="filterType = 'custom'"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors text-sm',
            filterType === 'custom' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
        >
          Custom
        </button>
      </div>

      <!-- Custom Date Range -->
      <div v-if="filterType === 'custom'" class="flex gap-2 pt-2">
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

    <!-- Category Breakdown Pie Chart -->
    <div>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Category Breakdown</h2>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
        <p class="text-xs text-gray-500 text-center">{{ dateRangeLabel }}</p>
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 space-y-3">
          <div class="animate-spin text-3xl">⏳</div>
          <p class="text-sm text-gray-400">Calculating breakdown...</p>
        </div>
        <template v-else>
          <CategoryPieChart :data="chartData.current" v-if="Object.keys(chartData.current).length" />
          <div v-else class="text-gray-400 text-center py-8">No data for selected period.</div>
        </template>
      </div>
    </div>

    <!-- Period Comparison Bar Chart -->
    <div>
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Period Comparison</h2>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
        <div class="flex justify-between text-xs text-gray-500">
          <span>📊 Current: {{ dateRangeLabel }}</span>
          <span>📈 Previous: {{ compareDateRangeLabel }}</span>
        </div>
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 space-y-3">
          <div class="animate-spin text-3xl">⏳</div>
          <p class="text-sm text-gray-400">Comparing periods...</p>
        </div>
        <template v-else>
          <ExpenseChart :currentData="chartData.current" :compareData="chartData.compare" v-if="transactions.length" />
          <div v-else class="text-gray-400 text-center py-8">Not enough data to chart.</div>
        </template>
      </div>
    </div>
  </div>
</template>
