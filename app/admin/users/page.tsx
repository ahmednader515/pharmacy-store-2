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
import { deleteUser, getAllUsers } from '@/lib/actions/user.actions'
import { IUserInput } from '@/types'
import { formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default async function AdminUser(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')
  const page = Number(searchParams.page) || 1
  const users = await getAllUsers({
    page,
  })
  return (
    <div className='space-y-2 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 className='h1-bold'>المستخدمون</h1>
      <div>
        <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg mb-6">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الاسم</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>البريد الإلكتروني</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الدور</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.data.map((user: IUserInput & { id: string }) => (
              <TableRow key={user.id} className="hover:bg-gray-50 border-b border-gray-200">
                <TableCell className='text-right py-4 px-4 font-medium'>{user.name}</TableCell>
                <TableCell className='text-right py-4 px-4 text-gray-700'>{user.email}</TableCell>
                <TableCell className='text-right py-4 px-4'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div className='flex flex-row gap-2 items-center'>
                    <Button asChild variant='default' size='sm' className='bg-blue-600 hover:bg-blue-700 shadow-sm border border-gray-200'>
                      <Link href={`/admin/users/${user.id}`}>تعديل</Link>
                    </Button>
                    <DeleteDialog id={user.id} action={deleteUser} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users?.totalPages > 1 && (
          <ServerPagination 
            currentPage={page} 
            totalPages={users?.totalPages} 
            baseUrl="/admin/users"
            searchParams={{ page: page.toString() }}
          />
        )}
      </div>
    </div>
  )
}
