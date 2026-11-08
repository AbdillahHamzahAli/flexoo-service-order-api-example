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
    '',
    async ({ body }) => {
      const inquiry = normalizeInquiry(body)
      const created = await repository.create({
        ...inquiry,
        status: 'new',
        createdAt: new Date().toISOString()
      })

      return status(201, ok(created))
    },
    {
      body: createContactBody,
      transform: ({ body }) => assertNoUnknownFields(body),
      response: { 201: contactCreatedResponse },
      detail: {
        tags: ['Contacts'],
        summary: 'Submit a project inquiry',
        description:
          'Creates a lead and returns its id. Rate limited per client IP.'
      }
    }
  )
}
