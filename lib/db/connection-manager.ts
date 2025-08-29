import { prisma } from '@/lib/prisma'

// Connection pool monitoring
let activeConnections = 0
let totalQueries = 0
let failedQueries = 0

export const connectionStats = {
  getActiveConnections: () => activeConnections,
  getTotalQueries: () => totalQueries,
  getFailedQueries: () => failedQueries,
  getSuccessRate: () => totalQueries > 0 ? ((totalQueries - failedQueries) / totalQueries) * 100 : 100
}

// Wrapper function to monitor database operations
export async function withConnectionMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string = 'database_operation'
): Promise<T> {
  activeConnections++
  totalQueries++
  
  try {
    const startTime = Date.now()
    const result = await operation()
    const duration = Date.now() - startTime
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${operationName} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    failedQueries++
    console.error(`Database operation failed: ${operationName}`, error)
    throw error
  } finally {
    activeConnections--
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  stats: typeof connectionStats
}> {
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    if (responseTime < 100) {
      return {
        status: 'healthy',
        message: `Database responding normally (${responseTime}ms)`,
        stats: connectionStats
      }
    } else if (responseTime < 1000) {
      return {
        status: 'degraded',
        message: `Database responding slowly (${responseTime}ms)`,
        stats: connectionStats
      }
    } else {
      return {
        status: 'unhealthy',
        message: `Database responding very slowly (${responseTime}ms)`,
        stats: connectionStats
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats: connectionStats
    }
  }
}

// Connection pool management
export async function resetConnectionPool(): Promise<void> {
  try {
    console.log('Resetting database connection pool...')
    await prisma.$disconnect()
    
    // Wait a bit before reconnecting
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // The prisma client will automatically reconnect on next use
    console.log('Database connection pool reset complete')
  } catch (error) {
    console.error('Failed to reset connection pool:', error)
  }
}

// Graceful shutdown
export async function shutdownDatabase(): Promise<void> {
  try {
    console.log('Shutting down database connections...')
    await prisma.$disconnect()
    console.log('Database connections closed successfully')
  } catch (error) {
    console.error('Error during database shutdown:', error)
  }
}

// Auto-reset connection pool if too many failed queries
let lastResetTime = 0
const RESET_THRESHOLD = 10 // Reset if 10+ failed queries
const RESET_COOLDOWN = 60000 // Wait 1 minute between resets

export function shouldResetConnectionPool(): boolean {
  const now = Date.now()
  if (failedQueries >= RESET_THRESHOLD && (now - lastResetTime) > RESET_COOLDOWN) {
    lastResetTime = now
    return true
  }
  return false
}

// Monitor and auto-reset if needed
setInterval(async () => {
  if (shouldResetConnectionPool()) {
    console.log('Auto-resetting connection pool due to high failure rate')
    await resetConnectionPool()
    // Reset counters
    failedQueries = 0
    totalQueries = 0
  }
}, 30000) // Check every 30 seconds
