import { t } from 'elysia'
import { AppError } from '../../shared/errors'

export const createContactBody = t.Object(
  {
    firstName: t.String({ minLength: 1, maxLength: 80 }),
    lastName: t.Optional(t.String({ maxLength: 80 })),
    phone: t.String({ minLength: 7, maxLength: 20 }),
    companyName: t.String({ minLength: 1, maxLength: 120 }),
    companyEmail: t.String({ minLength: 3, maxLength: 254 }),
    description: t.String({ minLength: 20, maxLength: 5000 })
  },
  { additionalProperties: false }
)

export const contactCreatedResponse = t.Object({
  data: t.Object({
    id: t.Number(),
    createdAt: t.String()
  })
})

export type CreateContactBody = typeof createContactBody.static

const CONTACT_FIELDS = new Set(Object.keys(createContactBody.properties))

/**
 * Elysia's validator strips unknown properties instead of rejecting them, so
 * this runs as a transform (before validation) to enforce a strict contract.
 */
export function assertNoUnknownFields(body: unknown): void {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return
  }

  const unknown = Object.keys(body).filter((key) => !CONTACT_FIELDS.has(key))

  if (unknown.length > 0) {
    throw new AppError(
      422,
      'VALIDATION_ERROR',
      'Request body is invalid',
      unknown.map((key) => ({
        path: `/${key}`,
        message: 'is not allowed'
      }))
    )
  }
}

export type NormalizedInquiry = {
  firstName: string
  lastName: string | null
  phone: string
  companyName: string
  companyEmail: string
  description: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/

function invalid(path: string, message: string): never {
  throw new AppError(422, 'VALIDATION_ERROR', 'Request body is invalid', [
    { path, message }
  ])
}

function normalizePhone(input: string): string {
  let phone = input.replace(/[\s\-().]/g, '')

  if (phone.startsWith('0')) {
    phone = `+62${phone.slice(1)}`
  }

  if (!PHONE_PATTERN.test(phone)) {
    invalid('/phone', 'must be a valid phone number')
  }

  return phone
}

export function normalizeInquiry(body: CreateContactBody): NormalizedInquiry {
  const firstName = body.firstName.trim()
  if (firstName.length === 0) {
    invalid('/firstName', 'must not be blank')
  }

  const lastName = body.lastName?.trim()
  const companyName = body.companyName.trim()
  if (companyName.length === 0) {
    invalid('/companyName', 'must not be blank')
  }

  const companyEmail = body.companyEmail.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(companyEmail)) {
    invalid('/companyEmail', 'must be a valid email address')
  }

  const description = body.description.trim()
  if (description.length < 20) {
    invalid('/description', 'must be at least 20 characters after trimming')
  }

  return {
    firstName,
    lastName: lastName && lastName.length > 0 ? lastName : null,
    phone: normalizePhone(body.phone),
    companyName,
    companyEmail,
    description
  }
}
