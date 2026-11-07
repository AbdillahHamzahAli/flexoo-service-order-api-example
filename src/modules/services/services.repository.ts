import { and, asc, eq } from 'drizzle-orm'
import type { Db } from '../../db/client'
import { serviceTech, services, techStacks } from '../../db/schema'
import type { ServiceResponse, ServiceTechItem } from './services.model'

type FindAllOptions = {
  category?: string
  includeTech?: boolean
}

export function createServicesRepository(db: Db) {
  return {
    findAll({ category, includeTech }: FindAllOptions): ServiceResponse[] {
      const filters = [eq(services.isActive, true)]
      if (category) filters.push(eq(services.category, category))

      const rows = db
        .select({
          id: services.id,
          slug: services.slug,
          name: services.name,
          tagline: services.tagline,
          description: services.description,
          category: services.category,
          startingPrice: services.startingPrice,
          currency: services.currency,
          icon: services.icon
        })
        .from(services)
        .where(and(...filters))
        .orderBy(asc(services.sortOrder), asc(services.slug))
        .all()

      if (!includeTech) {
        return rows.map(({ id: _id, ...service }) => service)
      }

      const techRows = db
        .select({
          serviceId: serviceTech.serviceId,
          slug: techStacks.slug,
          name: techStacks.name,
          category: techStacks.category
        })
        .from(serviceTech)
        .innerJoin(techStacks, eq(serviceTech.techId, techStacks.id))
        .where(eq(techStacks.isActive, true))
        .orderBy(asc(techStacks.sortOrder), asc(techStacks.slug))
        .all()

      const techByService = new Map<number, ServiceTechItem[]>()

      for (const { serviceId, ...tech } of techRows) {
        const list = techByService.get(serviceId) ?? []
        list.push(tech)
        techByService.set(serviceId, list)
      }

      return rows.map(({ id, ...service }) => ({
        ...service,
        tech: techByService.get(id) ?? []
      }))
    }
  }
}
