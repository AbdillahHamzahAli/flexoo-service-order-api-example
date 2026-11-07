import { createApp } from './app'
import { loadEnv } from './config/env'
import { createDb } from './db/client'
import { runMigrations } from './db/migrate'

const env = loadEnv()
const db = createDb(env.dbPath)
runMigrations(db)

const app = createApp(db).listen(env.port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
