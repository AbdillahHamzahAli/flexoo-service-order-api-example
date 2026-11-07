import { Elysia, ValidationError } from 'elysia'
import { AppError } from '../errors'
import { fail } from '../response'
import { getRequestId } from './request-id'

export const errorHandler = () =>
  new Elysia({ name: 'error-handler' }).onError(
    { as: 'global' },
    ({ code, error, set, request }) => {
      const requestId = getRequestId(request)

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
