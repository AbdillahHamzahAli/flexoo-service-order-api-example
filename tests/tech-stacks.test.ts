import { describe, expect, it } from 'bun:test'
import { get, testApp, type ListBody } from './helpers/app'

type TechStackItem = {
  slug: string
  name: string
  category: string
  logoUrl: string | null
  websiteUrl: string | null
}

describe('GET /api/v1/tech-stacks', () => {
  it('returns the seeded tech stack without internal fields', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/tech-stacks')

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('public, max-age=300')

    const body = (await response.json()) as ListBody<TechStackItem>

    expect(body.data.length).toBe(11)

    for (const tech of body.data) {
      expect(typeof tech.slug).toBe('string')
      expect(typeof tech.name).toBe('string')
      expect(typeof tech.category).toBe('string')
      expect(tech).toHaveProperty('logoUrl')
      expect(tech).toHaveProperty('websiteUrl')
      expect(tech).not.toHaveProperty('id')
      expect(tech).not.toHaveProperty('isActive')
      expect(tech).not.toHaveProperty('sortOrder')
    }
  })

  it('filters tech stacks by category', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/tech-stacks?category=mobile')
    const body = (await response.json()) as ListBody<TechStackItem>

    expect(response.status).toBe(200)
    expect(body.data.map((tech) => tech.slug).sort()).toEqual([
      'flutter',
      'react-native'
    ])
  })

  it('returns an empty list for an unknown category', async () => {
    const { app } = await testApp()
    const response = await get(app, '/api/v1/tech-stacks?category=unknown')
    const body = (await response.json()) as ListBody<TechStackItem>

    expect(response.status).toBe(200)
    expect(body.data).toEqual([])
  })
})
