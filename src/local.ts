import { createApp } from './create-app'
import { loadEnv } from './config/env'
import { createDb } from './db/client'
import { runMigrations } from './db/migrate'

const env = loadEnv()
const db = createDb(env.databaseUrl, env.authToken)
await runMigrations(db)

const app = createApp({ db, env }).listen({
  port: env.port,
  maxRequestBodySize: 64 * 1024
})

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

let shuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`\n${signal} received, shutting down...`)

  try {
    await app.stop()
  } finally {
    await db.$client.close()
  }

  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
