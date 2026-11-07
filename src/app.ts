import { Elysia } from 'elysia'
import type { Db } from './db/client'
import { inquiriesRoutes } from './modules/inquiries/inquiries.routes'
import { servicesRoutes } from './modules/services/services.routes'
import { techStacksRoutes } from './modules/tech-stacks/tech-stacks.routes'
import { errorHandler } from './shared/plugins/error-handler'
import { requestId } from './shared/plugins/request-id'

export function createApp(db: Db) {
  return new Elysia({ prefix: '/api/v1' })
    .use(requestId())
    .use(errorHandler())
    .use(servicesRoutes(db))
    .use(techStacksRoutes(db))
    .use(inquiriesRoutes(db))
}
