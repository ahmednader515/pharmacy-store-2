import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, branch, medicineNames, prescriptionUrl } = body

    // Validate required fields
    if (!name || !phone || !email || !branch || !medicineNames) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Create monthly contract
    const contract = await prisma.monthlyContract.create({
      data: {
        name,
        phone,
        email,
        branch,
        medicineNames,
        prescriptionUrl: prescriptionUrl || null,
        status: 'pending'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'تم إرسال طلب التعاقد الشهري بنجاح',
        contractId: contract.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating monthly contract:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const contracts = await prisma.monthlyContract.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching monthly contracts:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
