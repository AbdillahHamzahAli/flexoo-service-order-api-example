import { and, asc, eq } from 'drizzle-orm'
import type { Db } from '../../db/client'
import { techStacks } from '../../db/schema'
import type { TechStackResponse } from './tech-stacks.model'

type FindAllOptions = {
  category?: string
}

export function createTechStacksRepository(db: Db) {
  return {
    async findAll({
      category
    }: FindAllOptions): Promise<TechStackResponse[]> {
      const filters = [eq(techStacks.isActive, true)]
      if (category) filters.push(eq(techStacks.category, category))

      return await db
        .select({
          slug: techStacks.slug,
          name: techStacks.name,
          category: techStacks.category,
          logoUrl: techStacks.logoUrl,
          websiteUrl: techStacks.websiteUrl
        })
        .from(techStacks)
        .where(and(...filters))
        .orderBy(asc(techStacks.sortOrder), asc(techStacks.slug))
        .all()
    }
  }
}
