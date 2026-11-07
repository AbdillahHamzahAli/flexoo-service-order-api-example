import { t } from 'elysia'

export const serviceTechItemSchema = t.Object({
  slug: t.String(),
  name: t.String(),
  category: t.String()
})

export const serviceSchema = t.Object({
  slug: t.String(),
  name: t.String(),
  tagline: t.String(),
  description: t.String(),
  category: t.String(),
  startingPrice: t.Union([t.Number(), t.Null()]),
  currency: t.String(),
  icon: t.Union([t.String(), t.Null()]),
  tech: t.Optional(t.Array(serviceTechItemSchema))
})

export const servicesListResponse = t.Object({
  data: t.Array(serviceSchema)
})

export const servicesQuery = t.Object({
  category: t.Optional(t.String({ maxLength: 40 })),
  include: t.Optional(t.Literal('tech'))
})

export type ServiceTechItem = typeof serviceTechItemSchema.static
export type ServiceResponse = typeof serviceSchema.static
export type ServicesQuery = typeof servicesQuery.static
