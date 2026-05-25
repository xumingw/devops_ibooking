import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ibooking/design-tokens': fileURLToPath(
        new URL('../../packages/design-tokens/src/index.ts', import.meta.url)
      )
    }
  },
  server: {
    port: 5174
  }
});
