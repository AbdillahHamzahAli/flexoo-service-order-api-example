import { Elysia } from 'elysia'
import { getRequestId } from './request-id'

export type HttpLogEntry = {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  event: 'http_request'
  requestId: string
  method: string
  path: string
  statusCode: number
  durationMs: number
  error?: {
    name: string
    message: string
    stack?: string
  }
}

export type HttpLogger = (entry: HttpLogEntry) => void

const requestStarts = new WeakMap<Request, number>()
const requestErrors = new WeakMap<Request, unknown>()

function writeLog(entry: HttpLogEntry): void {
  const serialized = JSON.stringify(entry)

  if (entry.level === 'error') {
    console.error(serialized)
  } else if (entry.level === 'warn') {
    console.warn(serialized)
  } else {
    console.log(serialized)
  }
}

function errorDetails(error: unknown): HttpLogEntry['error'] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {})
    }
  }

  return {
    name: 'UnknownError',
    message: String(error)
  }
}

function levelForStatus(statusCode: number): HttpLogEntry['level'] {
  if (statusCode >= 500) return 'error'
  if (statusCode >= 400) return 'warn'
  return 'info'
}

function durationSince(startedAt: number | undefined): number {
  if (startedAt === undefined) return 0

  return Math.round((performance.now() - startedAt) * 100) / 100
}

export const requestLogger = (logger: HttpLogger = writeLog) =>
  new Elysia()
    .onRequest(({ request }) => {
      requestStarts.set(request, performance.now())
    })
    .onError(({ request, error }) => {
      requestErrors.set(request, error)
    })
    .onAfterResponse(({ request, response, set }) => {
      const responseStatus = response instanceof Response ? response.status : undefined
      const statusCode =
        responseStatus ?? (typeof set.status === 'number' ? set.status : 200)
      const entry: HttpLogEntry = {
        timestamp: new Date().toISOString(),
        level: levelForStatus(statusCode),
        event: 'http_request',
        requestId: getRequestId(request),
        method: request.method,
        path: new URL(request.url).pathname,
        statusCode,
        durationMs: durationSince(requestStarts.get(request))
      }

      if (entry.level === 'error') {
        entry.error = errorDetails(requestErrors.get(request))
      }

      logger(entry)
      requestStarts.delete(request)
      requestErrors.delete(request)
    })
    .as('global')
