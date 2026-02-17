import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@kauri/shared/types': path.resolve(__dirname, 'packages/shared/src/types.ts'),
      '@kauri/shared/validators': path.resolve(__dirname, 'packages/shared/src/validators.ts'),
      '@kauri/shared/middleware': path.resolve(__dirname, 'packages/shared/src/middleware.ts'),
      '@kauri/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@kauri/ai/provider': path.resolve(__dirname, 'packages/ai/src/provider.ts'),
      '@kauri/ai/insights': path.resolve(__dirname, 'packages/ai/src/insights/orchestrator.ts'),
      '@kauri/ai': path.resolve(__dirname, 'packages/ai/src/index.ts'),
    },
  },
})
