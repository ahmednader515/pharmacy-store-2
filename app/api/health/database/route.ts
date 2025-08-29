import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db/connection-manager'

export async function GET() {
  try {
    const health = await checkDatabaseHealth()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: health,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }, {
      status: health.status === 'healthy' ? 200 : 
              health.status === 'degraded' ? 200 : 503
    })
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check database health',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
