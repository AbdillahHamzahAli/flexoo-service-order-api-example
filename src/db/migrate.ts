import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { createDb, type Db } from './client'

export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL('./migrations', import.meta.url)
)

export function runMigrations(db: Db, folder = MIGRATIONS_FOLDER): void {
  migrate(db, { migrationsFolder: folder })
}

if (import.meta.main) {
  const db = createDb(process.env.DB_PATH ?? './data/app.db')

  try {
    runMigrations(db)
    console.log('Migrations applied.')
  } finally {
    db.$client.close()
  }
}
