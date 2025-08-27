import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminNav from './admin-nav'
import Menu from '@/components/shared/header/menu'
import Footer from '@/components/shared/footer'
import data from '@/lib/data'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user.role !== 'Admin') redirect('/')
  
  const { site } = data.settings[0];
  return (
    <>
      <div className='flex flex-col min-h-screen rtl admin-container' style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div className='bg-black text-white'>
          <div className='flex h-16 items-center px-2 md:px-4'>
            <Link href='/'>
              <Image
                src='/icons/logo.svg'
                width={48}
                height={48}
                alt={`${site.name} logo`}
              />
            </Link>
            <div className='mr-4 md:mr-6 flex'>
              <AdminNav />
            </div>
            <div className='mr-auto'></div>
            <div className='flex items-center space-x-reverse space-x-4'>
              <Menu forAdmin />
            </div>
          </div>
          <div>
            <div className='hidden px-4 pb-2'>
              <AdminNav />
            </div>
          </div>
        </div>
        <main className='flex-1 p-4 rtl admin-container' style={{ fontFamily: 'Cairo, sans-serif' }}>{children}</main>
        <Footer />
      </div>
    </>
  )
}
