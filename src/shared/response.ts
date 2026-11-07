export type ErrorDetail = {
  path: string
  message: string
}

export type SuccessResponse<T> = {
  data: T
}

export type ErrorResponse = {
  error: {
    code: string
    message: string
    details?: ErrorDetail[]
    requestId: string
  }
}

export function ok<T>(data: T): SuccessResponse<T> {
  return { data }
}

export function fail(
  code: string,
  message: string,
  requestId: string,
  details?: ErrorDetail[]
): ErrorResponse {
  const error: ErrorResponse['error'] = {
    code,
    message,
    requestId
  }

  if (details && details.length > 0) {
    error.details = details
  }

  return { error }
}
