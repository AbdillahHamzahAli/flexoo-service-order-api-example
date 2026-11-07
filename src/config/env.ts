export type AppEnv = {
  corsOrigins: string[]
  rateLimitMax: number
  rateLimitWindowMs: number
}

export type Env = AppEnv & {
  nodeEnv: string
  port: number
  dbPath: string
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

  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
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

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    dbPath: process.env.DB_PATH ?? './data/app.db',
    corsOrigins,
    rateLimitMax,
    rateLimitWindowMs
  }
}
