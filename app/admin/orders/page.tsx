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

export const metadata: Metadata = {
  title: 'Admin Orders',
}
export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams

  const { page = '1' } = searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  const orders = await getAllOrders({
    page: Number(page),
  })
  return (
    <div className='space-y-2 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 className='h1-bold'>الطلبات</h1>
      <div className='overflow-x-auto'>
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
              <TableRow key={order.id} className="hover:bg-gray-50 border-b border-gray-200">
                <TableCell className='text-right py-4 px-4'>
                  {formatDateTime(order.createdAt!).dateTime}
                </TableCell>
                <TableCell className='text-right py-4 px-4'>
                  {order.user ? order.user.name : 'مستخدم محذوف'}
                </TableCell>
                <TableCell className='text-right py-4 px-4 font-semibold text-green-700'>
                  {' '}
                  <ProductPrice price={order.totalPrice} plain />
                </TableCell>
                <TableCell className='text-right py-4 px-4'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.isPaid && order.paidAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : 'لا'}
                  </span>
                </TableCell>
                <TableCell className='text-right py-4 px-4'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.isDelivered && order.deliveredAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : 'لا'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div className='flex flex-row gap-2 items-center'>
                    <Button asChild variant='default' size='sm' className='bg-blue-600 hover:bg-blue-700'>
                      <Link href={`/admin/orders/${order.id}`}>التفاصيل</Link>
                    </Button>
                    <DeleteDialog id={order.id} action={deleteOrder} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <ServerPagination 
            currentPage={parseInt(page)} 
            totalPages={orders.totalPages!} 
            baseUrl="/admin/orders"
            searchParams={{ page }}
          />
        )}
      </div>
    </div>
  )
}
