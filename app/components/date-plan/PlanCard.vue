<script setup lang="ts">
import type { Plan } from '~/types/plan'

const props = defineProps<{
  plan: Plan
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'delete'): void
}>()

const MOOD_META: Record<string, { label: string; classes: string }> = {
  romantic: { label: '🌹 Romantic', classes: 'bg-rose-50 text-rose-500' },
  fun:      { label: '🎉 Fun',      classes: 'bg-amber-50 text-amber-500' },
  chill:    { label: '☁️ Chill',    classes: 'bg-sky-50 text-sky-500' },
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  planned:   { label: 'Planned',   classes: 'bg-blue-50 text-blue-500' },
  ongoing:   { label: 'Ongoing',   classes: 'bg-green-50 text-green-600' },
  done:      { label: 'Done',      classes: 'bg-gray-100 text-gray-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-400' },
}

const formattedDate = computed(() => {
  return new Date(props.plan.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
})

const previewActivities = computed(() => props.plan.activities.slice(0, 3))
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm p-4 cursor-pointer active:scale-[0.99] transition-transform select-none"
    :class="plan.status === 'done' || plan.status === 'cancelled' ? 'opacity-60' : ''"
    @click="emit('click')"
  >
    <!-- Top row -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-800 text-base leading-snug truncate">{{ plan.title }}</h3>
        <div class="flex items-center gap-2 mt-1 flex-wrap">
          <span class="text-xs text-gray-400">📅 {{ formattedDate }}</span>
          <span v-if="plan.startTime" class="text-xs text-gray-400">
            🕐 {{ plan.startTime }}<span v-if="plan.endTime"> – {{ plan.endTime }}</span>
          </span>
        </div>
      </div>

      <button
        @click.stop="emit('delete')"
        class="text-gray-200 hover:text-red-400 transition-colors text-lg shrink-0 leading-none"
      >✕</button>
    </div>

    <!-- Badges row -->
    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span
        v-if="plan.mood"
        class="text-xs font-medium px-2 py-0.5 rounded-full"
        :class="MOOD_META[plan.mood].classes"
      >{{ MOOD_META[plan.mood].label }}</span>

      <span
        class="text-xs font-medium px-2 py-0.5 rounded-full"
        :class="STATUS_META[plan.status].classes"
      >{{ STATUS_META[plan.status].label }}</span>

      <span v-if="plan.budget" class="text-xs text-gray-400 ml-auto">
        💰 {{ plan.budget.toLocaleString() }}
      </span>
    </div>

    <!-- Activity preview / CTA -->
    <div class="mt-3 border-t border-gray-50 pt-3">
      <template v-if="previewActivities.length">
        <div class="space-y-0">
          <div
            v-for="(act, i) in previewActivities"
            :key="act.id"
            class="flex items-center gap-2 text-xs text-gray-500 py-0.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-pink-300 shrink-0" />
            <span class="truncate flex-1">{{ act.title }}</span>
            <span v-if="act.startTime" class="text-gray-300 tabular-nums shrink-0">{{ act.startTime }}</span>
          </div>
          <p v-if="plan.activities.length > 3" class="text-xs text-gray-300 pl-3.5 pt-0.5">
            +{{ plan.activities.length - 3 }} more
          </p>
        </div>
      </template>
      <p v-else class="text-xs text-pink-400 font-medium">+ Add itinerary →</p>
    </div>
  </div>
</template>
