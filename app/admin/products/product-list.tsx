'use client'
import Link from 'next/link'
import Image from 'next/image'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteProduct,
  getAllProductsForAdmin,
} from '@/lib/actions/product.actions'
import { IProductInput } from '@/types'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type ProductListDataProps = {
  products: (IProductInput & { id: string })[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

// Loading skeleton component for table rows
const TableRowSkeleton = () => (
  <TableRow className="animate-pulse">
    <TableCell className='text-right py-4 px-4'>
      <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </TableCell>
    <TableCell className='py-4 px-4'>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </TableCell>
  </TableRow>
)

// Loading skeleton component for mobile cards
const MobileCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    if (changeType === 'next') {
      setPage(newPage)
    } else {
      setPage(newPage)
    }
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as { debounce?: NodeJS.Timeout }).debounce)
      ;(window as { debounce?: NodeJS.Timeout }).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ query: '', page })
        setData(data)
      })
    }
  }
  
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: '' })
      setData(data)
      setIsInitialLoading(false)
    })
  }, [])

  // Show loading skeleton when initially loading or when pending
  const isLoading = isInitialLoading || isPending

  return (
    <div className='rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='space-y-4'>
        {/* Title and Create Button Row */}
        <div className='flex justify-between items-center'>
          <h1 className='font-bold text-lg text-right'>المنتجات</h1>
          <Button asChild variant='default' disabled={isLoading}>
            <Link href='/admin/products/create'>إنشاء منتج</Link>
          </Button>
        </div>

        {/* Search and Results Row */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            className='w-auto'
            type='text '
            value={inputValue}
            onChange={handleInputChange}
            placeholder='تصفية بالاسم...'
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <p>
              {data?.totalProducts === 0
                ? 'لا توجد'
                : `${data?.from}-${data?.to} من ${data?.totalProducts}`}
              {' نتيجة'}
            </p>
          )}
        </div>
        
        {/* Desktop Table - Hidden on mobile */}
        <div className='hidden md:block'>
          <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الصورة</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الاسم</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>السعر</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الفئة</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المخزون</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>التقييم</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>منشور</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>آخر تحديث</TableHead>
                <TableHead className='w-[120px] text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show loading skeleton rows
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : data?.products && data.products.length > 0 ? (
                // Show actual product data
                data.products.map((product) => {
                  // Comprehensive safety check
                  if (!product || typeof product !== 'object' || !product.id) {
                    console.warn('Invalid product data:', product);
                    return null;
                  }
                  
                  // Ensure all required properties exist and are safe to render
                  const safeProduct = {
                    id: product.id || '',
                    name: product.name || 'Unnamed Product',
                    price: typeof product.price === 'number' ? product.price : 0,
                    category: product.category || 'No Category',
                    countInStock: typeof product.countInStock === 'number' ? product.countInStock : 0,
                    avgRating: typeof product.avgRating === 'number' ? product.avgRating : 0,
                    isPublished: Boolean(product.isPublished),
                    images: Array.isArray(product.images) ? product.images : [],
                    slug: product.slug || '#',
                    updatedAt: (product as any).updatedAt || null
                  };
                  
                  return (
                    <TableRow key={safeProduct.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className='text-right py-4 px-4'>
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <Image
                            src={safeProduct.images[0] || '/images/placeholder.jpg'}
                            alt={safeProduct.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className='text-right py-4 px-4'>
                        <Link href={`/admin/products/${safeProduct.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                          {safeProduct.name}
                        </Link>
                      </TableCell>
                      <TableCell className='text-right py-4 px-4 font-semibold text-green-700'>
                        ${safeProduct.price.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right py-4 px-4'>
                        {safeProduct.category}
                      </TableCell>
                      <TableCell className='text-right py-4 px-4'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          safeProduct.countInStock > 10 ? 'bg-green-100 text-green-800' : 
                          safeProduct.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {safeProduct.countInStock}
                        </span>
                      </TableCell>
                      <TableCell className='text-right py-4 px-4'>
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{safeProduct.avgRating}</span>
                        </span>
                      </TableCell>
                      <TableCell className='text-right py-4 px-4'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          safeProduct.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {safeProduct.isPublished ? 'نعم' : 'لا'}
                        </span>
                      </TableCell>
                      <TableCell className='text-right py-4 px-4 text-sm text-gray-600'>
                        {(() => {
                          try {
                            if (!safeProduct.updatedAt) return 'غير متوفر';
                            const date = new Date(safeProduct.updatedAt);
                            if (isNaN(date.getTime())) return 'غير متوفر';
                            const formatted = formatDateTime(date);
                            // Ensure we're returning a string, not an object
                            return typeof formatted?.dateTime === 'string' ? formatted.dateTime : 'غير متوفر';
                          } catch (error) {
                            console.error('Error formatting date:', error);
                            return 'غير متوفر';
                          }
                        })()}
                      </TableCell>
                      <TableCell className='py-4 px-4'>
                        <div className='flex flex-row gap-2 items-center'>
                          <Button asChild variant='default' size='sm'>
                            <Link href={`/admin/products/${safeProduct.id}`}>تعديل</Link>
                          </Button>
                          <Button asChild variant='secondary' size='sm'>
                            <Link target='_blank' href={`/product/${safeProduct.slug}`}>
                              عرض
                            </Link>
                          </Button>
                          <DeleteDialog
                            id={safeProduct.id}
                            action={deleteProduct}
                            callbackAction={() => {
                              // Refresh the product list
                              startTransition(async () => {
                                const data = await getAllProductsForAdmin({
                                  query: inputValue,
                                  page,
                                })
                                setData(data)
                              })
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }).filter(Boolean) // Remove any null entries
              ) : (
                // Show empty state
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className='md:hidden space-y-4'>
          {isLoading ? (
            // Show loading skeleton cards
            Array.from({ length: 4 }).map((_, index) => (
              <MobileCardSkeleton key={index} />
            ))
          ) : data?.products && data.products.length > 0 ? (
            // Show actual product data as cards
            data.products.map((product) => {
              // Comprehensive safety check
              if (!product || typeof product !== 'object' || !product.id) {
                console.warn('Invalid product data:', product);
                return null;
              }
              
              // Ensure all required properties exist and are safe to render
              const safeProduct = {
                id: product.id || '',
                name: product.name || 'Unnamed Product',
                price: typeof product.price === 'number' ? product.price : 0,
                category: product.category || 'No Category',
                countInStock: typeof product.countInStock === 'number' ? product.countInStock : 0,
                avgRating: typeof product.avgRating === 'number' ? product.avgRating : 0,
                isPublished: Boolean(product.isPublished),
                images: Array.isArray(product.images) ? product.images : [],
                slug: product.slug || '#',
                updatedAt: (product as any).updatedAt || null
              };
              
              return (
                <div key={safeProduct.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                  {/* Product Header with Image and Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image
                        src={safeProduct.images[0] || '/images/placeholder.jpg'}
                        alt={safeProduct.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/products/${safeProduct.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-lg block">
                        {safeProduct.name}
                      </Link>
                      <div className="text-sm text-gray-500">{safeProduct.category}</div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">السعر:</span>
                      <span className="font-semibold text-green-700">${safeProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المخزون:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        safeProduct.countInStock > 10 ? 'bg-green-100 text-green-800' : 
                        safeProduct.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {safeProduct.countInStock}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">التقييم:</span>
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{safeProduct.avgRating}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">منشور:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        safeProduct.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {safeProduct.isPublished ? 'نعم' : 'لا'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">آخر تحديث:</span>
                      <span className="text-sm text-gray-600">
                        {(() => {
                          try {
                            if (!safeProduct.updatedAt) return 'غير متوفر';
                            const date = new Date(safeProduct.updatedAt);
                            if (isNaN(date.getTime())) return 'غير متوفر';
                            const formatted = formatDateTime(date);
                            return typeof formatted?.dateTime === 'string' ? formatted.dateTime : 'غير متوفر';
                          } catch (error) {
                            console.error('Error formatting date:', error);
                            return 'غير متوفر';
                          }
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 pt-3 flex gap-2">
                    <Button asChild variant='default' size='sm' className="flex-1">
                      <Link href={`/admin/products/${safeProduct.id}`}>
                        تعديل
                      </Link>
                    </Button>
                    <Button asChild variant='secondary' size='sm' className="flex-1">
                      <Link target='_blank' href={`/product/${safeProduct.slug}`}>
                        عرض
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={safeProduct.id}
                      action={deleteProduct}
                      callbackAction={() => {
                        // Refresh the product list
                        startTransition(async () => {
                          const data = await getAllProductsForAdmin({
                            query: inputValue,
                            page,
                          })
                          setData(data)
                        })
                      }}
                    />
                  </div>
                </div>
              );
            }).filter(Boolean) // Remove any null entries
          ) : (
            // Show empty state
            <div className="text-center py-8 text-gray-500">
              لا توجد منتجات
            </div>
          )}
        </div>
          
        {/* Pagination - only show when not loading and there are multiple pages */}
        {!isLoading && (data?.totalPages ?? 0) > 1 && (
          <div className='flex items-center gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => handlePageChange('prev')}
              disabled={Number(page) <= 1}
              className='w-24'
            >
              <ChevronRight /> السابق
            </Button>
            صفحة {page} من {data?.totalPages}
            <Button
              variant='outline'
              onClick={() => handlePageChange('next')}
              disabled={Number(page) >= (data?.totalPages ?? 0)}
              className='w-24'
            >
              التالي <ChevronLeft />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
