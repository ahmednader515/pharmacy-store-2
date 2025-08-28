import { Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import DeleteDialog from '@/components/shared/delete-dialog'
import ServerPagination from '@/components/shared/server-pagination'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions'
import { formatDateTime, formatId } from '@/lib/utils'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { useLoading } from '@/hooks/use-loading'
import { LoadingSpinner } from '@/components/shared/loading-overlay'

export const metadata: Metadata = {
  title: 'Admin Orders',
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const { page = '1' } = await props.searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  const orders = await getAllOrders({
    page: Number(page),
  })
  
  return (
    <div className='space-y-4 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 className='h1-bold'>الطلبات</h1>
      
      {/* Desktop Table - Hidden on mobile */}
      <div className='hidden md:block overflow-x-auto'>
        <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>التاريخ</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المشتري</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المجموع</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>مدفوع</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>مُسلم</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order: IOrderList) => (
              <TableRow key={order.id} className="border-b border-gray-200">
                <TableCell className='py-4 px-4'>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div>
                    <div className='font-medium'>{order.user.name}</div>
                    <div className='text-sm text-gray-500'>{order.user.email}</div>
                  </div>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <ProductPrice price={order.totalPrice} />
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    order.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    order.isDelivered 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.isDelivered ? 'مُسلم' : 'قيد التوصيل'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div className='flex gap-2'>
                    <Button asChild size='sm'>
                      <Link href={`/admin/orders/${order.id}`}>
                        عرض التفاصيل
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={order.id}
                      action={deleteOrder}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - Visible only on mobile */}
      <div className='md:hidden space-y-4'>
        {orders.data.map((order: IOrderList) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {formatDateTime(order.createdAt).dateTime}
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  order.isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  order.isDelivered 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.isDelivered ? 'مُسلم' : 'قيد التوصيل'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t border-gray-100 pt-3">
              <div className="font-medium text-gray-900">{order.user.name}</div>
              <div className="text-sm text-gray-500">{order.user.email}</div>
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-600 mb-1">المجموع:</div>
              <div className="text-lg font-semibold text-green-600">
                <ProductPrice price={order.totalPrice} />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-3 flex gap-2">
              <Button asChild size='sm' className="flex-1">
                <Link href={`/admin/orders/${order.id}`}>
                  عرض التفاصيل
                </Link>
              </Button>
              <DeleteDialog
                id={order.id}
                action={deleteOrder}
              />
            </div>
          </div>
        ))}
      </div>
      
      {orders.totalPages > 1 && (
        <ServerPagination
          currentPage={Number(page)}
          totalPages={orders.totalPages}
          baseUrl="/admin/orders"
        />
      )}
    </div>
  )
}
