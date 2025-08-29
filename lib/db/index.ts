import { PrismaClient } from '@prisma/client'

// Database connection configuration
let DATABASE_URL = process.env.DATABASE_URL

// Fallback to local database if DATABASE_URL is not set
if (!DATABASE_URL) {
  DATABASE_URL = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
}

console.log('DATABASE_URL exists:', !!DATABASE_URL)

// Require DATABASE_URL in all environments
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please configure your environment variables.')
}

// Create a single Prisma instance with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  // Connection pool settings
  __internal: {
    engine: {
      connectionLimit: 5,
      pool: {
        min: 1,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      }
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

// Utility function to fetch products for multiple categories efficiently
export async function getProductsForMultipleCategories(categories: string[]) {
  try {
    // Use a single query to get all products for all categories
    const allProducts = await prisma.product.findMany({
      where: {
        category: { in: categories },
        isPublished: true,
      },
      orderBy: [
        { numSales: 'desc' },
        { avgRating: 'desc' }
      ],
      select: {
        name: true,
        slug: true,
        images: true,
        price: true,
        listPrice: true,
        avgRating: true,
        numReviews: true,
        category: true,
      }
    })

    // Group products by category
    const productsByCategory = categories.reduce((acc, category) => {
      acc[category] = allProducts
        .filter(product => product.category === category)
        .slice(0, 8) // Limit to 8 products per category
        .map(product => ({
          name: product.name,
          slug: product.slug,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
          images: Array.isArray(product.images) ? product.images : [],
          price: Number(product.price),
          listPrice: Number(product.listPrice),
          avgRating: Number(product.avgRating),
          numReviews: Number(product.numReviews),
        }))
      return acc
    }, {} as Record<string, any[]>)

    return productsByCategory
  } catch (error) {
    console.error('Error fetching products for multiple categories:', error)
    // Return empty object with all categories
    return categories.reduce((acc, category) => {
      acc[category] = []
      return acc
    }, {} as Record<string, any[]>)
  }
}
