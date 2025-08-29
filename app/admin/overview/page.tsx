import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { auth } from '@/auth'
import { getOverviewHeaderStats } from '@/lib/actions/order.actions'
import { calculatePastDate } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  // Prefetch default (last 30 days) overview data on the server to avoid
  // client-side loading delays
  const initialDate: DateRange = {
    from: calculatePastDate(30),
    to: new Date(),
  }
  const initialHeader = await getOverviewHeaderStats(initialDate)
  return <OverviewReport initialDate={initialDate} initialHeader={initialHeader} />
}

export default DashboardPage
