import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'GAS Document Intelligence',
        short_name: 'GAS Docs',
        description: 'Upload PDFs, review extracted fields and ask source-referenced questions.',
        theme_color: '#173F74',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache the static app shell only. No runtimeCaching: API responses,
        // documents and chat answers must never be stored in browser caches.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  // Same port for dev and preview so the backend's CORS allow-list matches both
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
