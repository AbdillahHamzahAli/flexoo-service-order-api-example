import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export function createDb(url: string, authToken?: string) {
  const client = createClient({
    url: toLibsqlUrl(url),
    authToken,
    timeout: 5000
  })

  return drizzle(client, { schema })
}

function toLibsqlUrl(value: string): string {
  if (value === ':memory:') {
    return `file:mem_${crypto.randomUUID()}`
  }
  if (/^(file|libsql|https?|wss?):/.test(value)) return value
  return `file:${value}`
}

export type Db = ReturnType<typeof createDb>
