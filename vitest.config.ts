import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.spec.ts', '**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    // Watch mode: rerun related tests when source changes
    watch: {
      include: ['src/**/*', 'tests/unit/**/*'],
      exclude: ['tests/e2e/**', 'node_modules/**'],
    },
    // Ensure no network calls in unit tests
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '**/*.d.ts',
        'src/main.ts',
      ],
    },
  },
});
