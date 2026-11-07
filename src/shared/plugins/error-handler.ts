import { Elysia, ValidationError } from 'elysia'
import { AppError, RateLimitError } from '../errors'
import { fail } from '../response'
import { getRequestId } from './request-id'

type ErrorHandlerOptions = {
  rateLimitMax: number
  rateLimitWindowMs: number
}

export const errorHandler = ({
  rateLimitMax,
  rateLimitWindowMs
}: ErrorHandlerOptions) =>
  new Elysia({ name: 'error-handler' }).onError(
    { as: 'global' },
    ({ code, error, set, request }) => {
      const requestId = getRequestId(request)

      if (error instanceof RateLimitError) {
        // The rate-limit plugin throws before writing headers when it is
        // configured with an Error response. Report the full window as a
        // conservative Retry-After value.
        const retryAfter = Math.max(1, Math.ceil(rateLimitWindowMs / 1000))

        set.status = 429
        set.headers['RateLimit-Limit'] = String(rateLimitMax)
        set.headers['RateLimit-Remaining'] = '0'
        set.headers['RateLimit-Reset'] = String(retryAfter)
        set.headers['Retry-After'] = String(retryAfter)

        return fail(error.code, error.message, requestId, error.details)
      }

      if (error instanceof AppError) {
        set.status = error.status
        return fail(error.code, error.message, requestId, error.details)
      }

      if (error instanceof ValidationError) {
        set.status = 422
        return fail(
          'VALIDATION_ERROR',
          'Request body is invalid',
          requestId,
          error.all.map((issue) => ({
            path: issue.path ?? '',
            message: issue.message
          }))
        )
      }

      if (code === 'PARSE') {
        set.status = 400
        return fail(
          'INVALID_JSON',
          'Request body is not valid JSON',
          requestId
        )
      }

      if (code === 'NOT_FOUND') {
        set.status = 404
        return fail('NOT_FOUND', 'Route not found', requestId)
      }

      console.error(`[${requestId}]`, error)
      set.status = 500
      return fail('INTERNAL_ERROR', 'An unexpected error occurred', requestId)
    }
  )
