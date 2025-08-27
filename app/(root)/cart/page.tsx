'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import useCartStore from '@/hooks/use-cart-store'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { cart: { items, itemsPrice }, updateItem, removeItem, clearCart } = useCartStore()

  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity < 1) return
    updateItem(item, newQuantity)
  }

  const handleRemoveItem = (item: any) => {
    removeItem(item)
    toast({
      title: 'تم حذف المنتج',
      description: 'تم حذف المنتج من عربة التسوق',
      variant: 'default',
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: 'تم إفراغ العربة',
      description: 'تم حذف جميع المنتجات من عربة التسوق',
      variant: 'default',
    })
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8' dir='rtl'>
        <div className='text-center py-12'>
          <ShoppingCart className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h1 className='text-2xl font-bold mb-2'>عربة التسوق فارغة</h1>
          <p className='text-muted-foreground mb-6'>
            يبدو أنك لم تضيف أي منتجات إلى عربة التسوق بعد.
          </p>
          <Button asChild size='lg'>
            <Link href='/'>ابدأ التسوق</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8' dir='rtl'>
      <div className='flex items-center gap-4 mb-8'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/'>
            <ArrowLeft className='h-4 w-4 ml-2' />
            متابعة التسوق
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>عربة التسوق</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>
              المنتجات ({totalItems})
            </h2>
            <Button
              variant='outline'
              size='sm'
              onClick={handleClearCart}
              className='text-destructive hover:text-destructive'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              إفراغ العربة
            </Button>
          </div>

                     <div className='space-y-4'>
             {items.map((item) => (
               <Card key={item.clientId} className='overflow-hidden'>
                 <CardContent className='p-4'>
                   <div className='flex gap-4'>
                     <div className='relative h-24 w-24 flex-shrink-0'>
                       <Image
                         src={item.image || '/placeholder.jpg'}
                         alt={item.name}
                         fill
                         className='object-cover rounded-md'
                       />
                     </div>
                     <div className='flex-1 min-w-0'>
                       <h3 className='font-medium mb-1 line-clamp-2'>
                         <Link href={`/product/${item.slug}`} className='hover:underline'>
                           {item.name}
                         </Link>
                       </h3>
                       <p className='text-sm text-muted-foreground mb-2'>
                         ${formatPrice(item.price)} لكل قطعة
                       </p>
                       <div className='flex items-center gap-2'>
                         <Button
                           variant='outline'
                           size='sm'
                           onClick={() => handleQuantityChange(item, item.quantity - 1)}
                           disabled={item.quantity <= 1}
                         >
                           -
                         </Button>
                         <span className='px-3 py-1 border rounded min-w-[3rem] text-center'>
                           {item.quantity}
                         </span>
                         <Button
                           variant='outline'
                           size='sm'
                           onClick={() => handleQuantityChange(item, item.quantity + 1)}
                         >
                           +
                         </Button>
                         <Button
                           variant='ghost'
                           size='sm'
                           onClick={() => handleRemoveItem(item)}
                           className='text-destructive hover:text-destructive mr-auto'
                         >
                           <Trash2 className='h-4 w-4' />
                         </Button>
                       </div>
                     </div>
                     <div className='text-right'>
                       <p className='font-medium text-lg'>
                         ${formatPrice(Number(item.price || 0) * item.quantity)}
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                             <div className='space-y-2'>
                 <div className='flex justify-between'>
                   <span>المجموع الفرعي ({totalItems} منتج)</span>
                   <span>${itemsPrice.toFixed(2)}</span>
                 </div>
                 <div className='flex justify-between'>
                   <span>التوصيل</span>
                   <span className='text-blue-600'>مجاني</span>
                 </div>
                 <Separator />
                 <div className='flex justify-between font-semibold text-lg'>
                   <span>المجموع الكلي</span>
                   <span>${itemsPrice.toFixed(2)}</span>
                 </div>
               </div>

              <Button asChild className='w-full' size='lg'>
                <Link href='/checkout'>المتابعة للدفع</Link>
              </Button>

              <p className='text-xs text-muted-foreground text-center'>
                بمتابعة الدفع، أنت توافق على الشروط والأحكام.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
