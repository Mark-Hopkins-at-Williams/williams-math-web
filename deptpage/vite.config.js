import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adminAuthPlugin from './vite-plugins/admin-auth-plugin.js'
import adminApiPlugin from './vite-plugins/admin-api-plugin.js'
import dataReloadPlugin from './vite-plugins/data-reload-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  // adminAuthPlugin must come first so it gates /admin and /__admin-api
  // before adminApiPlugin's middleware (or Vite's own SPA fallback) handles
  // them. It's a no-op unless server/credentials.json exists, which is only
  // true on the deployed admin server, never in a local checkout.
  plugins: [adminAuthPlugin(), react(), adminApiPlugin(), dataReloadPlugin()],
  server: {
    // images/ and articles/ are symlinks to the repo-root copies that
    // GitHub Pages serves, so allow the dev server to follow them there.
    fs: { allow: ['..'] },
    watch: {
      // The admin panel (deptpage/src/admin) writes these files directly.
      // Without ignoring them, every admin save triggers Vite's watcher to
      // invalidate db.js's static JSON imports and full-reload any open
      // tab -- including the admin tab itself, mid-edit.
      // Edits from anywhere else still reload the page: see
      // vite-plugins/data-reload-plugin.js.
      ignored: ['**/data/*.json', '**/articles/**', '**/images/**'],
    },
  },
})
