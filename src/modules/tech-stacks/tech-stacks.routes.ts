import { Elysia } from 'elysia'
import type { Db } from '../../db/client'
import { ok } from '../../shared/response'
import { techStacksListResponse, techStacksQuery } from './tech-stacks.model'
import { createTechStacksRepository } from './tech-stacks.repository'

export const techStacksRoutes = (db: Db) => {
  const repository = createTechStacksRepository(db)

  return new Elysia({
    name: 'tech-stacks-routes',
    prefix: '/tech-stacks'
  }).get(
    '/',
    ({ query, set }) => {
      const data = repository.findAll({ category: query.category })

      set.headers['cache-control'] = 'public, max-age=300'
      return ok(data)
    },
    {
      query: techStacksQuery,
      response: { 200: techStacksListResponse }
    }
  )
}
