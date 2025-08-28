'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import useCartStore from '@/hooks/use-cart-store'
import ProductPrice from '@/components/shared/product/product-price'
import { useLoading } from '@/hooks/use-loading'
import { LoadingSpinner } from '@/components/shared/loading-overlay'
import data from '@/lib/data'

export default function CartSidebar() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore()
  const {
    common: { freeShippingMinPrice },
  } = data.settings[0];

  const { isLoading: isUpdating, withLoading } = useLoading()

  const handleQuantityChange = async (item: any, newQuantity: number) => {
    await withLoading(
      async () => {
        updateItem(item, newQuantity)
      }
    )
  }

  const handleRemoveItem = async (item: any) => {
    await withLoading(
      async () => {
        removeItem(item)
      }
    )
  }

  return (
    <div className='w-full h-full flex flex-col' dir='rtl'>
      <div className='w-24 sm:w-32 fixed h-full border-r'>
        <div className='p-2 h-full flex flex-col gap-2 justify-center items-center'>
          <div className='text-center space-y-2'>
            <div className='text-xs sm:text-sm'>المجموع الفرعي</div>
            <div className='font-bold text-sm sm:text-base'>
              <ProductPrice price={itemsPrice} plain />
            </div>
            {itemsPrice > freeShippingMinPrice && (
              <div className='text-center text-xs'>
                طلبك مؤهل للشحن المجاني
              </div>
            )}

            <Link
              className={`rounded-full hover:no-underline w-full text-xs sm:text-sm btn-mobile`}
              href='/cart'
            >
              الذهاب إلى السلة
            </Link>
            <Separator className='mt-3' />
          </div>

          <ScrollArea className='flex-1 w-full'>
            {items.map((item) => (
              <div key={item.clientId}>
                <div className='my-2 sm:my-3'>
                  <Link href={`/product/${item.slug}`}>
                    <div className='relative h-16 sm:h-24'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes='20vw'
                        className='object-contain'
                      />
                    </div>
                  </Link>
                  <div className='text-xs sm:text-sm text-center font-bold'>
                    <ProductPrice price={item.price} plain />
                  </div>
                  <div className='flex gap-1 sm:gap-2 mt-2 justify-center'>
                    <Select
                      value={item.quantity.toString()}
                      onValueChange={(value) => {
                        handleQuantityChange(item, Number(value))
                      }}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className='text-xs w-10 sm:w-12 ml-1 h-auto py-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.countInStock }).map(
                          (_, i) => (
                            <SelectItem value={(i + 1).toString()} key={i + 1}>
                              {i + 1}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => handleRemoveItem(item)}
                      disabled={isUpdating}
                      className='h-8 w-8 sm:h-9 sm:w-9 p-0'
                    >
                      {isUpdating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className='w-3 h-3 sm:w-4 sm:h-4' />
                      )}
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}