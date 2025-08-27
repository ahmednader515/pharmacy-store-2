import Link from 'next/link'
import Image from 'next/image'
import SeparatorWithOr from '@/components/shared/separator-or'
import Header from '@/components/shared/header'
import data from '@/lib/data'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = data.settings[0];
  return (
    <div className='flex flex-col min-h-screen highlight-link'>
      <Header />
      <main className='mx-auto w-[80%] min-w-80 p-4 flex-1 flex flex-col items-center justify-center'>{children}</main>
      <footer className='bg-gray-800 w-full flex flex-col gap-4 items-center p-8 text-sm'>
        <div className='flex justify-center space-x-4'>
          <Link href='/page/conditions-of-use'>Conditions of Use</Link>
          <Link href='/page/privacy-policy'> Privacy Notice</Link>
          <Link href='/page/help'> Help </Link>
        </div>
        <div>
          <p className='text-gray-400'>{site.copyright}</p>
        </div>
      </footer>
    </div>
  )
}
