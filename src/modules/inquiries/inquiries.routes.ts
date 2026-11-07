import { Elysia, status } from 'elysia'
import type { Db } from '../../db/client'
import { ok } from '../../shared/response'
import {
  assertNoUnknownFields,
  contactCreatedResponse,
  createContactBody,
  normalizeInquiry
} from './inquiries.model'
import { createInquiriesRepository } from './inquiries.repository'

export const inquiriesRoutes = (db: Db) => {
  const repository = createInquiriesRepository(db)

  return new Elysia({ name: 'inquiries-routes', prefix: '/contacts' }).post(
    '/',
    ({ body }) => {
      const inquiry = normalizeInquiry(body)
      const created = repository.create({
        ...inquiry,
        status: 'new',
        createdAt: new Date().toISOString()
      })

      return status(201, ok(created))
    },
    {
      body: createContactBody,
      transform: ({ body }) => assertNoUnknownFields(body),
      response: { 201: contactCreatedResponse }
    }
  )
}
