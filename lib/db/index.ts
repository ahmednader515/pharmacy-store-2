import { loadEnvFromFile } from '../env-loader'
import { prisma, prismaDirect } from '@/lib/prisma'

// Backward compatible re-export so legacy imports from '@/lib/db' keep working
export { prisma } from '@/lib/prisma'

// Load environment variables from .env file first
loadEnvFromFile()

// Extend globalThis for better TypeScript support
// Prisma is provided by lib/prisma singleton

export const connectToDatabase = async (
  DATABASE_URL = process.env.DATABASE_URL
) => {
  console.log('🔌 Attempting database connection...')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('DATABASE_URL exists:', !!DATABASE_URL)
  
  // Require DATABASE_URL in all environments
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please configure your environment variables.')
  }

  try {
    // Do not open a new connection per call; Prisma lazily manages connections.
    return { prisma, isMock: false }
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error)
    throw error
  }
}

export const clearDatabaseCache = () => {
  console.log('🔄 Database cache cleared (Prisma handles connection pooling)')
}

export const forceRefreshDatabaseConnection = async () => {
  console.log('🔄 Force refreshing database connection...')
  try {
    await prisma.$disconnect()
    return connectToDatabase()
  } catch (error) {
    console.error('Failed to refresh database connection:', error)
    return { isMock: true, prisma: null }
  }
}

export const isUsingMockData = () => false

export const closeGlobalPrisma = async () => {
  console.log('🔌 Closing Prisma client...')
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error closing Prisma client:', error)
  }
}

// Export initialization functions
export { initializeDatabase } from './init'
export { prisma, prismaDirect } from '@/lib/prisma'
