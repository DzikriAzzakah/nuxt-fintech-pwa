<script setup lang="ts">
import type { Activity } from '~/types/plan'

defineProps<{
  activity: Activity
  isLast?: boolean
}>()
</script>

<template>
  <div class="flex gap-3">
    <!-- Timeline indicator -->
    <div class="flex flex-col items-center">
      <div class="w-3 h-3 rounded-full bg-pink-400 ring-2 ring-pink-100 shrink-0 mt-1" />
      <div v-if="!isLast" class="w-0.5 bg-pink-100 flex-1 mt-1" />
    </div>

    <!-- Content -->
    <div class="pb-5 flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <p class="font-medium text-gray-800 text-sm leading-snug">{{ activity.title }}</p>
        <div class="flex items-center gap-1 shrink-0">
          <span
            v-if="activity.startTime"
            class="text-xs text-pink-500 font-medium tabular-nums"
          >{{ activity.startTime }}<span v-if="activity.endTime"> – {{ activity.endTime }}</span></span>
          <slot name="actions" />
        </div>
      </div>

      <div v-if="activity.location" class="flex items-center gap-1 mt-1 text-gray-400 text-xs">
        <span>📍</span>
        <span class="truncate">{{ activity.location }}</span>
      </div>

      <p v-if="activity.notes" class="mt-1 text-xs text-gray-400 italic">{{ activity.notes }}</p>
    </div>
  </div>
</template>
