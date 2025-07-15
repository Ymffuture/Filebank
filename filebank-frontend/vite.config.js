import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icon-upload.png', 'icon-files.png', 'icon-profile.png'],
      manifest: {
        name: 'Famacloud',
        short_name: 'Famacloud',
        description: 'Secure, fast file sharing & storage powered by AI.',
        theme_color: '#1E90FF',
        background_color: '#F0F8FF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '.',
        icons: [
          { src: '/vite.svg', sizes: '192x192', type: 'image/png' },
          { src: '/Branded.svg', sizes: '512x512', type: 'image/png' }
        ],
        shortcuts: [
          {
            name: 'Upload Files',
            short_name: 'Upload',
            description: 'Quickly upload new files',
            url: '/upload',
            icons: [{ src: '/icon-upload.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'My Files',
            short_name: 'Files',
            description: 'Access your stored files',
            url: '/files',
            icons: [{ src: '/icon-files.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Profile',
            short_name: 'Profile',
            description: 'View your profile',
            url: '/profile',
            icons: [{ src: '/icon-profile.png', sizes: '96x96', type: 'image/png' }]
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /.*\.(?:js|css|html|png|svg|jpg|jpeg|webp|woff2)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'famacloud-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              }
            }
          },
          {
            urlPattern: /.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'famacloud-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
