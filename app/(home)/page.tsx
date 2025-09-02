import HomeCarousel from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// Loading skeleton components
function CategoriesSkeleton() {
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='card-mobile'>
        <div className='h-6 sm:h-8 bg-gray-200 rounded w-32 sm:w-48 mb-4 sm:mb-6 animate-pulse'></div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex flex-col items-center'>
              <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg mb-2 sm:mb-3 animate-pulse'></div>
              <div className='h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse'></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductSliderSkeleton({ title }: { title: string }) {
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='card-mobile'>
        <div className='h-6 sm:h-8 bg-gray-200 rounded w-24 sm:w-32 mb-4 sm:mb-6 animate-pulse'></div>
        <div className='flex space-x-3 sm:space-x-4 overflow-hidden'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex-shrink-0 w-32 sm:w-48'>
              <div className='w-full h-24 sm:h-32 bg-gray-200 rounded-lg mb-2 animate-pulse'></div>
              <div className='h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
              <div className='h-3 sm:h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Async components for progressive loading
async function CategoriesSection({ categories }: { categories: { id: string, name: string, image?: string }[] }) {
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='card-mobile'>
        <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-right text-gray-800'>استكشف الفئات</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4'>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.name}`}
              className='flex flex-col items-center group'
            >
              <div className='relative overflow-hidden rounded-lg bg-gray-50 mb-2 sm:mb-3 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center'>
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={80}
                    height={80}
                    className='object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center'>
                    <span className='text-blue-600 font-semibold text-xs sm:text-sm'>
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className='text-center text-xs sm:text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200'>
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function CategoryProductsSection({ categories }: { categories: string[] }) {
  try {
    // Get category IDs for the category names
    const categoryRecords = await prisma.category.findMany({
      where: {
        name: { in: categories },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    })

    const categoryIds = categoryRecords.map(cat => cat.id)
    const categoryIdToName = Object.fromEntries(categoryRecords.map(cat => [cat.id, cat.name]))

    // Fetch products using the new category relationship
    const allProducts = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: { in: categoryIds } },
          { category: { in: categories } } // Fallback for products not yet migrated
        ],
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
        categoryId: true,
      }
    })

    // Group products by category and convert Decimal to numbers
    const productsByCategory = categories.reduce((acc, category) => {
      acc[category] = allProducts
        .filter(product => {
          // Match either by new category relationship or old category string
          const categoryName = product.categoryId ? categoryIdToName[product.categoryId] : product.category
          return categoryName === category
        })
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
    
    return (
      <>
        {categories.map((category: string) => {
          const products = productsByCategory[category] || []
          
          // Only show carousel if there are products in this category
          if (products.length === 0) return null
          
          return (
            <Card key={category} className='w-full rounded-xl shadow-sm'>
              <CardContent className='card-mobile'>
                <ProductSlider title={category} products={products} />
              </CardContent>
            </Card>
          )
        })}
      </>
    )
  } catch (error) {
    console.error('Error loading category products:', error)
    // Fallback to skeleton on error
    return <ProductSliderSkeleton title="المنتجات" />
  }
}

export default async function HomePage() {
  // Get categories from the new category table
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      image: true,
    }
  })
  
  const categoryList = categories.map(c => c.name)
  
  // Direct database query for settings - no caching
  const setting = await prisma.setting.findFirst()
  
  return (
    <div className="font-cairo" dir="rtl">
      {/* Hero section loads immediately */}
      <HomeCarousel carousels={setting?.carousels as any[] || []} />
      
      <div className='p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50'>
        {/* Categories Section - Load first */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection categories={categories} />
        </Suspense>
        
        {/* Category Products Sections - Load after categories */}
        <Suspense fallback={<ProductSliderSkeleton title="المنتجات" />}>
          <CategoryProductsSection categories={categoryList} />
        </Suspense>
      </div>
    </div>
  )
}
