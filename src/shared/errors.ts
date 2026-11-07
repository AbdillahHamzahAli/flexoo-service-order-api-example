import type { ErrorDetail } from './response'

export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: ErrorDetail[]

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ErrorDetail[]
  ) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}
