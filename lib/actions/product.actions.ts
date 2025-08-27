'use server'

import { prisma } from '@/lib/db'
import data from '@/lib/data'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { IProductInput } from '@/types'
import { z } from 'zod'

// Cache for categories to avoid repeated database calls
let categoriesCache: string[] | null = null
let categoriesCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Simple cache function for frequently accessed data
const getCachedData = <T>(cacheKey: string, fetchFn: () => Promise<T>, duration = CACHE_DURATION): T | null => {
  const cache = (global as any).__cache || {}
  const now = Date.now()
  
  if (cache[cacheKey] && (now - cache[cacheKey].time) < duration) {
    return cache[cacheKey].data
  }
  
  return null
}

const setCachedData = <T>(cacheKey: string, data: T): void => {
  const cache = (global as any).__cache || {}
  cache[cacheKey] = { data, time: Date.now() }
  ;(global as any).__cache = cache
}

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data)
    // Always use database
    
    const { reviews, ...productData } = product
    await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        category: productData.category,
        images: productData.images,
        brand: productData.brand,
        description: productData.description,
        price: product.price,
        listPrice: product.listPrice,
        countInStock: productData.countInStock,
        tags: productData.tags,
        colors: productData.colors,
        sizes: productData.sizes,
        avgRating: productData.avgRating,
        numReviews: productData.numReviews,
        ratingDistribution: productData.ratingDistribution || null,
        numSales: productData.numSales,
        isPublished: productData.isPublished,
      }
    })
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product created successfully',
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data)
    // Always use database
    
    const { reviews, _id, ...productData } = product
    
    await prisma.product.update({
      where: { id: _id },
      data: {
        name: productData.name,
        slug: productData.slug,
        category: productData.category,
        images: productData.images,
        brand: productData.brand,
        description: productData.description,
        price: product.price,
        listPrice: product.listPrice,
        countInStock: productData.countInStock,
        tags: productData.tags,
        colors: productData.colors,
        sizes: productData.sizes,
        avgRating: productData.avgRating,
        numReviews: productData.numReviews,
        ratingDistribution: productData.ratingDistribution || null,
        numSales: productData.numSales,
        isPublished: productData.isPublished,
      }
    })
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product updated successfully',
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteProduct(id: string) {
  try {
    const res = await prisma.product.delete({
      where: { id }
    })
    if (!res) throw new Error('Product not found')
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, message: formatError(error) }
  }
}

// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) return null
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error('Error in getProductById:', error)
    return null
  }
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  try {
    // Use Prisma directly
    const {
      common: { pageSize },
    } = data.settings[0];
    limit = limit || pageSize

    // Mock mode removed: always use database

    // Build Prisma where clause
    const where: any = {}
    
    if (query && query !== 'all') {
      where.name = { contains: query, mode: 'insensitive' }
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'best-selling') {
      orderBy = { numSales: 'desc' }
    } else if (sort === 'price-low-to-high') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-high-to-low') {
      orderBy = { price: 'desc' }
    } else if (sort === 'avg-customer-review') {
      orderBy = { avgRating: 'desc' }
    }

    const skip = limit * (Number(page) - 1)
    
    const [products, countProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    return {
      products: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(countProducts / pageSize),
      totalProducts: countProducts,
      from: pageSize * (Number(page) - 1) + 1,
      to: pageSize * (Number(page) - 1) + products.length,
    }
  } catch (error) {
    console.error('Error in getAllProductsForAdmin:', error)
    return {
      products: [],
      totalPages: 0,
      totalProducts: 0,
      from: 0,
      to: 0,
    }
  }
}

export async function getAllCategories() {
  try {
    console.log('🔍 getAllCategories called')
    // Check cache first
    const cachedCategories = getCachedData<string[]>('categories', async () => {
      try {
        const categories = await prisma.product.findMany({
          where: { isPublished: true },
          select: { category: true },
          distinct: ['category']
        })
        return categories.map((c: any) => c.category)
      } catch (error) {
        console.warn('Database error in getAllCategories cache:', error)
        return []
      }
    })
    
    if (cachedCategories) {
      console.log('📋 Using cached categories:', cachedCategories.length)
      return cachedCategories
    }
    
    // If not cached, fetch and cache
    try {
      const categories = await prisma.product.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ['category']
      })
      const result = categories.map((c: any) => c.category)
      setCachedData('categories', result)
      return result
    } catch (error) {
      console.error('Database error in getAllCategories:', error)
      return []
    }
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    return []
  }
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  try {
    console.log(`🔍 getProductsForCard called with tag: ${tag}, limit: ${limit}`)
    const products = await prisma.product.findMany({
      where: {
        tags: { has: tag },
        isPublished: true
      },
      select: {
        name: true,
        slug: true,
        images: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return products.map((p: { name: string; slug: string; images: string[] }) => ({
      name: p.name,
      href: `/product/${p.slug}`,
      image: p.images[0] || '',
    })) as {
      name: string
      href: string
      image: string
    }[]
  } catch (error) {
    console.error('Error in getProductsForCard:', error)
    return []
  }
}

// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  try {
    console.log(`🔍 getProductsByTag called with tag: ${tag}, limit: ${limit}`)
    try {
      const products = await prisma.product.findMany({
        where: {
          tags: { has: tag },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
      return JSON.parse(JSON.stringify(products))
    } catch (error) {
      console.error('Database error in getProductsByTag:', error)
      return []
    }
  } catch (error) {
    console.error('Error in getProductsByTag:', error)
    return []
  }
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, isPublished: true }
    })
    if (!product) return null
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return null
  }
}

// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  try {
    const connection = await connectToDatabase()
    const {
      common: { pageSize },
    } = data.settings[0];
    limit = limit || pageSize

    // Using real database connection

    const skipAmount = (Number(page) - 1) * limit
    
    const [products, productsCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          isPublished: true,
          category,
          id: { not: productId },
        },
        orderBy: { numSales: 'desc' },
        skip: skipAmount,
        take: limit,
      }),
      prisma.product.count({
        where: {
          isPublished: true,
          category,
          id: { not: productId },
        }
      })
    ])
    
    return {
      data: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(productsCount / limit),
    }
  } catch (error) {
    console.error('Error in getRelatedProductsByCategory:', error)
    return {
      data: [],
      totalPages: 0,
    }
  }
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}) {
  try {
    // Use Prisma directly
    const {
      common: { pageSize },
    } = data.settings[0];
    limit = limit || pageSize
    

    // Build Prisma where clause
    const where: any = { isPublished: true }
    
    if (query && query !== 'all') {
      where.name = { contains: query, mode: 'insensitive' }
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (tag && tag !== 'all') {
      where.tags = { has: tag }
    }
    
    if (rating && rating !== 'all') {
      where.avgRating = { gte: Number(rating) }
    }
    
    if (price && price !== 'all') {
      const [minPrice, maxPrice] = price.split('-').map(Number)
      where.price = { gte: minPrice, lte: maxPrice }
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'best-selling') {
      orderBy = { numSales: 'desc' }
    } else if (sort === 'price-low-to-high') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-high-to-low') {
      orderBy = { price: 'desc' }
    } else if (sort === 'avg-customer-review') {
      orderBy = { avgRating: 'desc' }
    }

    const skip = limit * (Number(page) - 1)
    
    const [products, countProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    return {
      products: JSON.parse(JSON.stringify(products)),
      totalPages: Math.ceil(countProducts / pageSize),
      totalProducts: countProducts,
      from: pageSize * (Number(page) - 1) + 1,
      to: pageSize * (Number(page) - 1) + products.length,
    }
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    return {
      products: [],
      totalPages: 0,
      totalProducts: 0,
      from: 0,
      to: 0,
    }
  }
}

export async function getAllTags() {
  try {
    // Check cache first
    const cachedTags = getCachedData<string[]>('tags', async () => {
      try {
        const products = await prisma.product.findMany({
          where: { isPublished: true },
          select: { tags: true }
        })
        
        const allTags = new Set<string>()
        products.forEach((product: { tags: string[] }) => {
          product.tags.forEach(tag => allTags.add(tag))
        })
        
        return Array.from(allTags)
          .sort((a, b) => a.localeCompare(b))
          .map(x => x
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          )
      } catch (error) {
        console.error('Database error in getAllTags cache:', error)
        return []
      }
    })
    
    if (cachedTags) {
      return cachedTags
    }
    
    // If not cached, fetch and cache
    try {
      const products = await prisma.product.findMany({
        where: { isPublished: true },
        select: { tags: true }
      })
      
      const allTags = new Set<string>()
      products.forEach((product: { tags: string[] }) => {
        product.tags.forEach(tag => allTags.add(tag))
      })
      
      const result = Array.from(allTags)
        .sort((a, b) => a.localeCompare(b))
        .map(x => x
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        )
      setCachedData('tags', result)
      return result
    } catch (error) {
      console.error('Database error in getAllTags:', error)
      return []
    }
  } catch (error) {
    console.error('Error in getAllTags:', error)
    return []
  }
}

// GET HOMEPAGE DATA - OPTIMIZED SINGLE DATABASE CONNECTION
export async function getHomePageData() {
  try {
    console.log('🔍 getHomePageData called - fetching all homepage data in single connection')
    try {
      // Fetch data with reduced concurrency to avoid exhausting DB connections
      const todaysDeals = await prisma.product.findMany({
        where: {
          tags: { has: 'best-seller' },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      const bestSellingProducts = await prisma.product.findMany({
        where: {
          tags: { has: 'best-seller' },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      const categories = await prisma.product.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ['category']
      })

      const newArrivals = await prisma.product.findMany({
        where: {
          tags: { has: 'featured' },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          name: true,
          slug: true,
          images: true,
          price: true,
          listPrice: true,
          avgRating: true,
          numReviews: true,
        }
      })

      const featureds = await prisma.product.findMany({
        where: {
          tags: { has: 'featured' },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          name: true,
          slug: true,
          images: true,
          price: true,
          listPrice: true,
          avgRating: true,
          numReviews: true,
        }
      })

      const bestSellers = await prisma.product.findMany({
        where: {
          tags: { has: 'best-seller' },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          name: true,
          slug: true,
          images: true,
          price: true,
          listPrice: true,
          avgRating: true,
          numReviews: true,
        }
      })
      
      // Process categories
      const categoryList = categories.map((c: any) => c.category).slice(0, 4)
      
      // Process product data for cards
      const processProductForCard = (product: any) => ({
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price: product.price,
        listPrice: product.listPrice,
        avgRating: product.avgRating,
        numReviews: product.numReviews,
      })
      
      const processedNewArrivals = newArrivals.map(processProductForCard)
      const processedFeatureds = featureds.map(processProductForCard)
      const processedBestSellers = bestSellers.map(processProductForCard)
      
      console.log(`✅ Database mode: fetched all data - deals: ${todaysDeals.length}, bestSellers: ${bestSellingProducts.length}, categories: ${categoryList.length}, newArrivals: ${processedNewArrivals.length}, featureds: ${processedFeatureds.length}, bestSellers: ${processedBestSellers.length}`)
      
      return {
        todaysDeals: JSON.parse(JSON.stringify(todaysDeals)),
        bestSellingProducts: JSON.parse(JSON.stringify(bestSellingProducts)),
        categories: categoryList,
        newArrivals: processedNewArrivals,
        featureds: processedFeatureds,
        bestSellers: processedBestSellers
      }
    } catch (error) {
      console.error('Database error in getHomePageData:', error)
      return {
        todaysDeals: [],
        bestSellingProducts: [],
        categories: [],
        newArrivals: [],
        featureds: [],
        bestSellers: []
      }
    }
  } catch (error) {
    console.error('Error in getHomePageData:', error)
    return {
      todaysDeals: [],
      bestSellingProducts: [],
      categories: [],
      newArrivals: [],
      featureds: [],
      bestSellers: []
    }
  }
}
