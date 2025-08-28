import HomeCarousel from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

import { getCategories, getProductsByCategory } from '@/lib/actions/product.actions'
import data from '@/lib/data'

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
async function CategoriesSection() {
  const categories = await getCategories()
  
  const sampleImages = [
    '/images/shoes.jpg', '/images/t-shirts.jpg', '/images/wrist-watches.jpg',
    '/images/jeans.jpg', '/images/p11-1.jpg', '/images/p12-1.jpg'
  ]

  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='card-mobile'>
        <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-right text-gray-800'>استكشف الفئات</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'>
          {categories.map((category: string, index: number) => (
            <Link
              key={category}
              href={`/search?category=${category}`}
              className='flex flex-col items-center group'
            >
              <div className='relative overflow-hidden rounded-lg bg-gray-50 mb-2 sm:mb-3 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center'>
                <Image
                  src={sampleImages[index % sampleImages.length]}
                  alt={category}
                  width={80}
                  height={80}
                  className='object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
                />
              </div>
              <p className='text-center text-xs sm:text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200'>
                {category}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function CategoryProductsSection() {
  const categories = await getCategories()
  
  // Fetch products for all categories in parallel
  const categoryProductsPromises = categories.map(async (category: string) => {
    const products = await getProductsByCategory(category)
    return { category, products }
  })
  
  const categoryProducts = await Promise.all(categoryProductsPromises)
  
  return (
    <>
      {categoryProducts.map(({ category, products }) => {
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
}

export default function HomePage() {
  return (
    <div className="font-cairo" dir="rtl">
      {/* Hero section loads immediately */}
      <HomeCarousel />
      
      <div className='p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50'>
        {/* Categories Section - Load first */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
        
        {/* Category Products Sections - Load after categories */}
        <Suspense fallback={<ProductSliderSkeleton title="المنتجات" />}>
          <CategoryProductsSection />
        </Suspense>
      </div>
    </div>
  )
}
