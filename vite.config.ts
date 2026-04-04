import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions:{
      output: { manualChunks(id){
        if
        (id.includes('node_modules')){
          return 'vendor'
        }
      }}
    },
    chunkSizeWarningLimit: 5000, // Suppression de l'avertissement de taille
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'og-image.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5*1024*1024, // Augmenté à 5MB pour tolérer les gros bundles react-pdf/gemini
      },
      manifest: {
        name: 'Les Stagiaires',
        short_name: 'Stagiaires',
        description: 'Trouvez votre stage idéal',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
