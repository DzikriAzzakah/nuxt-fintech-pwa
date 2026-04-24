<script setup>
const groupId = "shared-group"

const {
  isLoading,
  isAdding,
  isDeleting,
  fetchCustomCategories,
  addCategory,
  deleteCategory,
  customExpenseCategories,
  customIncomeCategories,
} = useCategory()

onMounted(() => {
  fetchCustomCategories(groupId)
})

// ── Tabs ────────────────────────────────────────────────────────────────────
const activeTab = ref('expense')

// ── Emoji picker ────────────────────────────────────────────────────────────
const EMOJI_LIST = [
  // Food & drink
  '🍜','🍕','🍔','🌮','🍣','🍱','🥗','🥘','🍛','🍺','☕','🍰','🍿','🥙','🧆','🥩',
  // Money & finance
  '💵','💰','💳','💎','💹','📈','📉','💸','🏦','🤑','💴','💶','🎰',
  // Transport
  '🚗','✈️','🚂','🚌','🏍️','🚲','⛽','🚕','🚁','⚓','🛵','🛻',
  // Shopping & lifestyle
  '👗','👕','👟','🛍️','📱','🎮','📚','🛒','👜','💄','🧴','🛁',
  // Home & utilities
  '🏠','🏡','🔑','💡','🔧','🧹','🏗️','🛋️','🧰','🪴',
  // Health & wellness
  '💊','🏥','🧘','💆','🏋️','🩺','🩹','🧬',
  // Entertainment
  '🎬','🎵','🎮','🎯','🎭','🎪','🎡','🎲','🏖️','🎸',
  // Work & productivity
  '💼','📊','📋','🖥️','⌨️','📝','🖨️','🗂️',
  // Misc
  '⚡','🎉','🔄','👪','✨','🌟','❤️','🎁','🌈','🙏','🔒','🌍','♻️','🧧',
]

// ── Color presets ───────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { bgHex: '#FFF7ED', colorHex: '#F97316' },
  { bgHex: '#FEFCE8', colorHex: '#EAB308' },
  { bgHex: '#F0FDF4', colorHex: '#22C55E' },
  { bgHex: '#DCFCE7', colorHex: '#16A34A' },
  { bgHex: '#E0F2FE', colorHex: '#0EA5E9' },
  { bgHex: '#EEF2FF', colorHex: '#6366F1' },
  { bgHex: '#EDE9FE', colorHex: '#8B5CF6' },
  { bgHex: '#FAF5FF', colorHex: '#A855F7' },
  { bgHex: '#FCE7F3', colorHex: '#DB2777' },
  { bgHex: '#FDF2F8', colorHex: '#EC4899' },
  { bgHex: '#FEF2F2', colorHex: '#EF4444' },
  { bgHex: '#F0FDFA', colorHex: '#14B8A6' },
  { bgHex: '#F3F4F6', colorHex: '#6B7280' },
]

// ── Add form state ───────────────────────────────────────────────────────────
const showForm = ref(false)
const newLabel = ref('')
const newEmoji = ref('📦')
const newColor = ref(COLOR_PRESETS[0])
const error = ref('')

const openForm = () => {
  newLabel.value = ''
  newEmoji.value = '📦'
  newColor.value = COLOR_PRESETS[0]
  error.value = ''
  showForm.value = true
}

const generateKey = (label) => {
  return label
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    + '_' + Date.now()
}

const submit = async () => {
  error.value = ''
  if (!newLabel.value.trim()) {
    error.value = 'Category name is required.'
    return
  }
  try {
    await addCategory({
      key: generateKey(newLabel.value),
      label: newLabel.value.trim(),
      emoji: newEmoji.value,
      bgHex: newColor.value.bgHex,
      colorHex: newColor.value.colorHex,
      type: activeTab.value,
      groupId,
    })
    showForm.value = false
  } catch (err) {
    console.error('[categories] addCategory failed:', err)
    error.value = err?.message ?? 'Failed to save category.'
  }
}

const confirmDelete = async (id) => {
  if (!confirm('Delete this category?')) return
  await deleteCategory(id)
}

const displayedCustomCategories = computed(() =>
  activeTab.value === 'expense' ? customExpenseCategories.value : customIncomeCategories.value
)

const defaultCategories = computed(() =>
  activeTab.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
)
</script>

<template>
  <div class="p-6 space-y-6 pb-32">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/" class="text-gray-500 hover:text-gray-800 text-xl">←</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Categories</h1>
    </div>

    <!-- Tabs -->
    <div class="flex bg-gray-100 p-1 rounded-lg">
      <button
        @click="activeTab = 'expense'"
        :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', activeTab === 'expense' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']"
      >Expense</button>
      <button
        @click="activeTab = 'income'"
        :class="['flex-1 py-2 rounded-md font-medium text-sm transition-colors', activeTab === 'income' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500']"
      >Income</button>
    </div>

    <!-- Default Categories -->
    <div>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Default</h2>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="(meta, key) in defaultCategories"
          :key="key"
          class="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
          :style="{ background: meta.bgHex }"
        >
          <span class="text-2xl leading-none">{{ meta.emoji }}</span>
          <span class="text-sm font-medium text-gray-700 truncate">{{ meta.label }}</span>
        </div>
      </div>
    </div>

    <!-- Custom Categories -->
    <div v-if="displayedCustomCategories.length > 0">
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Custom</h2>
      <div v-if="isLoading" class="text-center py-4 text-gray-400 text-sm">Loading...</div>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="cat in displayedCustomCategories"
          :key="cat.id"
          class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 relative"
          :style="{ background: cat.bgHex }"
        >
          <span class="text-2xl leading-none">{{ cat.emoji }}</span>
          <span class="text-sm font-medium text-gray-700 truncate flex-1">{{ cat.label }}</span>
          <button
            @click="confirmDelete(cat.id)"
            :disabled="isDeleting"
            class="w-6 h-6 rounded-full bg-white/70 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center text-xs transition-colors shrink-0"
            title="Delete"
          >✕</button>
        </div>
      </div>
    </div>

    <!-- Add Category Button -->
    <button
      v-if="!showForm"
      @click="openForm"
      class="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-500 hover:text-blue-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
    >
      <span class="text-xl leading-none">+</span> Add Category
    </button>

    <!-- Add Category Form -->
    <div v-if="showForm" class="bg-gray-50 rounded-2xl p-5 space-y-5 border border-gray-200">
      <h3 class="font-semibold text-gray-800">New {{ activeTab === 'expense' ? 'Expense' : 'Income' }} Category</h3>

      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Name</label>
        <input
          v-model="newLabel"
          type="text"
          placeholder="e.g. Gym, Subscriptions..."
          maxlength="32"
          class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Emoji picker -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          Icon <span class="ml-1 text-lg">{{ newEmoji }}</span>
        </label>
        <div class="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl p-2">
          <button
            v-for="emoji in EMOJI_LIST"
            :key="emoji"
            @click="newEmoji = emoji"
            :class="[
              'text-xl p-1 rounded-lg transition-colors leading-none',
              newEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'
            ]"
          >{{ emoji }}</button>
        </div>
      </div>

      <!-- Color preset -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Color</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(preset, i) in COLOR_PRESETS"
            :key="i"
            @click="newColor = preset"
            :class="[
              'w-8 h-8 rounded-full border-2 transition-transform',
              newColor === preset ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
            ]"
            :style="{ background: preset.colorHex }"
            :title="preset.colorHex"
          ></button>
        </div>
        <!-- Preview -->
        <div class="mt-3 flex items-center gap-3 p-3 rounded-xl border border-gray-100 w-fit" :style="{ background: newColor.bgHex }">
          <span class="text-2xl leading-none">{{ newEmoji }}</span>
          <span class="text-sm font-medium truncate" :style="{ color: newColor.colorHex }">
            {{ newLabel || 'Preview' }}
          </span>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="showForm = false"
          class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
        >Cancel</button>
        <button
          @click="submit"
          :disabled="isAdding"
          class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span v-if="isAdding" class="inline-block animate-spin">⏳</span>
          {{ isAdding ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
