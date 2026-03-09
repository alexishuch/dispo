import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3001,
  },
  resolve: process.env.VITEST
    ? {
      conditions: ['browser']
    }
    : undefined
});
