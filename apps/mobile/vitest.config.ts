import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@cyclists/config': path.resolve(__dirname, '../../packages/config/src'),
      '@cyclists/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
