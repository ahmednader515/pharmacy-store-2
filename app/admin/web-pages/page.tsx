import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatId } from '@/lib/utils'
import { Metadata } from 'next'
import { deleteWebPage, getAllWebPages } from '@/lib/actions/web-page.actions'
import { IWebPageInput } from '@/types'

export const metadata: Metadata = {
  title: 'Admin Web Pages',
}

export default async function WebPageAdminPage() {
  const webPages = await getAllWebPages()
  return (
    <div className='space-y-2 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='flex-between'>
        <h1 className='h1-bold'>صفحات الويب</h1>
        <Button asChild variant='default'>
          <Link href='/admin/web-pages/create'>إنشاء صفحة ويب</Link>
        </Button>
      </div>
      <div>
        <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الاسم</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الرابط</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>منشور</TableHead>
              <TableHead className='w-[120px] text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webPages.map((webPage: IWebPageInput & { id: string }) => (
              <TableRow key={webPage.id} className="hover:bg-gray-50 border-b border-gray-200">
                <TableCell className='text-right py-4 px-4 font-medium'>{webPage.title}</TableCell>
                <TableCell className='text-right py-4 px-4 text-gray-700 font-mono text-sm'>{webPage.slug}</TableCell>
                <TableCell className='text-right py-4 px-4'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    webPage.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webPage.isPublished ? 'نعم' : 'لا'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div className='flex flex-row gap-2 items-center'>
                    <Button asChild variant='default' size='sm' className='bg-blue-600 hover:bg-blue-700 shadow-sm border border-gray-200'>
                      <Link href={`/admin/web-pages/${webPage.id}`}>تعديل</Link>
                    </Button>
                    <DeleteDialog id={webPage.id} action={deleteWebPage} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
