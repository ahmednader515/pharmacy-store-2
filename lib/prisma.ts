import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use DATABASE_URL (Accelerate endpoint) at runtime
const accelerateUrl = process.env.DATABASE_URL

// Create a factory so we can infer the extended type
const createPrisma = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: accelerateUrl } },
  }).$extends(withAccelerate())

type PrismaAcceleratedClient = ReturnType<typeof createPrisma>

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaAcceleratedClient | undefined
}

const prismaClient: PrismaAcceleratedClient = global.__prisma__ ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prismaClient
}

export const prisma = prismaClient
