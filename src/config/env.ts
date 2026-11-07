export type Env = {
  nodeEnv: string
  port: number
  dbPath: string
}

export function loadEnv(): Env {
  const port = Number(process.env.PORT ?? 3000)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT: must be an integer between 1 and 65535')
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    dbPath: process.env.DB_PATH ?? './data/app.db'
  }
}
