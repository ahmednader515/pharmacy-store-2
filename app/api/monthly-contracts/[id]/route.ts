import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Check if user is admin
    const session = await auth()
    if (session?.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'حالة غير صحيحة' },
        { status: 400 }
      )
    }

    // Update the contract status
    const updatedContract = await prisma.monthlyContract.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة التعاقد بنجاح',
      contract: updatedContract
    })
  } catch (error) {
    console.error('Error updating monthly contract:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user is admin
    const session = await auth()
    if (session?.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get the contract
    const contract = await prisma.monthlyContract.findUnique({
      where: { id }
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'التعاقد غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching monthly contract:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
