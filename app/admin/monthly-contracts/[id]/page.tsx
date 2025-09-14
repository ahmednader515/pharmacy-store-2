import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import MonthlyContractDetails from './monthly-contract-details'

export const metadata: Metadata = {
  title: 'تفاصيل التعاقد الشهري',
}

export default async function MonthlyContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (session?.user.role !== 'Admin') {
    redirect('/')
  }

  // Fetch the monthly contract
  const contract = await prisma.monthlyContract.findUnique({
    where: { id }
  })

  if (!contract) {
    redirect('/admin/orders')
  }

  return <MonthlyContractDetails contract={contract} />
}
