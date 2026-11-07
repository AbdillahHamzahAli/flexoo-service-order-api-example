import { randomUUID } from 'node:crypto'
import { Elysia } from 'elysia'

const requestIds = new WeakMap<Request, string>()

export function getRequestId(request: Request): string {
  const existing = requestIds.get(request)
  if (existing) return existing

  const id = `req_${randomUUID()}`
  requestIds.set(request, id)
  return id
}

export const requestId = () =>
  new Elysia({ name: 'request-id' })
    .onRequest(({ request, set }) => {
      set.headers['x-request-id'] = getRequestId(request)
    })
    .derive({ as: 'global' }, ({ request }) => ({
      requestId: getRequestId(request)
    }))
