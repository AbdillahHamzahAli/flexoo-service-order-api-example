import { t } from 'elysia'

export const techStackSchema = t.Object({
  slug: t.String(),
  name: t.String(),
  category: t.String(),
  logoUrl: t.Union([t.String(), t.Null()]),
  websiteUrl: t.Union([t.String(), t.Null()])
})

export const techStacksListResponse = t.Object({
  data: t.Array(techStackSchema)
})

export const techStacksQuery = t.Object({
  category: t.Optional(t.String({ maxLength: 40 }))
})

export type TechStackResponse = typeof techStackSchema.static
