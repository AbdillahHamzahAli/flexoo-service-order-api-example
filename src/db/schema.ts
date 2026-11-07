import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core'

export const services = sqliteTable(
  'services',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    startingPrice: integer('starting_price'),
    currency: text('currency').notNull().default('IDR'),
    icon: text('icon'),
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [index('services_active_sort_idx').on(t.isActive, t.sortOrder)]
)

export const techStacks = sqliteTable(
  'tech_stacks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    logoUrl: text('logo_url'),
    websiteUrl: text('website_url'),
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(true),
    sortOrder: integer('sort_order').notNull().default(0)
  },
  (t) => [index('tech_stacks_category_idx').on(t.category)]
)

export const serviceTech = sqliteTable(
  'service_tech',
  {
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    techId: integer('tech_id')
      .notNull()
      .references(() => techStacks.id, { onDelete: 'cascade' })
  },
  (t) => [
    primaryKey({ columns: [t.serviceId, t.techId] }),
    index('service_tech_tech_idx').on(t.techId)
  ]
)

export const projectInquiries = sqliteTable(
  'project_inquiries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    phone: text('phone').notNull(),
    companyName: text('company_name').notNull(),
    companyEmail: text('company_email').notNull(),
    description: text('description').notNull(),
    status: text('status').notNull().default('new'),
    source: text('source'),
    createdAt: text('created_at').notNull()
  },
  (t) => [
    index('inquiries_created_idx').on(t.createdAt),
    index('inquiries_email_idx').on(t.companyEmail),
    check(
      'project_inquiries_status_check',
      sql`${t.status} in ('new', 'contacted', 'qualified', 'archived')`
    )
  ]
)

export const servicesRelations = relations(services, ({ many }) => ({
  serviceTech: many(serviceTech)
}))

export const techStacksRelations = relations(techStacks, ({ many }) => ({
  serviceTech: many(serviceTech)
}))

export const serviceTechRelations = relations(serviceTech, ({ one }) => ({
  service: one(services, {
    fields: [serviceTech.serviceId],
    references: [services.id]
  }),
  tech: one(techStacks, {
    fields: [serviceTech.techId],
    references: [techStacks.id]
  })
}))

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
export type TechStack = typeof techStacks.$inferSelect
export type NewTechStack = typeof techStacks.$inferInsert
export type ServiceTech = typeof serviceTech.$inferSelect
export type ProjectInquiry = typeof projectInquiries.$inferSelect
export type NewProjectInquiry = typeof projectInquiries.$inferInsert
