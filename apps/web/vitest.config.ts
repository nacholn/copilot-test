import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cyclists/config': path.resolve(__dirname, '../../packages/config/src'),
      '@cyclists/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
