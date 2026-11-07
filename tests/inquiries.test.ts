import { describe, expect, it } from 'bun:test'
import type { Db } from '../src/db/client'
import {
  get,
  postJson,
  postRaw,
  testApp,
  validInquiry,
  type ErrorBody
} from './helpers/app'

type ContactCreatedBody = {
  data: {
    id: number
    createdAt: string
  }
}

type InquiryRow = {
  id: number
  first_name: string
  last_name: string | null
  phone: string
  company_name: string
  company_email: string
  description: string
  status: string
}

function getInquiry(db: Db, id: number): InquiryRow | null {
  return db.$client
    .query(
      `select id, first_name, last_name, phone, company_name, company_email,
              description, status
       from project_inquiries
       where id = ?`
    )
    .get(id) as InquiryRow | null
}

function countInquiries(db: Db): number {
  const row = db.$client
    .query('select count(*) as count from project_inquiries')
    .get() as { count: number }

  return row.count
}

describe('POST /api/v1/contacts', () => {
  it('creates an inquiry and persists it with status new', async () => {
    const { app, db } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', validInquiry)

    expect(response.status).toBe(201)

    const body = (await response.json()) as ContactCreatedBody
    expect(typeof body.data.id).toBe('number')
    expect(body.data.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    )

    const row = getInquiry(db, body.data.id)
    expect(row).not.toBeNull()
    expect(row?.first_name).toBe('Budi')
    expect(row?.company_email).toBe('budi@contoh.co.id')
    expect(row?.status).toBe('new')
  })

  it('normalizes names, email, and phone before storing', async () => {
    const { app, db } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      firstName: '  Budi  ',
      companyName: '  PT Contoh Digital  ',
      companyEmail: '  Budi@Contoh.CO.ID  ',
      phone: '0812-3456-7890'
    })

    expect(response.status).toBe(201)

    const body = (await response.json()) as ContactCreatedBody
    const row = getInquiry(db, body.data.id)

    expect(row?.first_name).toBe('Budi')
    expect(row?.company_name).toBe('PT Contoh Digital')
    expect(row?.company_email).toBe('budi@contoh.co.id')
    expect(row?.phone).toBe('+6281234567890')
  })

  it('stores null when lastName is omitted', async () => {
    const { app, db } = await testApp()
    const { lastName: _lastName, ...withoutLastName } = validInquiry
    const response = await postJson(
      app,
      '/api/v1/contacts',
      withoutLastName
    )

    expect(response.status).toBe(201)

    const body = (await response.json()) as ContactCreatedBody
    const row = getInquiry(db, body.data.id)
    expect(row?.last_name).toBeNull()
  })

  it('rejects a missing required field', async () => {
    const { app } = await testApp()
    const { firstName: _firstName, ...withoutFirstName } = validInquiry
    const response = await postJson(
      app,
      '/api/v1/contacts',
      withoutFirstName
    )

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/firstName')
    ).toBe(true)
    expect(response.headers.get('x-request-id')).toBe(body.error.requestId)
  })

  it('rejects unknown fields', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      foo: 'bar'
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/foo')
    ).toBe(true)
  })

  it('rejects an invalid email', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      companyEmail: 'not-an-email'
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/companyEmail')
    ).toBe(true)
  })

  it('rejects an invalid phone number', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      phone: 'abcdefgh'
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/phone')
    ).toBe(true)
  })

  it('rejects a description shorter than 20 characters', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      description: 'too short'
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/description')
    ).toBe(true)
  })

  it('rejects a description longer than 5,000 characters', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      description: 'a'.repeat(5_001)
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/description')
    ).toBe(true)
  })

  it('rejects a blank first name after trimming', async () => {
    const { app } = await testApp()
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      firstName: '   '
    })

    expect(response.status).toBe(422)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(
      body.error.details?.some((detail) => detail.path === '/firstName')
    ).toBe(true)
  })

  it('returns 400 for malformed JSON', async () => {
    const { app } = await testApp()
    const response = await postRaw(app, '/api/v1/contacts', '{broken')

    expect(response.status).toBe(400)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('INVALID_JSON')
  })

  it('stores SQL metacharacters verbatim without executing them', async () => {
    const { app, db } = await testApp()
    const description =
      "Please build ' OR 1=1; DROP TABLE project_inquiries; -- a portal."
    const response = await postJson(app, '/api/v1/contacts', {
      ...validInquiry,
      description
    })

    expect(response.status).toBe(201)

    const body = (await response.json()) as ContactCreatedBody
    const row = getInquiry(db, body.data.id)

    expect(row?.description).toBe(description)
    expect(countInquiries(db)).toBe(1)

    const table = db.$client
      .query(
        "select name from sqlite_master where type = 'table' and name = 'project_inquiries'"
      )
      .get()

    expect(table).not.toBeNull()
  })

  it('rate limits the sixth request in a window', async () => {
    const { app } = await testApp({ rateLimitMax: 5 })
    const statuses: number[] = []
    let limitedResponse: Response | undefined

    for (let attempt = 1; attempt <= 6; attempt++) {
      const response = await postJson(
        app,
        '/api/v1/contacts',
        validInquiry
      )
      statuses.push(response.status)

      if (attempt === 6) {
        limitedResponse = response
      }
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429])
    expect(limitedResponse?.headers.get('retry-after')).toBe('600')

    const body = (await limitedResponse?.json()) as ErrorBody
    expect(body.error.code).toBe('RATE_LIMITED')
    expect(limitedResponse?.headers.get('x-request-id')).toBe(
      body.error.requestId
    )

    const list = await get(app, '/api/v1/services')
    expect(list.status).toBe(200)
  })
})
