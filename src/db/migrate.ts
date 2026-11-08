import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createDb, type Db } from './client'

export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL('./migrations', import.meta.url)
)

export async function runMigrations(
  db: Db,
  folder = MIGRATIONS_FOLDER
): Promise<void> {
  await migrate(db, { migrationsFolder: folder })
}

if (import.meta.main) {
  const db = createDb(
    process.env.TURSO_DATABASE_URL ?? process.env.DB_PATH ?? './data/app.db',
    process.env.TURSO_AUTH_TOKEN
  )

  try {
    await runMigrations(db)
    console.log('Migrations applied.')
  } finally {
    await db.$client.close()
  }
}
