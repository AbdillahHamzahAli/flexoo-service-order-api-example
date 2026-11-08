import { createApp } from '../../src/app'
import { createDb } from '../../src/db/client'
import { runMigrations } from '../../src/db/migrate'
import { seed } from '../../src/db/seed'

export type App = ReturnType<typeof createApp>

export type ListBody<T> = {
  data: T[]
}

export type ErrorBody = {
  error: {
    code: string
    message: string
    details?: Array<{ path: string; message: string }>
    requestId: string
  }
}

type TestAppOptions = {
  rateLimitMax?: number
  rateLimitWindowMs?: number
  corsOrigins?: string[] | '*'
}

export async function testApp(options: TestAppOptions = {}) {
  const db = createDb(':memory:')

  await runMigrations(db)
  await seed(db)

  return {
    app: createApp({
      db,
      env: {
        corsOrigins: options.corsOrigins ?? ['http://localhost:3000'],
        rateLimitMax: options.rateLimitMax ?? 100,
        rateLimitWindowMs: options.rateLimitWindowMs ?? 600_000
      }
    }),
    db
  }
}

export function request(
  app: App,
  path: string,
  init?: RequestInit
): Promise<Response> {
  return app.handle(new Request(`http://localhost${path}`, init))
}

export function get(app: App, path: string): Promise<Response> {
  return request(app, path)
}

export function postJson(
  app: App,
  path: string,
  body: unknown
): Promise<Response> {
  return request(app, path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export function postRaw(
  app: App,
  path: string,
  body: string
): Promise<Response> {
  return request(app, path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body
  })
}

export const validInquiry = {
  firstName: 'Budi',
  lastName: 'Santoso',
  phone: '+6281234567890',
  companyName: 'PT Contoh Digital',
  companyEmail: 'budi@contoh.co.id',
  description: 'We need a customer portal with SSO and a CMS for 20 editors.'
} as const
