<script setup lang="ts">
import type { Plan, Activity } from '~/types/plan'

const props = defineProps<{
  plan: Plan
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'delete'): void
  (e: 'update', payload: Partial<Omit<Plan, 'id' | 'activities'>>): void
  (e: 'addActivity', payload: Omit<Activity, 'id'>): void
  (e: 'deleteActivity', activityId: string): void
  (e: 'updateStatus', status: Plan['status']): void
}>()

const MOOD_META: Record<string, { label: string; classes: string }> = {
  romantic: { label: '🌹 Romantic', classes: 'bg-rose-50 text-rose-500' },
  fun:      { label: '🎉 Fun',      classes: 'bg-amber-50 text-amber-500' },
  chill:    { label: '☁️ Chill',    classes: 'bg-sky-50 text-sky-500' },
}

const STATUS_OPTIONS: Plan['status'][] = ['planned', 'ongoing', 'done', 'cancelled']
const STATUS_LABEL: Record<Plan['status'], string> = {
  planned: 'Planned', ongoing: 'Ongoing', done: 'Done', cancelled: 'Cancelled',
}

const formattedDate = computed(() => {
  return new Date(props.plan.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

// ── Add Activity Sheet ──────────────────────────────────────────────────────
const showAddActivity = ref(false)
const newActivity = ref<Omit<Activity, 'id'>>({ title: '' })
const addError = ref('')

const openAddActivity = () => {
  newActivity.value = { title: '' }
  addError.value = ''
  showAddActivity.value = true
}

const submitActivity = () => {
  if (!newActivity.value.title.trim()) {
    addError.value = 'Title is required'
    return
  }
  emit('addActivity', { ...newActivity.value, title: newActivity.value.title.trim() })
  showAddActivity.value = false
}

// ── Edit Plan Sheet ─────────────────────────────────────────────────────────
const MOODS: NonNullable<Plan['mood']>[] = ['romantic', 'fun', 'chill']
const MOOD_LABELS: Record<NonNullable<Plan['mood']>, string> = { romantic: '🌹 Romantic', fun: '🎉 Fun', chill: '☁️ Chill' }

const showEdit = ref(false)
const editForm = ref<Partial<Omit<Plan, 'id' | 'activities'>>>({})

const openEdit = () => {
  editForm.value = {
    title: props.plan.title,
    date: props.plan.date,
    startTime: props.plan.startTime,
    endTime: props.plan.endTime,
    location: props.plan.location,
    mapLink: props.plan.mapLink,
    budget: props.plan.budget,
    mood: props.plan.mood,
    notes: props.plan.notes,
    status: props.plan.status,
  }
  showEdit.value = true
}

const editError = ref('')
const submitEdit = () => {
  if (!editForm.value.title?.trim()) { editError.value = 'Title is required'; return }
  if (!editForm.value.date) { editError.value = 'Date is required'; return }
  emit('update', { ...editForm.value, title: editForm.value.title.trim() })
  showEdit.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-linear-to-r from-rose-400 to-pink-600 px-5 pt-10 pb-6 text-white shrink-0">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <button @click="emit('close')" class="text-white/80 hover:text-white text-xl leading-none mb-2 block">←</button>
          <h1 class="text-xl font-bold leading-snug">{{ plan.title }}</h1>
          <p class="text-white/70 text-sm mt-1">📅 {{ formattedDate }}</p>
          <p v-if="plan.startTime" class="text-white/70 text-sm">
            🕐 {{ plan.startTime }}<span v-if="plan.endTime"> – {{ plan.endTime }}</span>
          </p>
        </div>

        <span
          v-if="plan.mood"
          class="text-xs font-medium px-2 py-1 rounded-full self-start shrink-0"
          :class="MOOD_META[plan.mood]?.classes"
        >{{ MOOD_META[plan.mood]?.label }}</span>

        <button
          @click="emit('delete')"
          class="text-white/50 hover:text-white transition-colors text-lg leading-none self-start shrink-0 ml-1"
          title="Delete plan"
        >🗑</button>

        <button
          @click="openEdit"
          class="text-white/50 hover:text-white transition-colors text-lg leading-none self-start shrink-0 ml-1"
          title="Edit plan"
        >✏️</button>
      </div>

      <!-- Meta row -->
      <div class="flex items-center gap-3 mt-3 flex-wrap">
        <span v-if="plan.budget" class="text-sm text-white/80">💰 {{ plan.budget.toLocaleString() }}</span>
        <a
          v-if="plan.mapLink"
          :href="plan.mapLink"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-white/80 underline underline-offset-2"
          @click.stop
        >🗺 Map</a>
        <span v-if="plan.location" class="text-sm text-white/80">📍 {{ plan.location }}</span>
      </div>

      <!-- Status selector -->
      <div class="flex gap-2 mt-3 flex-wrap">
        <button
          v-for="s in STATUS_OPTIONS"
          :key="s"
          @click="emit('updateStatus', s)"
          class="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
          :class="plan.status === s
            ? 'bg-white text-pink-600'
            : 'bg-white/20 text-white hover:bg-white/30'"
        >{{ STATUS_LABEL[s] }}</button>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 px-5 py-5 space-y-5">
      <!-- Notes -->
      <div v-if="plan.notes" class="bg-pink-50 text-pink-700 rounded-xl px-4 py-3 text-sm">
        📝 {{ plan.notes }}
      </div>

      <!-- Activities -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">Itinerary</h2>
          <button
            @click="openAddActivity"
            class="text-sm text-pink-500 hover:text-pink-700 font-medium transition-colors"
          >+ Add Activity</button>
        </div>

        <div v-if="plan.activities.length" class="pl-1">
          <DatePlanActivityItem
            v-for="(act, i) in plan.activities"
            :key="act.id"
            :activity="act"
            :is-last="i === plan.activities.length - 1"
          >
            <template #actions>
              <button
                @click="emit('deleteActivity', act.id)"
                class="text-gray-200 hover:text-red-400 transition-colors text-sm ml-2 shrink-0"
              >✕</button>
            </template>
          </DatePlanActivityItem>
        </div>

        <button
          v-else
          @click="openAddActivity"
          class="w-full border-2 border-dashed border-pink-200 rounded-xl py-6 text-sm text-pink-400 hover:border-pink-400 hover:text-pink-500 transition-colors"
        >
          + Add your first activity
        </button>
      </div>
    </div>

    <!-- Add Activity Sheet -->
    <div
      v-if="showAddActivity"
      class="fixed inset-0 bg-black/40 z-50 flex items-end"
      @click.self="showAddActivity = false"
    >
      <div class="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">New Activity</h2>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Title *</label>
          <input
            v-model="newActivity.title"
            type="text"
            placeholder="e.g. Dinner at the rooftop"
            class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            @keyup.enter="submitActivity"
            autofocus
          />
          <p v-if="addError" class="text-xs text-red-500 mt-1">{{ addError }}</p>
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Start time</label>
            <input v-model="newActivity.startTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">End time</label>
            <input v-model="newActivity.endTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Location</label>
          <input v-model="newActivity.location" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Notes</label>
          <input v-model="newActivity.notes" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <button
          @click="submitActivity"
          class="w-full bg-linear-to-r from-rose-400 to-pink-600 text-white font-semibold py-3 rounded-xl"
        >Add Activity</button>
      </div>
    </div>

    <!-- Edit Plan Sheet -->
    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black/40 z-50 flex items-end"
      @click.self="showEdit = false"
    >
      <div class="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold text-gray-800">Edit Plan</h2>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Title *</label>
          <input v-model="editForm.title" type="text" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Date *</label>
          <input v-model="editForm.date" type="date" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Start time</label>
            <input v-model="editForm.startTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">End time</label>
            <input v-model="editForm.endTime" type="time" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Location</label>
          <input v-model="editForm.location" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Map link</label>
          <input v-model="editForm.mapLink" type="url" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Budget</label>
          <input v-model.number="editForm.budget" type="number" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-2">Mood</label>
          <div class="flex gap-2">
            <button
              v-for="m in MOODS"
              :key="m"
              @click="editForm.mood = (editForm.mood === m ? undefined : m)"
              class="flex-1 text-xs py-2 rounded-xl border font-medium transition-colors"
              :class="editForm.mood === m ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >{{ MOOD_LABELS[m] }}</button>
          </div>
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Notes</label>
          <input v-model="editForm.notes" type="text" placeholder="Optional" class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <p v-if="editError" class="text-xs text-red-500">{{ editError }}</p>

        <button
          @click="submitEdit"
          class="w-full bg-linear-to-r from-rose-400 to-pink-600 text-white font-semibold py-3 rounded-xl"
        >Save Changes</button>
      </div>
    </div>
  </div>
</template>
