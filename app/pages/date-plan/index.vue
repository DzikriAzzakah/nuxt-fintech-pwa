<script setup lang="ts">
import type { Plan, Activity } from '~/types/plan'
import DatePlanPlanCard from '~/components/date-plan/PlanCard.vue'
import DatePlanPlanDetail from '~/components/date-plan/PlanDetail.vue';

definePageMeta({ layout: 'date-plan' })

const GROUP_ID = 'shared-group'

const { plans, isLoading, nextUpcomingPlan, fetchPlans, createPlan, updatePlan, deletePlan, addActivity, deleteActivity } = usePlan()

onMounted(() => fetchPlans(GROUP_ID))

// -- View state ---------------------------------------------------------------
const selectedPlanId = ref<string | null>(null)
const selectedPlan = computed(() => plans.value.find(p => p.id === selectedPlanId.value) ?? null)
const showAddPlan = ref(false)

// -- Add Plan form -------------------------------------------------------------
const MOODS: NonNullable<Plan['mood']>[] = ['romantic', 'fun', 'chill']
const MOOD_LABELS: Record<NonNullable<Plan['mood']>, string> = { romantic: '🌹 Romantic', fun: '🎉 Fun', chill: '☁️ Chill' }

const newPlan = ref<Partial<Omit<Plan, 'id' | 'activities'>>>({
  status: 'planned',
  mood: undefined,
})
const formError = ref('')
const isSubmitting = ref(false)

const openAddPlan = () => {
  newPlan.value = { status: 'planned', mood: undefined }
  formError.value = ''
  showAddPlan.value = true
}

const submitPlan = async () => {
  if (!newPlan.value.title?.trim()) { formError.value = 'Title is required'; return }
  if (!newPlan.value.date) { formError.value = 'Date is required'; return }
  isSubmitting.value = true
  try {
    await createPlan(GROUP_ID, {
      title: newPlan.value.title.trim(),
      date: newPlan.value.date,
      status: newPlan.value.status ?? 'planned',
      startTime: newPlan.value.startTime,
      endTime: newPlan.value.endTime,
      location: newPlan.value.location,
      mapLink: newPlan.value.mapLink,
      budget: newPlan.value.budget,
      mood: newPlan.value.mood,
      notes: newPlan.value.notes,
    })
    showAddPlan.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleDeletePlan = async (id: string) => {
  if (confirm('Delete this plan?')) {
    await deletePlan(id)
    if (selectedPlanId.value === id) selectedPlanId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Detail view (slides over list) -->
    <Transition name="slide">
      <div v-if="selectedPlan" class="fixed inset-0 z-30 flex justify-center bg-gray-100">
        <div class="w-full max-w-md bg-white min-h-screen shadow-xl overflow-y-auto">
          <DatePlanPlanDetail
            :plan="selectedPlan"
            @close="selectedPlanId = null"
            @delete="handleDeletePlan(selectedPlan!.id)"
            @update="(payload) => updatePlan(selectedPlan!.id, payload)"
            @add-activity="(act: Omit<Activity, 'id'>) => addActivity(selectedPlan!.id, act)"
            @delete-activity="(actId: string) => deleteActivity(selectedPlan!.id, actId)"
            @update-status="(s: Plan['status']) => updatePlan(selectedPlan!.id, { status: s })"
          />
        </div>
      </div>
    </Transition>

    <!-- Header -->
    <div class="bg-linear-to-r from-rose-400 to-pink-600 px-5 pt-10 pb-6 text-white shrink-0">
      <div class="flex items-center gap-3 mb-1">
        <NuxtLink to="/" class="text-white/80 hover:text-white text-xl leading-none">←</NuxtLink>
        <span class="text-2xl">💑</span>
        <h1 class="text-xl font-bold">Date Plan</h1>
      </div>
      <p class="text-white/70 text-sm ml-9">Plan your dates together</p>

      <!-- Next upcoming plan banner -->
      <div
        v-if="nextUpcomingPlan"
        class="mt-4 bg-white/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/30 transition-colors"
        @click="selectedPlanId = nextUpcomingPlan.id"
      >
        <p class="text-white/70 text-xs mb-0.5">Next up</p>
        <p class="text-white font-semibold text-sm">{{ nextUpcomingPlan.title }}</p>
        <p class="text-white/70 text-xs mt-0.5">
          {{ new Date(nextUpcomingPlan.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
        </p>
      </div>
    </div>

    <!-- Plan list -->
    <div class="flex-1 px-4 py-4 space-y-3 pb-24">

      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
          <div class="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
          <div class="h-3 bg-gray-100 rounded-full w-1/2 mb-4" />
          <div class="flex gap-2">
            <div class="h-5 bg-gray-100 rounded-full w-20" />
            <div class="h-5 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
      </template>

      <template v-else>
        <DatePlanPlanCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          @click="selectedPlanId = plan.id"
          @delete="handleDeletePlan(plan.id)"
        />

        <!-- Empty state -->
        <div v-if="plans.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-6">
          <div class="text-6xl mb-4">🗓️</div>
          <p class="text-gray-700 font-semibold text-base">No date plans yet</p>
          <p class="text-gray-400 text-sm mt-1 mb-6">Start planning your next romantic adventure together!</p>
          <button
            @click="openAddPlan"
            class="bg-linear-to-r from-rose-400 to-pink-600 text-white text-sm font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >Create your first plan ✨</button>
        </div>
      </template>
    </div>

    <!-- Add Plan Sheet -->
    <div
      v-if="showAddPlan"
      class="fixed inset-0 bg-black/40 z-40 flex items-end"
      @click.self="showAddPlan = false"
    >
      <div class="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold text-gray-800">New Date Plan</h2>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Title *</label>
          <input
            v-model="newPlan.title"
            type="text"
            placeholder="e.g. Sunset picnic"
            class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Date *</label>
          <input
            v-model="newPlan.date"
            type="date"
            class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Start time</label>
            <input v-model="newPlan.startTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">End time</label>
            <input v-model="newPlan.endTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Location</label>
          <input v-model="newPlan.location" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Budget</label>
          <input v-model.number="newPlan.budget" type="number" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-2">Mood</label>
          <div class="flex gap-2">
            <button
              v-for="m in MOODS"
              :key="m"
              @click="newPlan.mood = (newPlan.mood === m ? undefined : m)"
              class="flex-1 text-xs py-2 rounded-xl border font-medium transition-colors"
              :class="newPlan.mood === m
                ? 'border-pink-400 bg-pink-50 text-pink-600'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >{{ MOOD_LABELS[m] }}</button>
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Notes</label>
          <input v-model="newPlan.notes" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <p v-if="formError" class="text-xs text-red-500">{{ formError }}</p>

        <button
          @click="submitPlan"
          :disabled="isSubmitting"
          class="w-full bg-linear-to-r from-rose-400 to-pink-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >{{ isSubmitting ? 'Creating...' : 'Create Plan' }}</button>
      </div>
    </div>

    <!-- FAB -->
    <button
      @click="openAddPlan"
      class="fixed bottom-8 right-6 bg-linear-to-br from-rose-400 to-pink-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl pb-1 z-30 active:scale-95 transition-transform"
    >+</button>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
