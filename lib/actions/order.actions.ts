'use server'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { formatError, round2 } from '../utils'
import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import { revalidatePath } from 'next/cache'
import { sendAskReviewOrderItems, sendPurchaseReceipt } from '@/lib/services/email.service'

import { DateRange } from 'react-day-picker'
import data from '../data'

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    const connection = await connectToDatabase()
    const session = await auth()
    
    console.log('🔍 Order creation debug:')
    console.log('Session:', session)
    console.log('Session user ID:', session?.user?.id)
    // Using real database connection
    
    if (!session) throw new Error('User not authenticated')
    
    // Mock mode removed: always use database
    
    // Validate that cart exists and has items
    if (!clientSideCart || !clientSideCart.items || !Array.isArray(clientSideCart.items)) {
      return { 
        success: false, 
        message: `Invalid cart data. Please refresh your cart and try again.` 
      }
    }
    
    // Validate that all cart items have valid clientId
    const invalidItems = clientSideCart.items.filter(item => !item.clientId || item.clientId.trim() === '')
    if (invalidItems.length > 0) {
      return { 
        success: false, 
        message: `Some items are missing required information. Please refresh your cart and try again.` 
      }
    }
    
    // Verify user exists in database
    if (connection.prisma && session.user.id) {
      const dbUser = await connection.prisma.user.findUnique({
        where: { id: session.user.id }
      })
      console.log('Database user found:', dbUser)
      
      if (!dbUser) {
        throw new Error(`User with ID ${session.user.id} not found in database`)
      }
    }
    
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    return {
      success: true, message: 'تم تأكيد الطلب بنجاح',
      data: { orderId: createdOrder.id },
    }
  } catch (error) {
    console.error('❌ Order creation error:', error)
    return { success: false, message: formatError(error) }
  }
}
export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  // Validate that cart exists and has items
  if (!clientSideCart || !clientSideCart.items || !Array.isArray(clientSideCart.items)) {
    throw new Error('Invalid cart data')
  }
  
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    throw new Error('Database connection failed')
  }
  
  const cart = {
    ...clientSideCart,
    ...calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    }),
  }

  const orderData = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })
  
  return await connection.prisma.order.create({
    data: {
      userId: orderData.user as string,
      expectedDeliveryDate: orderData.expectedDeliveryDate,
      paymentMethod: orderData.paymentMethod,
      paymentResult: orderData.paymentResult as any,
      itemsPrice: orderData.itemsPrice,
      shippingPrice: orderData.shippingPrice,
      taxPrice: orderData.taxPrice,
      totalPrice: orderData.totalPrice,
      isPaid: orderData.isPaid,
      paidAt: orderData.paidAt,
      isDelivered: orderData.isDelivered,
      deliveredAt: orderData.deliveredAt,
      orderItems: {
        create: orderData.items.map(item => ({
          productId: item.product,
          clientId: item.clientId,
          name: item.name,
          slug: item.slug,
          category: item.category,
          quantity: item.quantity,
          countInStock: item.countInStock,
          image: item.image,
          price: item.price,
          size: item.size,
          color: item.color,
        }))
      },
      shippingAddress: {
        create: {
          street: orderData.shippingAddress.street,
          province: orderData.shippingAddress.province,
          area: orderData.shippingAddress.area,
          apartment: orderData.shippingAddress.apartment,
          building: orderData.shippingAddress.building,
          floor: orderData.shippingAddress.floor,
          landmark: orderData.shippingAddress.landmark,
        }
      }
    },
    include: {
      orderItems: true,
      shippingAddress: true,
      user: true
    }
  })
}

export async function updateOrderToPaid(orderId: string) {
  try {
    const connection = await connectToDatabase()
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      return { success: false, message: 'فشل الاتصال بقاعدة البيانات' }
    }
    
    const order = await connection.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { phone: true, name: true }
        }
      }
    })
    if (!order) throw new Error('Order not found')
    if (order.isPaid) throw new Error('Order is already paid')
    
    await connection.prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    })
    
    await updateProductStock(orderId)
    if (order.user.phone) await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'تم دفع الطلب بنجاح' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
const updateProductStock = async (orderId: string) => {
  try {
    const connection = await connectToDatabase()
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      throw new Error('Database connection failed')
    }
    
    const order = await connection.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })
    if (!order) throw new Error('Order not found')

    for (const item of order.orderItems) {
      await connection.prisma.product.update({
        where: { id: item.productId },
        data: {
          countInStock: {
            decrement: item.quantity
          }
        }
      })
    }
    return true
  } catch (error) {
    throw error
  }
}
export async function deliverOrder(orderId: string) {
  try {
    const connection = await connectToDatabase()
    
    // Mock mode removed: always use database
    
    if (!connection.prisma) {
      return { success: false, message: 'فشل الاتصال بقاعدة البيانات' }
    }
    
    const order = await connection.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { phone: true, name: true }
        }
      }
    })
    if (!order) throw new Error('Order not found')
    if (!order.isPaid) throw new Error('Order is not paid')
    
    await connection.prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      }
    })
    
    if (order.user.phone) await sendAskReviewOrderItems({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'تم تسليم الطلب بنجاح' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

// DELETE
export async function deleteOrder(id: string) {
  try {
    const connection = await connectToDatabase()
    
    
    if (!connection.prisma) {
      return { success: false, message: 'فشل الاتصال بقاعدة البيانات' }
    }
    
    const res = await connection.prisma.order.delete({
      where: { id }
    })
    if (!res) throw new Error('Order not found')
    revalidatePath('/admin/orders')
    return {
      success: true,
      message: 'تم حذف الطلب بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL ORDERS

export async function getAllOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = data.settings[0];
  limit = limit || pageSize
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    console.warn('Database connection failed in getAllOrders')
    return {
      data: [],
      totalPages: 1,
    }
  }
  
  const skipAmount = (Number(page) - 1) * limit
  const orders = await connection.prisma.order.findMany({
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: skipAmount,
    take: limit,
  })
  const ordersCount = await connection.prisma.order.count()
  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = data.settings[0];
  limit = limit || pageSize
  const connection = await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('User is not authenticated')
  }
  
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    console.warn('Database connection failed in getMyOrders')
    return {
      data: [],
      totalPages: 1,
    }
  }
  
  const skipAmount = (Number(page) - 1) * limit
  const orders = await connection.prisma.order.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: skipAmount,
    take: limit,
  })
  const ordersCount = await connection.prisma.order.count({
    where: { userId: session?.user?.id }
  })

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}
export async function getOrderById(orderId: string) {
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database
  
  if (!connection.prisma) {
    console.warn('Database connection failed in getOrderById')
    return null
  }
  
  const order = await connection.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shippingAddress: true,
      orderItems: {
        include: {
          product: true
        }
      },
      user: {
        select: { name: true, phone: true }
      }
    }
  })
  return JSON.parse(JSON.stringify(order))
}







export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const { availableDeliveryDates } = data.settings[0];
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ]
  
  // Calculate expected delivery date (5 days from now)
  const expectedDeliveryDate = new Date()
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5)
  
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  )
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    expectedDeliveryDate,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  try {
    // Validate date range
    if (!date || !date.from || !date.to) {
      console.error('Invalid date range provided:', date)
      throw new Error('Invalid date range provided')
    }
    
    const connection = await connectToDatabase()

    if (connection.isMock) {
      console.log('📝 Mock mode: returning mock order summary data')
      // Return mock data for order summary
      return {
        ordersCount: 3, // Mock orders from data.ts
        productsCount: data.products.length,
        usersCount: data.users.length,
        totalSales: 173.32, // Sum of mock orders
        monthlySales: [
          { label: '2024-01', value: 54.64 },
          { label: '2024-02', value: 40.51 },
          { label: '2024-03', value: 78.17 },
        ],
        salesChartData: [
          { date: '2024-01-15', totalSales: 54.64 },
          { date: '2024-02-20', totalSales: 40.51 },
          { date: '2024-03-10', totalSales: 78.17 },
        ],
        topSalesCategories: [
          { _id: 'تسكين الآلام', totalSales: 3 },
          { _id: 'فيتامينات ومكملات غذائية', totalSales: 4 },
          { _id: 'الحساسية والجيوب الأنفية', totalSales: 1 },
        ],
        topSalesProducts: [
          { id: '1', label: 'Tylenol Extra Strength', image: '/images/p11-1.jpg', value: 25.98 },
          { id: '2', label: 'Centrum Silver Multivitamin', image: '/images/p13-1.jpg', value: 18.99 },
          { id: '3', label: 'Claritin 24-Hour', image: '/images/p14-1.jpg', value: 16.99 },
        ],
        latestOrders: [
          {
            id: 'order-1',
            user: { name: 'John Doe' },
            totalPrice: 54.64,
            createdAt: new Date('2024-01-15'),
          },
          {
            id: 'order-2',
            user: { name: 'Jane Harris' },
            totalPrice: 40.51,
            createdAt: new Date('2024-02-20'),
          },
          {
            id: 'order-3',
            user: { name: 'Jack Ryan' },
            totalPrice: 78.17,
            createdAt: new Date('2024-03-10'),
          },
        ],
      }
    }

    if (!connection.prisma) {
      throw new Error('Database connection failed')
    }

  const [ordersCount, productsCount, usersCount] = await Promise.all([
    connection.prisma.order.count({
      where: {
        createdAt: {
          gte: date.from,
          lte: date.to,
        },
      },
    }),
    connection.prisma.product.count({
      where: {
        createdAt: {
          gte: date.from,
          lte: date.to,
        },
      },
    }),
    connection.prisma.user.count({
      where: {
        createdAt: {
          gte: date.from,
          lte: date.to,
        },
      },
    }),
  ])

  // Calculate total sales
  const totalSalesResult = await connection.prisma.order.aggregate({
    where: {
      createdAt: {
        gte: date.from,
        lte: date.to,
      },
    },
    _sum: {
      totalPrice: true,
    },
  })
  const totalSales = totalSalesResult._sum.totalPrice || 0

  // Calculate monthly sales
  const today = new Date()
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  )
  
  const monthlySalesData = await connection.prisma.order.findMany({
    where: {
      createdAt: {
        gte: sixMonthEarlierDate,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  })

  // Process monthly sales data
  const monthlySalesMap = new Map<string, number>()
  monthlySalesData.forEach((order: any) => {
    const monthKey = order.createdAt.toISOString().slice(0, 7) // YYYY-MM format
    monthlySalesMap.set(monthKey, (monthlySalesMap.get(monthKey) || 0) + Number(order.totalPrice))
  })

  const monthlySales = Array.from(monthlySalesMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.label.localeCompare(a.label))

  const topSalesCategories = await getTopSalesCategories(date)
  const topSalesProducts = await getTopSalesProducts(date)

  const {
    common: { pageSize },
  } = data.settings[0];
  const limit = pageSize
  
  const latestOrders = await connection.prisma.order.findMany({
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

    const result = {
      ordersCount,
      productsCount,
      usersCount,
      totalSales: Number(totalSales),
      monthlySales: JSON.parse(JSON.stringify(monthlySales)),
      salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
      topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
      topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
      latestOrders: JSON.parse(JSON.stringify(latestOrders)),
    }
    
    return result
  } catch (error) {
    console.error('Error in getOrderSummary:', error)
    throw error
  }
}

async function getSalesChartData(date: DateRange) {
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database

  if (!connection.prisma) {
    return []
  }

  const orders = await connection.prisma.order.findMany({
    where: {
      createdAt: {
        gte: date.from,
        lte: date.to,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  })

  // Group by date and calculate total sales
  const salesByDate = new Map<string, number>()
  orders.forEach((order: any) => {
    const dateKey = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD format
    salesByDate.set(dateKey, (salesByDate.get(dateKey) || 0) + Number(order.totalPrice))
  })

  return Array.from(salesByDate.entries())
    .map(([date, totalSales]) => ({ date, totalSales }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function getTopSalesProducts(date: DateRange) {
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database

  if (!connection.prisma) {
    return []
  }

  const orders = await connection.prisma.order.findMany({
    where: {
      createdAt: {
        gte: date.from,
        lte: date.to,
      },
    },
    include: {
      orderItems: true,
    },
  })

  // Calculate total sales per product
  const productSales = new Map<string, { name: string; image: string; totalSales: number }>()
  
  orders.forEach((order: any) => {
    order.orderItems.forEach((item: any) => {
      const productId = item.productId
      const existing = productSales.get(productId)
      const itemTotal = item.quantity * Number(item.price)
      
      if (existing) {
        existing.totalSales += itemTotal
      } else {
        productSales.set(productId, {
          name: item.name,
          image: item.image,
          totalSales: itemTotal,
        })
      }
    })
  })

  return Array.from(productSales.entries())
    .map(([id, data]) => ({
      id,
      label: data.name,
      image: data.image,
      value: data.totalSales,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  const connection = await connectToDatabase()
  
  // Mock mode removed: always use database

  if (!connection.prisma) {
    return []
  }

  const orders = await connection.prisma.order.findMany({
    where: {
      createdAt: {
        gte: date.from,
        lte: date.to,
      },
    },
    include: {
      orderItems: true,
    },
  })

  // Calculate total sales per category
  const categorySales = new Map<string, number>()
  
  orders.forEach((order: any) => {
    order.orderItems.forEach((item: any) => {
      const category = item.category
      categorySales.set(category, (categorySales.get(category) || 0) + item.quantity)
    })
  })

  return Array.from(categorySales.entries())
    .map(([category, totalSales]) => ({
      _id: category,
      totalSales,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit)
}
