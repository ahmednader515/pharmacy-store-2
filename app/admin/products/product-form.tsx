'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct, getAllCategories } from '@/lib/actions/product.actions'
import { IProductInput } from '@/types'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: 0,
  listPrice: 0,
  countInStock: 0,
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  isPublished: false,
  tags: [],
  sizes: [],
  colors: [],
  ratingDistribution: [],
  reviews: [],
}

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProductInput & { id: string }
  productId?: string
}) => {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [newCategoryInput, setNewCategoryInput] = useState('')

  const form = useForm<IProductInput>({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
    mode: 'onChange',
    shouldFocusError: false,
    shouldUnregister: false,
  })

  // Fetch categories when component mounts
  useEffect(() => {
    console.log('ProductForm mounted with:', { type, product, productId })
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const categoriesData = await getAllCategories()
        setCategories(categoriesData)
        
        // If this is an update and the product has a category not in the list, add it
        if (type === 'Update' && product?.category && !categoriesData.includes(product.category)) {
          setCategories(prev => [...prev, product.category])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [type, product, productId])

  // Reset new category input when form changes
  useEffect(() => {
    const category = form.watch('category')
    if (category !== '__new__') {
      setNewCategoryInput('')
    }
  }, [form])

  const { toast } = useToast()
  async function onSubmit(values: IProductInput) {
    // Validate that category is not a placeholder value
    if (values.category === '__new__' || values.category === '__loading__' || values.category === '__no_categories__') {
      toast({
        variant: 'destructive',
        description: 'يرجى اختيار فئة صحيحة أو إدخال فئة جديدة',
      })
      return
    }

    // Validate that at least one image is provided
    if (values.images.length === 0) {
      toast({
        variant: 'destructive',
        description: 'يرجى رفع صورة واحدة على الأقل للمنتج',
      })
      return
    }

    // Auto-generate slug from product name
    const productData = {
      ...values,
      slug: toSlug(values.name)
    }

    if (type === 'Create') {
      const res = await createProduct(productData)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      try {
        const res = await updateProduct({ ...productData, _id: productId })
        
        if (!res.success) {
          toast({
            variant: 'destructive',
            description: res.message,
          })
        } else {
          toast({
            description: res.message,
          })
          router.push(`/admin/products`)
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          description: 'حدث خطأ غير متوقع أثناء التحديث',
        })
      }
    }
  }
  const images = form.watch('images')

  return (
    <div className='rtl' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>اسم المنتج</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الفئة</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                      <SelectTrigger className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'>
                        <SelectValue placeholder={isLoadingCategories ? "جاري التحميل..." : "اختر فئة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="__loading__" disabled>جاري التحميل...</SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="__no_categories__" disabled>لا توجد فئات متاحة</SelectItem>
                        ) : (
                          <>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="__new__">+ إضافة فئة جديدة</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {field.value === '__new__' && (
                    <Input
                      value={newCategoryInput}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        setNewCategoryInput(newCategory)
                        if (newCategory.trim()) {
                          field.onChange(newCategory.trim())
                        }
                      }}
                      onBlur={(e) => {
                        // If user leaves the input empty, reset to empty string
                        if (!e.target.value.trim()) {
                          field.onChange('')
                          setNewCategoryInput('')
                        }
                      }}
                      className="mt-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>العلامة التجارية</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='listPrice'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>السعر الأصلي</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>السعر الصافي</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='countInStock'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الكمية المتوفرة</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      className='border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='images'
              render={() => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الصور</FormLabel>
                  <Card>
                    <CardContent className='space-y-2 mt-2 min-h-48'>
                      {images.length === 0 ? (
                        <div className='flex items-center justify-center h-32 text-gray-500'>
                          لم يتم رفع أي صور بعد
                        </div>
                      ) : (
                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                          {images.map((image: string, index: number) => (
                            <div
                              key={image}
                              className='relative group cursor-move transition-all duration-200 hover:scale-105'
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString())
                                e.currentTarget.classList.add('opacity-50')
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-50')
                              }}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.add('ring-2', 'ring-blue-500')
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('ring-2', 'ring-blue-500')
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.remove('ring-2', 'ring-blue-500')
                                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                const newImages = [...images]
                                const [draggedImage] = newImages.splice(draggedIndex, 1)
                                newImages.splice(index, 0, draggedImage)
                                form.setValue('images', newImages)
                              }}
                            >
                              <Image
                                src={image}
                                alt={`صورة المنتج ${index + 1}`}
                                className='w-full h-24 object-cover object-center rounded-sm border'
                                width={100}
                                height={100}
                              />
                              <button
                                type='button'
                                onClick={() => {
                                  const newImages = images.filter((_, i) => i !== index)
                                  form.setValue('images', newImages)
                                }}
                                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100'
                              >
                                ×
                              </button>
                              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1'>
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='flex flex-col items-center pt-4 space-y-2'>
                        <p className='text-sm text-gray-600 text-center'>
                          {images.length === 0 
                            ? 'ارفع أول صورة للمنتج' 
                            : 'اسحب وأفلت لإعادة ترتيب الصور • انقر على × للحذف'
                          }
                        </p>
                        <FormControl>
                          <UploadButton
                            endpoint='imageUploader'
                            onClientUploadComplete={(res: { url: string }[]) => {
                              form.setValue('images', [...images, res[0].url])
                            }}
                            onUploadError={(error: Error) => {
                              toast({
                                variant: 'destructive',
                                description: `خطأ! ${error.message}`,
                              })
                            }}
                          />
                        </FormControl>
                      </div>
                    </CardContent>
                  </Card>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
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
              control={form.control}
              name='isPublished'
              render={({ field }) => (
                <FormItem className='space-x-2 items-center'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='text-gray-900 font-semibold'>منشور؟</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div>
                  <Button
          type='button'
          size='lg'
          disabled={form.formState.isSubmitting}
          onClick={() => {
            const values = form.getValues()
            onSubmit(values)
          }}
          className='button col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white'
        >
          {form.formState.isSubmitting ? 'جاري الإرسال...' : `${type === 'Create' ? 'إنشاء' : 'تحديث'} المنتج`}
        </Button>
        {form.formState.isSubmitting && (
          <p className='text-sm text-gray-600 text-center'>
            {type === 'Update' ? 'جاري تحديث المنتج...' : 'جاري إنشاء المنتج...'}
          </p>
        )}
        </div>
        </form>
      </Form>
    </div>
  )
}

export default ProductForm
