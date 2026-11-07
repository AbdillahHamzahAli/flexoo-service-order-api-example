import { describe, expect, it } from 'bun:test'
import { get, request, testApp, type ErrorBody } from './helpers/app'

describe('application shell', () => {
  it('sets x-request-id on successful responses', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services')

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toMatch(/^req_/)
  })

  it('returns NOT_FOUND for unknown routes', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/nope')

    expect(response.status).toBe(404)

    const body = (await response.json()) as ErrorBody
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('allows the configured CORS origin', async () => {
    const { app } = await testApp()
    const response = await request(app, '/api/v1/services', {
      headers: { origin: 'http://localhost:3000' }
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3000'
    )
  })

  it('does not allow other CORS origins', async () => {
    const { app } = await testApp()
    const response = await request(app, '/api/v1/services', {
      headers: { origin: 'http://evil.example' }
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('answers CORS preflight for the contacts endpoint', async () => {
    const { app } = await testApp()
    const response = await request(app, '/api/v1/contacts', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type'
      }
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3000'
    )
    expect(response.headers.get('access-control-allow-methods')).toContain(
      'POST'
    )
  })

  it('serves OpenAPI with the three public paths', async () => {
    const { app } = await testApp()
    const response = await get(app, '/docs/json')

    expect(response.status).toBe(200)

    const document = (await response.json()) as {
      paths: Record<string, unknown>
    }

    expect(Object.keys(document.paths).sort()).toEqual([
      '/api/v1/contacts',
      '/api/v1/services',
      '/api/v1/tech-stacks'
    ])
  })
})
