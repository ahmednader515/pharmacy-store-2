import React from 'react'
import { notFound } from 'next/navigation'
import { getAllProducts, getAllCategories } from '@/lib/actions/product.actions'
import ProductCard from '@/components/shared/product/product-card'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import ServerPagination from '@/components/shared/server-pagination'
import SearchFilters from '@/components/shared/search-filters'
import { Separator } from '@/components/ui/separator'
import { IProduct } from '@/types'

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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const {
    q = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = '1',
    tag = '',
  } = params

  if (!q && !category) {
    notFound()
  }

  const currentPage = parseInt(page)
  const limit = 12
  const skip = (currentPage - 1) * limit

  // Get categories and tags for filters
  const categories = await getAllCategories()
  const tags = ['best-seller', 'featured', 'new-arrival', 'todays-deal', 'pain-relief', 'vitamins', 'allergy', 'digestive', 'cold-flu']

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

  // Arabic translations
  const translations = {
    searchResults: 'نتائج البحث',
    productsIn: 'المنتجات في',
    found: 'تم العثور على',
    product: 'منتج',
    products: 'منتجات',
    filters: 'المرشحات',
    filterOptionsComingSoon: 'خيارات التصفية قريباً...',
    showing: 'عرض',
    of: 'من',
    noProductsFound: 'لم يتم العثور على منتجات',
    tryAdjustingSearch: 'حاول تعديل معايير البحث أو تصفح جميع المنتجات',
    sortBy: 'ترتيب حسب',
    newest: 'الأحدث',
    priceLowToHigh: 'السعر: من الأقل إلى الأعلى',
    priceHighToLow: 'السعر: من الأعلى إلى الأقل',
    bestSelling: 'الأكثر مبيعاً',
    avgCustomerReview: 'متوسط تقييم العملاء'
  }

  // Get sort order names in Arabic
  const sortOrders = [
    { value: 'newest', name: translations.newest },
    { value: 'price-low-to-high', name: translations.priceLowToHigh },
    { value: 'price-high-to-low', name: translations.priceHighToLow },
    { value: 'best-selling', name: translations.bestSelling },
    { value: 'avg-customer-review', name: translations.avgCustomerReview }
  ]

  return (
    <div className='container mx-auto px-4 py-8' dir="rtl">
      <div className='mb-8 bg-white rounded-xl p-6 shadow-sm'>
        <h1 className='text-3xl font-bold mb-3 text-right text-gray-800'>
          {q ? `${translations.searchResults} "${q}"` : `${translations.productsIn} ${category}`}
        </h1>
        <p className='text-gray-600 text-right text-lg'>
          {translations.found} {products.totalProducts} {products.totalProducts !== 1 ? translations.products : translations.product}
        </p>
      </div>

      <div className='flex flex-col lg:flex-row-reverse gap-8'>
        {/* Main Content */}
        <div className='lg:w-3/4'>
          <div className='flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm'>
            <ProductSortSelector 
              sortOrders={sortOrders}
              sort={sort}
              params={params}
            />
            <p className='text-sm text-gray-600 text-right'>
              {translations.showing} {products.from}-{products.to} {translations.of} {products.totalProducts} {translations.products}
            </p>
          </div>

          {products.products.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold mb-2'>{translations.noProductsFound}</h3>
              <p className='text-muted-foreground'>
                {translations.tryAdjustingSearch}
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
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
        </div>

        {/* Filters Sidebar */}
        <div className='lg:w-1/4'>
          <div className='sticky top-4'>
            <SearchFilters 
              categories={categories}
              tags={tags}
              maxPrice={1000}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
