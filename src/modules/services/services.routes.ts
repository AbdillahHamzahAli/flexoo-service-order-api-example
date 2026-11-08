import { Elysia } from 'elysia'
import type { Db } from '../../db/client'
import { ok } from '../../shared/response'
import { servicesListResponse, servicesQuery } from './services.model'
import { createServicesRepository } from './services.repository'

export const servicesRoutes = (db: Db) => {
  const repository = createServicesRepository(db)

  return new Elysia({ name: 'services-routes', prefix: '/services' }).get(
    '',
    async ({ query, set }) => {
      const data = await repository.findAll({
        category: query.category,
        includeTech: query.include === 'tech'
      })

      set.headers['cache-control'] = 'public, max-age=300'
      return ok(data)
    },
    {
      query: servicesQuery,
      response: { 200: servicesListResponse },
      detail: {
        tags: ['Services'],
        summary: 'List services',
        description:
          'Returns active services. Use include=tech to embed each service tech stack.'
      }
    }
  )
}
