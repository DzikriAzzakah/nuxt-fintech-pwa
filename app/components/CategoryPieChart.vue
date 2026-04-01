<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true }
})

const chartData = computed(() => {
  const keys = Object.keys(props.data)
  return {
    labels: keys.map(cat => `${getCategoryMeta(cat).emoji} ${getCategoryMeta(cat).label}`),
    datasets: [{
      data: Object.values(props.data),
      backgroundColor: keys.map(cat => getCategoryMeta(cat).colorHex),
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 12, font: { size: 11 } }
    }
  }
}
</script>

<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>
