// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.VITE_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.VITE_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  },
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    strategies: 'generateSW',
    manifest: {
      name: "Couple Apps",
      short_name: "Couple",
      description: "Your shared space — finance, dates, and more, together",
      theme_color: "#f43f5e",
      background_color: "#F9FAFB",
      display: "standalone",
      scope: "/",
      start_url: "/",
      orientation: "portrait-primary",
      categories: ["finance", "productivity"],
      icons: [
        {
          src: "/icon-192.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "/icon-512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "/icon-192-maskable.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "maskable"
        },
        {
          src: "/icon-512-maskable.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable"
        }
      ],
      screenshots: [
        {
          src: "/screenshot-1.svg",
          sizes: "540x720",
          type: "image/svg+xml",
          form_factor: "narrow"
        },
        {
          src: "/screenshot-2.svg",
          sizes: "540x720",
          type: "image/svg+xml",
          form_factor: "narrow"
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2,ttf}'],
      runtimeCaching: [
        {
          urlPattern: 'https://fonts.googleapis.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20 * 60 * 1000
    }
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
})
