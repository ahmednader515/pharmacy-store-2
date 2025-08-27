import HomeCarousel from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

import { getHomePageData } from '@/lib/actions/product.actions'
import data from '@/lib/data'

export const runtime = 'nodejs'
export default async function HomePage() {
  try {
    const { carousels } = data.settings[0];
    
    // Debug: Log what we're trying to fetch
    console.log('Fetching data for homepage.')

    // Single database connection to fetch all data
    const {
      todaysDeals,
      bestSellingProducts,
      categories,
      newArrivals,
      featureds,
      bestSellers
    } = await getHomePageData()

    // Debug: Log the final data
    console.log('Final data summary:', {
      todaysDeals: todaysDeals.length,
      bestSellingProducts: bestSellingProducts.length,
      categories: categories.length,
      newArrivals: newArrivals.length,
      featureds: featureds.length,
      bestSellers: bestSellers.length
    })

    // Sample images for categories
    const sampleImages = [
      '/images/shoes.jpg',
      '/images/t-shirts.jpg',
      '/images/wrist-watches.jpg',
      '/images/jeans.jpg',
      '/images/p11-1.jpg',
      '/images/p12-1.jpg',
      '/images/p13-1.jpg',
      '/images/p14-1.jpg',
      '/images/p15-1.jpg',
      '/images/p16-1.jpg',
      '/images/p21-1.jpg',
      '/images/p22-1.jpg',
      '/images/p23-1.jpg',
      '/images/p24-1.jpg',
      '/images/p25-1.jpg',
      '/images/p26-1.jpg',
      '/images/p31-1.jpg',
      '/images/p32-1.jpg',
      '/images/p33-1.jpg',
      '/images/p34-1.jpg',
      '/images/p35-1.jpg',
      '/images/p36-1.jpg',
      '/images/p41-1.jpg',
      '/images/p42-1.jpg',
      '/images/p43-1.jpg',
      '/images/p44-1.jpg',
      '/images/p45-1.jpg',
      '/images/p46-1.jpg',
      '/images/deo-1.png',
      '/images/shampoo-1.png'
    ]

    return (
      <div className="font-cairo" dir="rtl">
        <HomeCarousel />
        <div className='md:p-6 md:space-y-8 bg-gray-50'>
          {/* Categories Section */}
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
          
          {/* Today's Deals Section */}
          <Card className='w-full rounded-xl shadow-sm'>
            <CardContent className='p-6 items-center gap-3'>
              <ProductSlider title="عروض اليوم" products={todaysDeals} />
            </CardContent>
          </Card>
          
          {/* Best Selling Products Section */}
          <Card className='w-full rounded-xl shadow-sm'>
            <CardContent className='p-6 items-center gap-3'>
              <ProductSlider title="الأكثر مبيعاً" products={bestSellingProducts} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in HomePage:', error)
    
    // Return a fallback UI instead of crashing
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to الليثي صيدلية
          </h1>
          <p className="text-gray-600 mb-6">
            We're experiencing some technical difficulties. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}
