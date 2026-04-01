<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  currentData: { type: Object, required: true },
  compareData: { type: Object, required: true }
})

const chartData = computed(() => {
  const allCategories = new Set([
    ...Object.keys(props.currentData),
    ...Object.keys(props.compareData)
  ])
  
  const currentValues = Array.from(allCategories).map(cat => props.currentData[cat] || 0)
  const compareValues = Array.from(allCategories).map(cat => props.compareData[cat] || 0)

  return {
    labels: Array.from(allCategories).map(cat => `${getCategoryMeta(cat).emoji} ${getCategoryMeta(cat).label}`),
    datasets: [
      {
        label: 'Current Period',
        data: currentValues,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      },
      {
        label: 'Previous Period',
        data: compareValues,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
