<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div class="w-full max-w-md bg-white min-h-screen shadow-xl pb-20">
      <slot />

      <div class="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-around p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NuxtLink to="/finance" class="text-2xl hover:scale-110 transition-transform">🏠</NuxtLink>
        <NuxtLink to="/finance/analytics" class="text-2xl hover:scale-110 transition-transform">📊</NuxtLink>
        <NuxtLink to="/finance/categories" class="text-2xl hover:scale-110 transition-transform">🏷️</NuxtLink>
        <NuxtLink to="/" class="text-2xl hover:scale-110 transition-transform">🏡</NuxtLink>
      </div>

      <NuxtLink to="/finance/add" class="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl pb-1 z-40">
        +
      </NuxtLink>
    </div>
  </div>
</template>
