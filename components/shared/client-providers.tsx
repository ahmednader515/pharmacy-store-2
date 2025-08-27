'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
import { ThemeProvider } from './theme-provider'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'
import data from '@/lib/data'

export default function ClientProviders({
  children,
  session,
}: {
  children: React.ReactNode
  session?: any
}) {
  const visible = useCartSidebar()
  const setting = data.settings[0];

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AppInitializer>
          {visible ? (
            <div className='flex min-h-screen'>
              <div className='flex-1 overflow-hidden'>{children}</div>
              <CartSidebar />
            </div>
          ) : (
            <div>{children}</div>
          )}
          <Toaster />
        </AppInitializer>
      </ThemeProvider>
    </SessionProvider>
  )
}
