'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'نظرة عامة', href: '/admin/overview', icon: BarChart3 },
  { name: 'المنتجات', href: '/admin/products', icon: Package },
  { name: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { name: 'المستخدمون', href: '/admin/users', icon: Users },
  { name: 'صفحات الويب', href: '/admin/web-pages', icon: FileText },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className='flex flex-row space-x-2 space-x-reverse overflow-x-auto rtl' style={{ fontFamily: 'Cairo, sans-serif' }}>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Button
            key={item.name}
            asChild
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              'justify-start text-right',
              isActive && 'bg-primary text-primary-foreground'
            )}
          >
            <Link href={item.href}>
              <item.icon className='ml-2 h-4 w-4' />
              {item.name}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
