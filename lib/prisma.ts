import { PrismaClient } from '@prisma/client'

// Two Prisma clients:
// - prisma: pooled (DATABASE_URL) for most queries, safe for serverless
// - prismaDirect: direct (DIRECT_DATABASE_URL) for heavy read queries to avoid pool limits

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __prismaDirect__: PrismaClient | undefined
}

const pooledUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

// Pooled client (default)
const prismaClient = global.__prisma__ ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: { db: { url: pooledUrl } },
})

// Direct client for heavy queries
const prismaDirectClient = global.__prismaDirect__ ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: { db: { url: directUrl } },
})

// Cache in dev to prevent hot-reload duplication
if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prismaClient
  global.__prismaDirect__ = prismaDirectClient
}

export const prisma = prismaClient
export const prismaDirect = prismaDirectClient
