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
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProductListDataProps = {
  products: (IProductInput & { id: string })[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}
const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()

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
    })
  }, [])

  return (
    <div className='rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='space-y-2'>
        <div className='flex-between flex-wrap gap-2'>
          <div className='flex flex-wrap items-center gap-2 '>
            <h1 className='font-bold text-lg text-right'>المنتجات</h1>
            <div className='flex flex-wrap items-center  gap-2 '>
              <Input
                className='w-auto'
                type='text '
                value={inputValue}
                onChange={handleInputChange}
                placeholder='تصفية بالاسم...'
              />

              {isPending ? (
                <p>جاري التحميل...</p>
              ) : (
                <p>
                  {data?.totalProducts === 0
                    ? 'لا توجد'
                    : `${data?.from}-${data?.to} من ${data?.totalProducts}`}
                  {' نتيجة'}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant='default'>
            <Link href='/admin/products/create'>إنشاء منتج</Link>
          </Button>
        </div>
        <div>
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
              {data?.products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <TableCell className='text-right py-4 px-4'>
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={product.images[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className='text-right py-4 px-4'>
                    <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className='text-right py-4 px-4 font-semibold text-green-700'>${product.price}</TableCell>
                  <TableCell className='text-right py-4 px-4'>{product.category}</TableCell>
                  <TableCell className='text-right py-4 px-4'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.countInStock > 10 ? 'bg-green-100 text-green-800' : 
                      product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.countInStock}
                    </span>
                  </TableCell>
                  <TableCell className='text-right py-4 px-4'>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{product.avgRating}</span>
                    </span>
                  </TableCell>
                  <TableCell className='text-right py-4 px-4'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isPublished ? 'نعم' : 'لا'}
                    </span>
                  </TableCell>
                  <TableCell className='text-right py-4 px-4 text-sm text-gray-600'>
                    {(product as any).updatedAt ? formatDateTime((product as any).updatedAt).dateTime : 'غير متوفر'}
                  </TableCell>
                  <TableCell className='py-4 px-4'>
                    <div className='flex flex-row gap-2 items-center'>
                      <Button asChild variant='default' size='sm'>
                        <Link href={`/admin/products/${product.id}`}>تعديل</Link>
                      </Button>
                      <Button asChild variant='secondary' size='sm'>
                        <Link target='_blank' href={`/product/${product.slug}`}>
                          عرض
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={product.id}
                        action={deleteProduct}
                        callbackAction={() => {
                          startTransition(async () => {
                            const data = await getAllProductsForAdmin({
                              query: inputValue,
                            })
                            setData(data)
                          })
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(data?.totalPages ?? 0) > 1 && (
            <div className='flex items-center gap-2'>
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
    </div>
  )
}

export default ProductList
