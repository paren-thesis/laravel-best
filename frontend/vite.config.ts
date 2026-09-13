/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Docker bind mounts on Windows and macOS do not forward inotify events into
    // the container, so Vite never sees edits made on the host. Polling is what
    // makes hot reload work here.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    css: false,
    restoreMocks: true,
    // Vitest's default glob would also collect e2e/*.spec.ts, which are
    // Playwright tests and cannot run under Vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
