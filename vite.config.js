import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // relative asset paths for Vercel
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-vauju-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: true, // SPA fallback
  },
});
