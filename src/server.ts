import { createApp } from './app'
import { loadEnv } from './config/env'
import { createDb } from './db/client'

const env = loadEnv()

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required on Vercel'
  )
}

const db = createDb(env.databaseUrl, env.authToken)

const app = createApp({ db, env })

export default app
