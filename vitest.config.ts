import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/*" alias from tsconfig.json; Vite supports this natively.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
    // Domain tests run in Node. Tests that render components opt in with a
    // `@vitest-environment jsdom` docblock, so the fast path stays fast.
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/lib/**'],
      reporter: ['text', 'html'],
    },
  },
});
