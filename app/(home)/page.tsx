import HomeCarousel from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

import { getCategories, getTodaysDeals, getBestSellingProducts } from '@/lib/actions/product.actions'
import data from '@/lib/data'

export const runtime = 'nodejs'

// Loading skeleton components
function CategoriesSkeleton() {
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='p-6'>
        <div className='h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse'></div>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex flex-col items-center'>
              <div className='w-20 h-20 bg-gray-200 rounded-lg mb-3 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-16 animate-pulse'></div>
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
      <CardContent className='p-6'>
        <div className='h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse'></div>
        <div className='flex space-x-4 overflow-hidden'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex-shrink-0 w-48'>
              <div className='w-full h-32 bg-gray-200 rounded-lg mb-2 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
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
      <CardContent className='p-6'>
        <h2 className='text-2xl font-bold mb-6 text-right text-gray-800'>استكشف الفئات</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          {categories.map((category: string, index: number) => (
            <Link
              key={category}
              href={`/search?category=${category}`}
              className='flex flex-col items-center group'
            >
              <div className='relative overflow-hidden rounded-lg bg-gray-50 mb-3 w-20 h-20 flex items-center justify-center'>
                <Image
                  src={sampleImages[index % sampleImages.length]}
                  alt={category}
                  width={80}
                  height={80}
                  className='object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
                />
              </div>
              <p className='text-center text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200'>
                {category}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function TodaysDealsSection() {
  const todaysDeals = await getTodaysDeals()
  
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='p-6 items-center gap-3'>
        <ProductSlider title="عروض اليوم" products={todaysDeals} />
      </CardContent>
    </Card>
  )
}

async function BestSellingSection() {
  const bestSellingProducts = await getBestSellingProducts()
  
  return (
    <Card className='w-full rounded-xl shadow-sm'>
      <CardContent className='p-6 items-center gap-3'>
        <ProductSlider title="الأكثر مبيعاً" products={bestSellingProducts} />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="font-cairo" dir="rtl">
      {/* Hero section loads immediately */}
      <HomeCarousel />
      
      <div className='md:p-6 md:space-y-8 bg-gray-50'>
        {/* Categories Section - Load first */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
        
        {/* Today's Deals Section - Load second */}
        <Suspense fallback={<ProductSliderSkeleton title="عروض اليوم" />}>
          <TodaysDealsSection />
        </Suspense>
        
        {/* Best Selling Products Section - Load last */}
        <Suspense fallback={<ProductSliderSkeleton title="الأكثر مبيعاً" />}>
          <BestSellingSection />
        </Suspense>
      </div>
    </div>
  )
}
