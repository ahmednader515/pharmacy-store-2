import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OrdersList from './orders-list'

export const metadata: Metadata = {
  title: 'Admin Orders',
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const { page = '1' } = await props.searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin') {
    redirect('/')
  }

  // Direct database query for orders and monthly contracts
  const pageSize = 10
  const skip = (Number(page) - 1) * pageSize
  
  const [orders, monthlyContracts, totalOrders, totalContracts] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          }
        }
      }
    }),
    prisma.monthlyContract.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count(),
    prisma.monthlyContract.count()
  ])

  // Convert Decimal values to numbers for client components
  const normalizedOrders = orders.map(order => ({
    ...order,
    itemsPrice: Number(order.itemsPrice),
    shippingPrice: Number(order.shippingPrice),
    taxPrice: Number(order.taxPrice),
    totalPrice: Number(order.totalPrice),
  }))

  const totalPages = Math.ceil((totalOrders + totalContracts) / pageSize)
  
  return (
    <OrdersList 
      orders={normalizedOrders} 
      monthlyContracts={monthlyContracts}
      totalPages={totalPages} 
      currentPage={Number(page)} 
    />
  )
}
