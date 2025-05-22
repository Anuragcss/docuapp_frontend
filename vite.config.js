import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true // 👈 This forces Vite to FAIL if port is taken (instead of picking a new one)
  }
});

