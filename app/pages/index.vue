<script setup>
definePageMeta({ layout: 'landing' })

const modules = [
  {
    id: 'finance',
    title: 'Finance',
    description: 'Track shared expenses & income',
    emoji: '💰',
    to: '/finance',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'date-plan',
    title: 'Date Plan',
    description: 'Plan and save your date ideas',
    emoji: '💑',
    to: '/date-plan',
    color: 'from-rose-400 to-pink-600',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col items-center justify-center px-6 py-12">
    <!-- Header -->
    <div class="text-center mb-10">
      <div class="text-5xl mb-3">💑</div>
      <h1 class="text-3xl font-bold text-gray-800">Couple Apps</h1>
      <p class="text-gray-500 mt-1 text-sm">Your shared space, together</p>
    </div>

    <!-- Module Cards -->
    <div class="w-full max-w-sm space-y-4">
      <NuxtLink
        v-for="mod in modules"
        :key="mod.id"
        :to="mod.to"
        class="block rounded-2xl bg-gradient-to-r p-px shadow-md active:scale-95 transition-transform"
        :class="mod.color"
      >
        <div class="bg-white rounded-2xl px-5 py-5 flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl shrink-0 shadow-sm"
            :class="mod.color"
          >
            {{ mod.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-lg leading-tight">{{ mod.title }}</p>
            <p class="text-gray-500 text-sm mt-0.5">{{ mod.description }}</p>
          </div>
          <span class="text-gray-300 text-xl">›</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
