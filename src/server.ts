import { createApp } from './create-app'
import { loadEnv } from './config/env'
import { createDb } from './db/client'
import { Elysia } from 'elysia'

// Keep a direct Elysia import in the Vercel entrypoint. Vercel's framework
// detector uses the entrypoint's static imports when selecting the Bun/Elysia
// runtime; the actual app composition remains in create-app.ts.
void Elysia

const env = loadEnv()

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required on Vercel'
  )
}

const db = createDb(env.databaseUrl, env.authToken)

const app = createApp({ db, env })

export default app
