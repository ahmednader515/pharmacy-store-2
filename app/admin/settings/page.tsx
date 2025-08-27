import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export const metadata: Metadata = {
  title: 'إعدادات الموقع - لوحة الإدارة',
}

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user.role !== 'Admin') redirect('/')

  return (
    <div className='space-y-6 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div>
        <h1 className='text-3xl font-bold mb-2'>إعدادات الموقع</h1>
        <p className='text-muted-foreground'>
          قم بإدارة إعدادات الكاروسيل، أوقات التوصيل، الأسعار، والضرائب
        </p>
      </div>
      
      <SettingsForm />
    </div>
  )
}
