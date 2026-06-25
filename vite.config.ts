import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function resolveBuildId(): string {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA
  if (vercelSha) return vercelSha.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_BUILD__: JSON.stringify(resolveBuildId()),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
