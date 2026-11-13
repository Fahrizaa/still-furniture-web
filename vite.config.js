import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * Konfigurasi Vite utama untuk aplikasi web STILL.
 * Mendaftarkan plugin React untuk JSX/Fast Refresh dan plugin Tailwind CSS v4
 * agar seluruh kelas utilitas Tailwind diproses otomatis saat build & dev server.
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
