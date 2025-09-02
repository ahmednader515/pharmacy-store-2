import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SettingsForm from './settings-form'
import CategoryManagement from './category-management'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'إعدادات الموقع - لوحة الإدارة',
}

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user.role !== 'Admin') redirect('/')

  const setting = await getSetting()

  return (
    <div className='space-y-6 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div>
        <h1 className='text-3xl font-bold mb-2'>إعدادات الموقع</h1>
        <p className='text-muted-foreground'>
          قم بإدارة إعدادات الموقع والفئات والمنتجات
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
          <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="general" className="space-y-6">
          <SettingsForm setting={setting} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
