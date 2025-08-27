import { PrismaClient } from '@prisma/client'

// Ensure global typing for prisma on Node.js
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
}

// Create a single PrismaClient instance in all environments
const prismaClient = global.__prisma__ ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// In development, persist the client on the global object to survive HMR
if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prismaClient
}

export const prisma = prismaClient
