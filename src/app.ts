import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import type { AppEnv } from './config/env'
import type { Db } from './db/client'
import { inquiriesRoutes } from './modules/inquiries/inquiries.routes'
import { servicesRoutes } from './modules/services/services.routes'
import { techStacksRoutes } from './modules/tech-stacks/tech-stacks.routes'
import { RateLimitError } from './shared/errors'
import { errorHandler } from './shared/plugins/error-handler'
import { requestId } from './shared/plugins/request-id'

type CreateAppOptions = {
  db: Db
  env: AppEnv
}

const API_PREFIX = '/api/v1'
const CONTACTS_PATH = `${API_PREFIX}/contacts`

export function createApp({ db, env }: CreateAppOptions) {
  const api = new Elysia({ name: 'api', prefix: API_PREFIX })
    .use(servicesRoutes(db))
    .use(techStacksRoutes(db))
    .use(inquiriesRoutes(db))

  return new Elysia({ name: 'app' })
    .use(requestId())
    .use(
      errorHandler({
        rateLimitMax: env.rateLimitMax,
        rateLimitWindowMs: env.rateLimitWindowMs
      })
    )
    .use(
      rateLimit({
        scoping: 'global',
        max: env.rateLimitMax,
        duration: env.rateLimitWindowMs,
        errorResponse: new RateLimitError(),
        generator: (request, server) =>
          server?.requestIP(request)?.address ?? 'local',
        skip: (request) => {
          const pathname = new URL(request.url).pathname.replace(/\/+$/, '')
          return !(request.method === 'POST' && pathname === CONTACTS_PATH)
        }
      })
    )
    .use(
      cors({
        origin: env.corsOrigins,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        credentials: false,
        maxAge: 86400
      })
    )
    .use(
      swagger({
        path: '/docs',
        documentation: {
          info: {
            title: 'Flexoo Service Order API',
            version: '1.0.0',
            description:
              'Public API for the Flexoo software house: services, tech stack, and project inquiries.'
          },
          tags: [
            { name: 'Services', description: 'Service catalogue' },
            { name: 'Tech Stacks', description: 'Technology stack' },
            { name: 'Contacts', description: 'Project inquiries' }
          ]
        }
      })
    )
    .use(api)
}
