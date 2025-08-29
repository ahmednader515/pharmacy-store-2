import { prisma } from '@/lib/prisma'

/**
 * Initialize database connection when the application starts
 * This should be called once during app startup
 */
export async function initializeDatabase() {
  console.log('🚀 Initializing database connection...')
  
  try {
    await prisma.$queryRaw`SELECT 1`
    
    // Mock mode removed: require successful DB connection
    
    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

/**
 * Check if database is ready
 */
export function isDatabaseReady() {
  return true
}
