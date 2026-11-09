import { describe, expect, it } from 'bun:test'
import type { HttpLogEntry } from '../src/shared/plugins/request-logger'
import { get, request, testApp, type ErrorBody } from './helpers/app'

describe('application shell', () => {
  it('sets x-request-id on successful responses', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services')

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toMatch(/^req_/)
  })

  it('writes a structured access log for every response', async () => {
    const logs: HttpLogEntry[] = []
    const { app } = await testApp({ logger: (entry) => logs.push(entry) })
    const response = await get(app, '/api/v1/services')
    await Bun.sleep(0)

    expect(response.status).toBe(200)
    expect(logs).toHaveLength(1)

    const [log] = logs
    expect(log).toMatchObject({
      level: 'info',
      event: 'http_request',
      method: 'GET',
      path: '/api/v1/services',
      statusCode: 200,
      requestId: response.headers.get('x-request-id')
    })
    expect(log.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    )
    expect(log.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('uses warn level for client errors without logging request data', async () => {
    const logs: HttpLogEntry[] = []
    const { app } = await testApp({ logger: (entry) => logs.push(entry) })
    const response = await get(app, '/api/v1/nope?email=private@example.com')
    await Bun.sleep(0)

    expect(response.status).toBe(404)
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      level: 'warn',
      method: 'GET',
      path: '/api/v1/nope',
      statusCode: 404
    })
    expect(JSON.stringify(logs[0])).not.toContain('private@example.com')
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

  it('allows every origin when wildcard CORS is configured', async () => {
    const { app } = await testApp({ corsOrigins: '*' })
    const response = await request(app, '/api/v1/services', {
      headers: { origin: 'https://any-site.example' }
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
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
