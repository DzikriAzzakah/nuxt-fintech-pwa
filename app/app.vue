<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#f43f5e' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Couple Apps' },
  ],
  link: [
    { rel: 'apple-touch-icon', href: '/icon-192.svg' },
    { rel: 'icon', type: 'image/svg+xml', href: '/icon-192.svg' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ]
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
