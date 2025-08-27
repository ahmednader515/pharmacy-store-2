'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/lib/actions/order.actions'

import { ShippingAddressSchema } from '@/lib/validator'
import { zodResolver } from '@hookform/resolvers/zod'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import CheckoutFooter from './checkout-footer'
import { ShippingAddress } from '@/types'

import Link from 'next/link'
import useCartStore from '@/hooks/use-cart-store'
import ProductPrice from '@/components/shared/product/product-price'
import data from '@/lib/data'

const shippingAddressDefaultValues = {
  street: '',
  province: '',
  area: '',
  apartment: '',
  building: '',
  floor: '',
  landmark: '',
}

export default function CheckoutForm() {
  const { site, availablePaymentMethods, defaultPaymentMethod } = data.settings[0];
  const { toast } = useToast()
  const router = useRouter()

  const {
    cart: {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      paymentMethod = 'دفع عند الاستلام',
    },
    setShippingAddress,
    setPaymentMethod,
    clearCart,
    cleanupInvalidItems,
    regenerateClientIds,
  } = useCartStore()


  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  })
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values)
    setIsAddressSelected(true)
  }



  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false)
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false)

  const handlePlaceOrder = async () => {
    // Ensure all items have valid clientIds before placing order
    regenerateClientIds()
    
    // Get the current cart state
    const currentCart = useCartStore.getState().cart
    
    const res = await createOrder(currentCart)
    if (!res.success) {
      toast({
        description: res.message,
        variant: 'destructive',
      })
    } else {
      toast({
        description: res.message,
        variant: 'default',
      })
      clearCart()
      router.push(`/checkout/${res.data?.orderId}`)
    }
  }
  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true)
    setIsPaymentMethodSelected(true)
  }
  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)()
  }
  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        {!isAddressSelected && (
          <div className='border-b mb-4'>
            <Button
              className='rounded-full w-full'
              onClick={handleSelectShippingAddress}
            >
              التوصيل إلى هذا العنوان
            </Button>
            <p className='text-xs text-center py-2'>
              اختر عنوان التوصيل وطريقة الدفع لحساب رسوم التوصيل والمعالجة والضريبة.
            </p>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className=' mb-4'>
            <Button
              className='rounded-full w-full'
              onClick={handleSelectPaymentMethod}
            >
              استخدم طريقة الدفع هذه
            </Button>

            <p className='text-xs text-center py-2'>
              اختر طريقة الدفع للمتابعة. ستتمكن من مراجعة وتعديل طلبك قبل أن يصبح نهائياً.
            </p>
            

          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button onClick={handlePlaceOrder} className='rounded-full w-full'>
              تأكيد الطلب
            </Button>
          </div>
        )}

        <div>
          <div className='text-lg font-bold'>ملخص الطلب</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>المنتجات:</span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>التوصيل والمعالجة:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'مجاني'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>الضريبة:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-4 font-bold text-lg'>
              <span>المجموع الكلي:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto highlight-link' dir='rtl'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* shipping address */}
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className='grid grid-cols-1 md:grid-cols-12    my-3  pb-3'>
                <div className='col-span-5 flex text-lg font-bold '>
                  <span className='w-8'>1 </span>
                  <span>عنوان التوصيل</span>
                </div>
                <div className='col-span-5 '>
                  <p>
                    {shippingAddress.street} <br />
                    {shippingAddress.building && `${shippingAddress.building}, `}
                    {shippingAddress.apartment && `${shippingAddress.apartment}, `}
                    {shippingAddress.floor && `${shippingAddress.floor}, `}
                    {`${shippingAddress.area}, ${shippingAddress.province}`}
                    {shippingAddress.landmark && <><br />{shippingAddress.landmark}</>}
                  </p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setIsAddressSelected(false)
                      setIsPaymentMethodSelected(true)
                    }}
                  >
                    تغيير
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className='flex text-primary text-lg font-bold my-2'>
                  <span className='w-8'>1 </span>
                  <span>أدخل عنوان التوصيل</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form
                    method='post'
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className='space-y-4'
                  >
                    <Card className='md:mr-8 my-4'>
                      <CardContent className='p-4 space-y-2'>
                        <div className='text-lg font-bold mb-2'>
                          عنوانك
                        </div>

                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name='street'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>العنوان (الشارع، الشقة، الجناح، الوحدة، إلخ)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='أدخل العنوان'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='province'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>المحافظة</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                                  >
                                    <option value=''>اختر المحافظة</option>
                                    <option value='القاهرة'>القاهرة</option>
                                    <option value='الجيزة'>الجيزة</option>
                                    <option value='الإسكندرية'>الإسكندرية</option>
                                    <option value='أسيوط'>أسيوط</option>
                                    <option value='سوهاج'>سوهاج</option>
                                    <option value='قنا'>قنا</option>
                                    <option value='الأقصر'>الأقصر</option>
                                    <option value='أسوان'>أسوان</option>
                                    <option value='بني سويف'>بني سويف</option>
                                    <option value='المنيا'>المنيا</option>
                                    <option value='الفيوم'>الفيوم</option>
                                    <option value='المنوفية'>المنوفية</option>
                                    <option value='الغربية'>الغربية</option>
                                    <option value='كفر الشيخ'>كفر الشيخ</option>
                                    <option value='الدقهلية'>الدقهلية</option>
                                    <option value='الشرقية'>الشرقية</option>
                                    <option value='البحيرة'>البحيرة</option>
                                    <option value='دمياط'>دمياط</option>
                                    <option value='بورسعيد'>بورسعيد</option>
                                    <option value='الإسماعيلية'>الإسماعيلية</option>
                                    <option value='السويس'>السويس</option>
                                    <option value='شمال سيناء'>شمال سيناء</option>
                                    <option value='جنوب سيناء'>جنوب سيناء</option>
                                    <option value='البحر الأحمر'>البحر الأحمر</option>
                                    <option value='الوادي الجديد'>الوادي الجديد</option>
                                    <option value='مطروح'>مطروح</option>
                                    <option value='شرم الشيخ'>شرم الشيخ</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='area'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>المنطقة</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                                  >
                                    <option value=''>اختر المنطقة</option>
                                    <option value='القاهرة الجديدة'>القاهرة الجديدة</option>
                                    <option value='مدينة نصر'>مدينة نصر</option>
                                    <option value='المعادي'>المعادي</option>
                                    <option value='مصر الجديدة'>مصر الجديدة</option>
                                    <option value='الزمالك'>الزمالك</option>
                                    <option value='الدقي'>الدقي</option>
                                    <option value='المهندسين'>المهندسين</option>
                                    <option value='الهرم'>الهرم</option>
                                    <option value='6 أكتوبر'>6 أكتوبر</option>
                                    <option value='الشيخ زايد'>الشيخ زايد</option>
                                    <option value='العبور'>العبور</option>
                                    <option value='بدر'>بدر</option>
                                    <option value='العاصمة الإدارية'>العاصمة الإدارية</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='apartment'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>شقة</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='أدخل رقم الشقة'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='building'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>المبني</FormLabel>
                                <FormControl>
                                  <Input placeholder='أدخل اسم المبني' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='floor'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>طابق</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='أدخل الطابق'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name='landmark'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>علامة</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='أدخل علامة مميزة'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className='  p-4'>
                        <Button
                          type='submit'
                          className='rounded-full font-bold'
                        >
                          توصيل الي هذا العنوان
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>
          {/* payment method */}
          <div className='border-y'>
            {isPaymentMethodSelected && paymentMethod ? (
              <div className='grid  grid-cols-1 md:grid-cols-12  my-3 pb-3'>
                <div className='flex text-lg font-bold  col-span-5'>
                  <span className='w-8'>2 </span>
                  <span>طريقة الدفع</span>
                </div>
                <div className='col-span-5 '>
                  <p>{paymentMethod}</p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsPaymentMethodSelected(false)
                    }}
                  >
                    تغيير
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              <>
                <div className='flex text-primary text-lg font-bold my-2'>
                  <span className='w-8'>2 </span>
                  <span>اختر طريقة الدفع</span>
                </div>
                <Card className='md:mr-8 my-4'>
                  <CardContent className='p-4'>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      {availablePaymentMethods.map((pm) => (
                        <div key={pm.name} className='flex items-center py-1 '>
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className='font-bold pr-2 cursor-pointer text-right w-full'
                            htmlFor={`payment-${pm.name}`}
                          >
                            {pm.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className='p-4'>
                    <Button
                      onClick={handleSelectPaymentMethod}
                      className='rounded-full font-bold'
                    >
                      استخدم طريقة الدفع هذه
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className='flex text-muted-foreground text-lg font-bold my-4 py-3'>
                <span className='w-8'>2 </span>
                <span>اختر طريقة الدفع</span>
              </div>
            )}
          </div>


              
            
          {isPaymentMethodSelected && isAddressSelected && (
            <div className='mt-6'>
              <div className='block md:hidden'>
                <CheckoutSummary />
              </div>

              <Card className='hidden md:block '>
                <CardContent className='p-4 flex flex-col md:flex-row justify-between items-center gap-3'>
                  <Button onClick={handlePlaceOrder} className='rounded-full'>
                    تأكيد الطلب
                  </Button>
                  <div className='flex-1'>
                    <p className='font-bold text-lg'>
                      المجموع الكلي: <ProductPrice price={totalPrice} plain />
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
