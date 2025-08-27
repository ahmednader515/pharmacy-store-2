import { connectToDatabase } from './index'

// Use global to ensure singleton across all modules
declare global {
  var __serverDbInitialized: boolean | undefined
}

// Initialize global variable
if (!global.__serverDbInitialized) {
  global.__serverDbInitialized = false
}

/**
 * Initialize database connection on the server side
 * This should be called once when the server starts
 */
export async function initializeServerDatabase() {
  if (global.__serverDbInitialized) {
    return true
  }

  console.log('🚀 Initializing server database connection...')
  
  try {
    const connection = await connectToDatabase()
    
    // Mock mode removed: require successful DB connection
    
    console.log('✅ Server database initialized successfully')
    global.__serverDbInitialized = true
    return true
  } catch (error) {
    console.error('❌ Server database initialization failed:', error)
    return false
  }
}

/**
 * Get database connection for server-side operations
 */
export async function getServerDatabase() {
  if (!global.__serverDbInitialized) {
    await initializeServerDatabase()
  }
  return connectToDatabase()
}
