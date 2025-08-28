'use client'
import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { calculatePastDate, formatDateTime, formatNumber } from '@/lib/utils'

import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import TableChart from './table-chart'
import { Skeleton } from '@/components/ui/skeleton'

export default function OverviewReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  const [data, setData] = useState<{ [key: string]: any }>()
  const [isPending, startTransition] = useTransition()
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        try {
          const result = await getOrderSummary(date)
          console.log('getOrderSummary result:', result)
          setData(result)
        } catch (error) {
          console.error('Error fetching order summary:', error)
          // Set empty data to prevent infinite loading
          setData({
            ordersCount: 0,
            productsCount: 0,
            usersCount: 0,
            totalSales: 0,
            monthlySales: [],
            salesChartData: [],
            topSalesCategories: [],
            topSalesProducts: [],
            latestOrders: [],
          })
        }
      })
    }
  }, [date])

  // Debug logging
  console.log('OverviewReport data:', data)
  
  if (!data)
    return (
      <div className='space-y-4' style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div>
          <h1 className='h1-bold text-right'>لوحة التحكم</h1>
        </div>
        {/* First Row */}
        <div className='flex gap-4'>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='h-36 w-full' />
          ))}
        </div>

        {/* Second Row */}
        <div>
          <Skeleton className='h-[30rem] w-full' />
        </div>

        {/* Third Row */}
        <div className='flex gap-4'>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-60 w-full' />
          ))}
        </div>

        {/* Fourth Row */}
        <div className='flex gap-4'>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-60 w-full' />
          ))}
        </div>
      </div>
    )

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='flex items-center justify-between mb-2'>
        <h1 className='h1-bold text-right'>لوحة التحكم</h1>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>
      <div className='space-y-4'>
        <div className='grid gap-4  grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-right'>
                إجمالي الإيرادات
              </CardTitle>
              <BadgeDollarSign />
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>
                <ProductPrice price={data.totalSales} plain />
              </div>
              <div>
                <Link className='text-xs' href='/admin/orders'>
                  عرض الإيرادات
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-right'>المبيعات</CardTitle>
              <CreditCard />
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>
                {formatNumber(data.ordersCount)}
              </div>
              <div>
                <Link className='text-xs' href='/admin/orders'>
                  عرض الطلبات
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-right'>العملاء</CardTitle>
              <Users />
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>{data.usersCount}</div>
              <div>
                <Link className='text-xs' href='/admin/users'>
                  عرض العملاء
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-right'>المنتجات</CardTitle>
              <Barcode />
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>{data.productsCount}</div>
              <div>
                <Link className='text-xs' href='/admin/products'>
                  عرض المنتجات
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='text-right'>
              <CardTitle>كم تربح</CardTitle>
              <CardDescription>تقديري · آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.monthlySales || []} labelType='month' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='text-right'>
              <CardTitle>أداء المنتجات</CardTitle>
              <CardDescription>
                من {formatDateTime(date!.from!).dateOnly} إلى{' '}
                {formatDateTime(date!.to!).dateOnly}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.topSalesProducts || []} labelType='product' />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className='text-right'>
              <CardTitle>المبيعات الحديثة</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table - Hidden on mobile */}
              <div className='hidden md:block'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-right'>المشتري</TableHead>
                      <TableHead className='text-right'>التاريخ</TableHead>
                      <TableHead className='text-right'>المجموع</TableHead>
                      <TableHead className='text-right'>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.latestOrders || []).map((order: IOrderList) => (
                      <TableRow key={order.id}>
                        <TableCell className='text-right'>
                          {order.user ? order.user.name : 'مستخدم محذوف'}
                        </TableCell>

                        <TableCell className='text-right'>
                          {formatDateTime(order.createdAt).dateOnly}
                        </TableCell>
                        <TableCell className='text-right'>
                          <ProductPrice price={order.totalPrice} plain />
                        </TableCell>

                        <TableCell className='text-right'>
                          <Link href={`/admin/orders/${order.id}`}>
                            <span className='px-2'>التفاصيل</span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Visible only on mobile */}
              <div className='md:hidden space-y-3'>
                {(data.latestOrders || []).map((order: IOrderList) => (
                  <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    {/* Customer Name */}
                    <div className="font-medium text-gray-900">
                      {order.user ? order.user.name : 'مستخدم محذوف'}
                    </div>
                    
                    {/* Order Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatDateTime(order.createdAt).dateOnly}</span>
                      <span className="font-semibold text-green-600">
                        <ProductPrice price={order.totalPrice} plain />
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="border-t border-gray-200 pt-2">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
