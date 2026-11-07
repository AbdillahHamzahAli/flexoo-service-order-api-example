import { createDb, type Db } from './client'
import { serviceTech, services, techStacks } from './schema'

/**
 * Fixed timestamps make the seed byte-for-byte deterministic: running it twice
 * leaves the same rows. Bump this when the seed content changes.
 */
const SEED_TIMESTAMP = '2026-01-01T00:00:00.000Z'

type ServiceSeed = {
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  startingPrice: number | null
  icon: string | null
  sortOrder: number
}

type TechSeed = {
  slug: string
  name: string
  category: string
  logoUrl: string | null
  websiteUrl: string | null
  sortOrder: number
}

export const SERVICE_SEEDS: ServiceSeed[] = [
  {
    slug: 'web-development',
    name: 'Web Development',
    tagline: 'Fast, accessible, production-ready web applications',
    description:
      'We design and build web applications end to end: marketing sites, dashboards, and customer portals. Every project ships with responsive UI, automated tests, and a deployment pipeline.',
    category: 'development',
    startingPrice: 15_000_000,
    icon: 'code',
    sortOrder: 1
  },
  {
    slug: 'mobile-app-development',
    name: 'Mobile App Development',
    tagline: 'Native-quality iOS and Android apps from one codebase',
    description:
      'From MVP to store release, we build cross-platform mobile apps with offline support, push notifications, and analytics. We handle store submission and post-launch maintenance.',
    category: 'development',
    startingPrice: 25_000_000,
    icon: 'smartphone',
    sortOrder: 2
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    tagline: 'Research-driven interfaces people can actually use',
    description:
      'We map user journeys, prototype flows, and produce a component-based design system that developers can implement without guesswork. Includes usability testing on the critical paths.',
    category: 'design',
    startingPrice: 8_000_000,
    icon: 'pen-tool',
    sortOrder: 3
  },
  {
    slug: 'backend-api-development',
    name: 'Backend & API Development',
    tagline: 'Reliable APIs and data models that scale with your product',
    description:
      'We build typed HTTP APIs, background jobs, and integrations with the tools you already use. Includes schema design, authentication, rate limiting, and observability from day one.',
    category: 'development',
    startingPrice: 12_000_000,
    icon: 'server',
    sortOrder: 4
  },
  {
    slug: 'devops-cloud',
    name: 'DevOps & Cloud',
    tagline: 'Ship safely with infrastructure you can reproduce',
    description:
      'Containerized deployments, CI/CD pipelines, environment management, and monitoring. We leave behind documentation and dashboards so your team can operate the system without us.',
    category: 'cloud',
    startingPrice: 10_000_000,
    icon: 'cloud',
    sortOrder: 5
  },
  {
    slug: 'qa-automation',
    name: 'QA Automation',
    tagline: 'Regression suites that catch problems before your users do',
    description:
      'We turn manual release checklists into fast automated tests across API and UI layers, wired into CI with clear failure reports. Includes test strategy, fixtures, and team training.',
    category: 'development',
    startingPrice: 7_000_000,
    icon: 'shield-check',
    sortOrder: 6
  }
]

export const TECH_SEEDS: TechSeed[] = [
  {
    slug: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    logoUrl: null,
    websiteUrl: 'https://nextjs.org',
    sortOrder: 1
  },
  {
    slug: 'vue',
    name: 'Vue',
    category: 'frontend',
    logoUrl: null,
    websiteUrl: 'https://vuejs.org',
    sortOrder: 2
  },
  {
    slug: 'nuxt',
    name: 'Nuxt',
    category: 'frontend',
    logoUrl: null,
    websiteUrl: 'https://nuxt.com',
    sortOrder: 3
  },
  {
    slug: 'react-native',
    name: 'React Native',
    category: 'mobile',
    logoUrl: null,
    websiteUrl: 'https://reactnative.dev',
    sortOrder: 4
  },
  {
    slug: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    logoUrl: null,
    websiteUrl: 'https://flutter.dev',
    sortOrder: 5
  },
  {
    slug: 'bun',
    name: 'Bun',
    category: 'backend',
    logoUrl: null,
    websiteUrl: 'https://bun.sh',
    sortOrder: 6
  },
  {
    slug: 'elysia',
    name: 'Elysia',
    category: 'backend',
    logoUrl: null,
    websiteUrl: 'https://elysiajs.com',
    sortOrder: 7
  },
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    logoUrl: null,
    websiteUrl: 'https://www.postgresql.org',
    sortOrder: 8
  },
  {
    slug: 'sqlite',
    name: 'SQLite',
    category: 'database',
    logoUrl: null,
    websiteUrl: 'https://www.sqlite.org',
    sortOrder: 9
  },
  {
    slug: 'docker',
    name: 'Docker',
    category: 'devops',
    logoUrl: null,
    websiteUrl: 'https://www.docker.com',
    sortOrder: 10
  },
  {
    slug: 'github-actions',
    name: 'GitHub Actions',
    category: 'devops',
    logoUrl: null,
    websiteUrl: 'https://github.com/features/actions',
    sortOrder: 11
  }
]

export const SERVICE_TECH_LINKS: Record<string, string[]> = {
  'web-development': [
    'nextjs',
    'vue',
    'nuxt',
    'bun',
    'elysia',
    'postgresql',
    'docker'
  ],
  'mobile-app-development': ['react-native', 'flutter', 'elysia', 'bun'],
  'ui-ux-design': ['nextjs', 'flutter'],
  'backend-api-development': [
    'bun',
    'elysia',
    'postgresql',
    'sqlite',
    'docker'
  ],
  'devops-cloud': ['docker', 'github-actions', 'postgresql'],
  'qa-automation': ['bun', 'github-actions', 'docker']
}

export function seed(db: Db): void {
  db.transaction((tx) => {
    for (const service of SERVICE_SEEDS) {
      tx.insert(services)
        .values({
          ...service,
          currency: 'IDR',
          isActive: true,
          createdAt: SEED_TIMESTAMP,
          updatedAt: SEED_TIMESTAMP
        })
        .onConflictDoUpdate({
          target: services.slug,
          set: {
            name: service.name,
            tagline: service.tagline,
            description: service.description,
            category: service.category,
            startingPrice: service.startingPrice,
            icon: service.icon,
            sortOrder: service.sortOrder,
            isActive: true,
            updatedAt: SEED_TIMESTAMP
          }
        })
        .run()
    }

    for (const tech of TECH_SEEDS) {
      tx.insert(techStacks)
        .values({ ...tech, isActive: true })
        .onConflictDoUpdate({
          target: techStacks.slug,
          set: {
            name: tech.name,
            category: tech.category,
            logoUrl: tech.logoUrl,
            websiteUrl: tech.websiteUrl,
            sortOrder: tech.sortOrder,
            isActive: true
          }
        })
        .run()
    }

    const serviceIds = new Map(
      tx
        .select({ id: services.id, slug: services.slug })
        .from(services)
        .all()
        .map((row) => [row.slug, row.id])
    )

    const techIds = new Map(
      tx
        .select({ id: techStacks.id, slug: techStacks.slug })
        .from(techStacks)
        .all()
        .map((row) => [row.slug, row.id])
    )

    const links: Array<{ serviceId: number; techId: number }> = []

    for (const [serviceSlug, techSlugs] of Object.entries(SERVICE_TECH_LINKS)) {
      const serviceId = serviceIds.get(serviceSlug)
      if (serviceId === undefined) {
        throw new Error(`Seed error: unknown service slug "${serviceSlug}"`)
      }

      for (const techSlug of techSlugs) {
        const techId = techIds.get(techSlug)
        if (techId === undefined) {
          throw new Error(`Seed error: unknown tech slug "${techSlug}"`)
        }
        links.push({ serviceId, techId })
      }
    }

    if (links.length > 0) {
      tx.insert(serviceTech).values(links).onConflictDoNothing().run()
    }
  })
}

if (import.meta.main) {
  const db = createDb(process.env.DB_PATH ?? './data/app.db')

  try {
    seed(db)
    console.log(
      `Seeded ${SERVICE_SEEDS.length} services, ${TECH_SEEDS.length} tech stacks, and ${Object.values(SERVICE_TECH_LINKS).flat().length} service/tech links.`
    )
  } finally {
    db.$client.close()
  }
}
