import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Use jsdom for DOM testing (calendarRenderer needs DOM)
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.config.js',
        '**/cal-bundled.js',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    }
  }
});

