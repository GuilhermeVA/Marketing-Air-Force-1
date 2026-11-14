import { defineConfig, devices } from '@playwright/test'

// Testes ponta a ponta contra o Supabase LOCAL (rode `npx supabase start` antes).
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321'
const LOCAL_PUBLISHABLE_KEY =
  process.env.E2E_SUPABASE_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5181',
    ...devices['Pixel 7'],
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: {
    command: 'npx vite --port 5181 --strictPort',
    url: 'http://localhost:5181',
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: LOCAL_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: LOCAL_PUBLISHABLE_KEY,
    },
  },
})
