import { describe, expect, it } from 'bun:test'
import { get, testApp, type ListBody } from './helpers/app'

type ServiceItem = {
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  startingPrice: number | null
  currency: string
  icon: string | null
  tech?: Array<{ slug: string; name: string; category: string }>
}

function findService(data: ServiceItem[], slug: string): ServiceItem {
  const service = data.find((item) => item.slug === slug)

  if (!service) {
    throw new Error(`Test setup error: service "${slug}" is not seeded`)
  }

  return service
}

describe('GET /api/v1/services', () => {
  it('returns the seeded catalogue without internal fields', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services')

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('public, max-age=300')

    const body = (await response.json()) as ListBody<ServiceItem>

    expect(body.data.length).toBe(6)

    for (const service of body.data) {
      expect(typeof service.slug).toBe('string')
      expect(typeof service.name).toBe('string')
      expect(typeof service.tagline).toBe('string')
      expect(typeof service.category).toBe('string')
      expect(service.currency).toBe('IDR')
      expect(service).not.toHaveProperty('id')
      expect(service).not.toHaveProperty('createdAt')
      expect(service).not.toHaveProperty('updatedAt')
      expect(service).not.toHaveProperty('isActive')
      expect(service).not.toHaveProperty('sortOrder')
    }
  })

  it('filters services by category', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services?category=development')
    const body = (await response.json()) as ListBody<ServiceItem>

    expect(response.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)

    for (const service of body.data) {
      expect(service.category).toBe('development')
    }
  })

  it('returns an empty list for an unknown category', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services?category=unknown')
    const body = (await response.json()) as ListBody<ServiceItem>

    expect(response.status).toBe(200)
    expect(body.data).toEqual([])
  })

  it('embeds tech when include=tech is requested', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services?include=tech')
    const body = (await response.json()) as ListBody<ServiceItem>

    expect(response.status).toBe(200)

    for (const service of body.data) {
      expect(Array.isArray(service.tech)).toBe(true)
    }

    const web = findService(body.data, 'web-development')
    expect(web.tech?.map((tech) => tech.slug)).toContain('nextjs')
    expect(web.tech?.map((tech) => tech.slug)).toContain('postgresql')
  })

  it('omits tech when include is not requested', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/services')
    const body = (await response.json()) as ListBody<ServiceItem>

    for (const service of body.data) {
      expect('tech' in service).toBe(false)
    }
  })
})
