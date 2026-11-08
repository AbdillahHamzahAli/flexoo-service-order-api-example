export type AppEnv = {
  corsOrigins: string[] | '*'
  rateLimitMax: number
  rateLimitWindowMs: number
}

export type Env = AppEnv & {
  nodeEnv: string
  port: number
  databaseUrl: string
  authToken?: string
}

function parseInteger(
  name: string,
  raw: string,
  min: number,
  max = Number.MAX_SAFE_INTEGER
): number {
  const value = Number(raw)

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(
      `Invalid ${name}: expected an integer between ${min} and ${max}`
    )
  }

  return value
}

export function loadEnv(): Env {
  const port = parseInteger('PORT', process.env.PORT ?? '3000', 1, 65535)
  const rateLimitMax = parseInteger(
    'RATE_LIMIT_MAX',
    process.env.RATE_LIMIT_MAX ?? '5',
    1
  )
  const rateLimitWindowMs = parseInteger(
    'RATE_LIMIT_WINDOW_MS',
    process.env.RATE_LIMIT_WINDOW_MS ?? '600000',
    1000
  )

  const rawCorsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'

  if (rawCorsOrigin.trim() === '*') {
    return {
      nodeEnv: process.env.NODE_ENV ?? 'development',
      port,
      databaseUrl:
        process.env.TURSO_DATABASE_URL ?? process.env.DB_PATH ?? './data/app.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
      corsOrigins: '*',
      rateLimitMax,
      rateLimitWindowMs
    }
  }

  const corsOrigins = rawCorsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

  if (corsOrigins.length === 0) {
    throw new Error('Invalid CORS_ORIGIN: at least one origin is required')
  }

  for (const origin of corsOrigins) {
    try {
      new URL(origin)
    } catch {
      throw new Error(`Invalid CORS_ORIGIN entry: ${origin}`)
    }
  }

  const databaseUrl =
    process.env.TURSO_DATABASE_URL ?? process.env.DB_PATH ?? './data/app.db'

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
    corsOrigins,
    rateLimitMax,
    rateLimitWindowMs
  }
}
