import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/swap/',
  resolve: {
    alias: {
      '@': join(__dirname, './client/src'),
      '@components': join(__dirname, './client/src/components'),
      '@lib': join(__dirname, './client/src/lib'),
      '@hooks': join(__dirname, './client/src/hooks'),
      '@context': join(__dirname, './client/src/context'),
      '@pages': join(__dirname, './client/src/pages'),
      '@assets': join(__dirname, './attached_assets'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
