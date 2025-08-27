'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, Trash2 } from 'lucide-react'
import useCartStore from '@/hooks/use-cart-store'
import { toast } from '@/hooks/use-toast'
import { IProduct } from '@/types'
import { formatPrice } from '@/lib/utils'

interface CartAddItemProps {
  product: IProduct
  quantity: number
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export default function CartAddItem({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: CartAddItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.countInStock) return
    
    setIsUpdating(true)
    try {
      onQuantityChange(newQuantity)
      toast({
        title: 'Cart Updated',
        description: 'Item quantity has been updated',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      onRemove()
      toast({
        title: 'Item Removed',
        description: 'Item has been removed from your cart',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='flex items-center gap-4 p-4 border rounded-lg'>
      <div className='flex-1'>
        <h3 className='font-medium'>{product.name}</h3>
        <p className='text-sm text-muted-foreground mb-2'>
          ${formatPrice(product.price || 0)} each
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || isUpdating}
          className='h-8 w-8'
        >
          <Minus className='h-4 w-4' />
        </Button>
        
        <Input
          type='number'
          min='1'
          max={product.countInStock}
          value={quantity}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value) || 1
            handleQuantityChange(newQuantity)
          }}
          className='w-16 text-center h-8'
          disabled={isUpdating}
        />
        
        <Button
          variant='outline'
          size='icon'
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= product.countInStock || isUpdating}
          className='h-8 w-8'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div className='text-right'>
        <p className='font-medium'>${formatPrice(Number(product.price || 0) * quantity)}</p>
        <p className='text-sm text-muted-foreground'>
          {product.countInStock} in stock
        </p>
      </div>

      <Button
        variant='ghost'
        size='icon'
        onClick={handleRemove}
        disabled={isUpdating}
        className='h-8 w-8 text-destructive hover:text-destructive'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}
