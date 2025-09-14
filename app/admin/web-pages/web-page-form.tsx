'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

import MdEditor from 'react-markdown-editor-lite'
import ReactMarkdown from 'react-markdown'
import 'react-markdown-editor-lite/lib/index.css'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createWebPage, updateWebPage } from '@/lib/actions/web-page.actions'
import { IWebPageInput } from '@/types'
import { WebPageInputSchema, WebPageUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'

const webPageDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        title: 'صفحة تجريبية',
        slug: 'sample-page',
        content: 'محتوى تجريبي',
      }
    : {
        title: '',
        slug: '',
        content: '',
      }

const WebPageForm = ({
  type,
  webPage,
  webPageId,
}: {
  type: 'Create' | 'Update'
  webPage?: IWebPageInput & { id: string }
  webPageId?: string
}) => {
  const router = useRouter()

  const form = useForm<z.infer<typeof WebPageInputSchema>>({
    resolver:
      type === 'Update'
        ? zodResolver(WebPageUpdateSchema)
        : zodResolver(WebPageInputSchema),
    defaultValues:
      webPage && type === 'Update' ? webPage : webPageDefaultValues,
  })

  const { toast } = useToast()

  async function onSubmit(values: z.infer<typeof WebPageInputSchema>) {
    if (type === 'Create') {
      const res = await createWebPage(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/admin/web-pages`)
      }
    }
    if (type === 'Update') {
      if (!webPageId) {
        router.push(`/admin/web-pages`)
        return
      }
      const res = await updateWebPage({ ...values, _id: webPageId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/admin/web-pages`)
      }
    }
  }

  return (
    <Form {...form}>
      <div className='space-y-8 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-right'>العنوان</FormLabel>
                <FormControl>
                  <Input 
                    placeholder='أدخل العنوان' 
                    className='text-right' 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      // Generate slug for both Create and Update modes
                      const generatedSlug = toSlug(e.target.value)
                      form.setValue('slug', generatedSlug)
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-right'>الرابط</FormLabel>

                <FormControl>
                  <Input
                    placeholder='سيتم توليد الرابط تلقائياً من العنوان'
                    className='text-right bg-gray-50'
                    readOnly
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
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-right'>المحتوى</FormLabel>
                <FormControl>
                  <MdEditor
                    {...field}
                    style={{ height: '500px' }}
                    renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                    onChange={({ text }) => form.setValue('content', text)}
                    view={{ menu: true, md: true, html: false }}
                    canView={{ menu: true, md: true, html: false, fullScreen: true, hideMenu: false }}
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
              <FormItem className='space-x-2 items-center flex-row-reverse'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='text-right'>منشور؟</FormLabel>
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
            {form.formState.isSubmitting ? 'جاري الإرسال...' : `${type === 'Create' ? 'إنشاء' : 'تحديث'} الصفحة`}
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default WebPageForm
