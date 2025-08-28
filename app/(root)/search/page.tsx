import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getAllProducts, getAllCategories } from '@/lib/actions/product.actions'
import ProductCard from '@/components/shared/product/product-card'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import ServerPagination from '@/components/shared/server-pagination'
import SearchFilters from '@/components/shared/search-filters'
import { Separator } from '@/components/ui/separator'
import { IProduct } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
    tag?: string | string[]
  }>
}

// Loading skeleton components
function SearchHeaderSkeleton() {
  return (
    <div className='mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
      <div className='h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3 animate-pulse'></div>
      <div className='h-4 sm:h-6 bg-gray-200 rounded w-1/2 animate-pulse'></div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className='overflow-hidden'>
          <CardContent className='p-3 sm:p-4'>
            <div className='w-full h-36 sm:h-48 bg-gray-200 rounded-lg mb-2 sm:mb-3 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse'></div>
            <div className='h-4 sm:h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className='w-full'>
      <Card>
        <CardContent className='p-3 sm:p-4'>
          <div className='h-5 sm:h-6 bg-gray-200 rounded w-20 sm:w-24 mb-3 sm:mb-4 animate-pulse'></div>
          <div className='space-y-2 sm:space-y-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Async components for progressive loading
async function SearchHeader({ params, translations }: { 
  params: any, 
  translations: any 
}) {
  const {
    q = '',
    category = '',
  } = params

  return (
    <div className='mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
      <h1 className='text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-right text-gray-800'>
        {q ? `${translations.searchResults} "${q}"` : `${translations.productsIn} ${category}`}
      </h1>
      <p className='text-sm sm:text-base text-gray-600 text-right'>
        {translations.found} {translations.loading} {translations.products}
      </p>
    </div>
  )
}

async function ProductResults({ params, translations }: { 
  params: any, 
  translations: any 
}) {
  const {
    q = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = '1',
    tag = '',
  } = params

  const currentPage = parseInt(page)
  const limit = 12

  const products = await getAllProducts({
    query: q || '',
    category: category || '',
    tag: Array.isArray(tag) ? tag.join(',') : tag || '',
    price: minPrice && maxPrice ? `${minPrice}-${maxPrice}` : '',
    rating: '',
    sort,
    page: currentPage,
  })

  const totalPages = products.totalPages

  return (
    <>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 bg-white rounded-xl p-3 sm:p-4 shadow-sm'>
        <ProductSortSelector 
          sortOrders={[
            { value: 'newest', name: translations.newest },
            { value: 'price-low-to-high', name: translations.priceLowToHigh },
            { value: 'price-high-to-low', name: translations.priceHighToLow },
            { value: 'best-selling', name: translations.bestSelling },
            { value: 'avg-customer-review', name: translations.avgCustomerReview }
          ]}
          sort={sort}
          params={params}
        />
        <p className='text-xs sm:text-sm text-gray-600 text-right'>
          {translations.showing} {products.from}-{products.to} {translations.of} {products.totalProducts} {translations.products}
        </p>
      </div>

      {products.products.length === 0 ? (
        <div className='text-center py-8 sm:py-12'>
          <h3 className='text-base sm:text-lg font-semibold mb-2'>{translations.noProductsFound}</h3>
          <p className='text-sm sm:text-base text-muted-foreground px-4'>
            {translations.tryAdjustingSearch}
          </p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
            {products.products.map((product: IProduct) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <ServerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/search"
              searchParams={params as Record<string, string>}
            />
          )}
        </>
      )}
    </>
  )
}

async function SearchFiltersSection({ params }: { params: any }) {
  const categories = await getAllCategories()
  const tags = ['best-seller', 'featured', 'new-arrival', 'todays-deal', 'pain-relief', 'vitamins', 'allergy', 'digestive', 'cold-flu']

  return (
    <div className='w-full'>
      <SearchFilters 
        categories={categories}
        tags={tags}
        maxPrice={1000}
      />
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const {
    q = '',
    category = '',
  } = params

  if (!q && !category) {
    notFound()
  }

  // Arabic translations
  const translations = {
    searchResults: 'نتائج البحث',
    productsIn: 'المنتجات في',
    found: 'تم العثور على',
    product: 'منتج',
    products: 'منتجات',
    loading: '...',
    filters: 'المرشحات',
    filterOptionsComingSoon: 'خيارات التصفية قريباً...',
    showing: 'عرض',
    of: 'من',
    noProductsFound: 'لم يتم العثور على منتجات',
    tryAdjustingSearch: 'حاول تعديل معايير البحث أو تصفح جميع المنتجات',
    sortBy: 'ترتيب حسب',
    newest: 'الأحدث',
    priceLowToHigh: 'السعر: من الأقل إلى الأعلى',
    priceHighToLow: 'السعر: من الأعلى إلى الأعلى',
    bestSelling: 'الأكثر مبيعاً',
    avgCustomerReview: 'متوسط تقييم العملاء'
  }

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8' dir="rtl">
      {/* Search Header - Load first */}
      <Suspense fallback={<SearchHeaderSkeleton />}>
        <SearchHeader params={params} translations={translations} />
      </Suspense>

      {/* Filters Section - Load second, positioned at top */}
      <div className='mb-6 sm:mb-8'>
        <Suspense fallback={<FiltersSkeleton />}>
          <SearchFiltersSection params={params} />
        </Suspense>
      </div>

      {/* Main Content - Load third, full width */}
      <div className='w-full'>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductResults params={params} translations={translations} />
        </Suspense>
      </div>
    </div>
  )
}
