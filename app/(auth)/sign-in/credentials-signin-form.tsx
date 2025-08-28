'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import data from '@/lib/data'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignIn } from '@/types'
import { signInWithCredentials } from '@/lib/actions/user.actions'

import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { useState, useEffect } from 'react'
import PhoneInput from '@/components/shared/phone-input'

const signInDefaultValues = { phone: '', password: '' };

export default function CredentialsSignInForm() {
  // const { site } = data.settings[0];
  const site = { name: 'الليثي صيدلية' };
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session, status } = useSession()

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  // Auto-redirect when session becomes available
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('Session detected, redirecting to:', callbackUrl)
      // Use replace to avoid adding to browser history
      router.replace(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const { control, handleSubmit, formState: { errors } } = form

  const onSubmit = async (formData: IUserSignIn) => {
    if (isSubmitting) return // Prevent double submission
    
    setIsSubmitting(true)
    
    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false)
        toast({
          title: 'انتهت مهلة الطلب',
          description: 'استغرق تسجيل الدخول وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
          variant: 'destructive',
        })
      }
    }, 30000) // 30 seconds timeout
    
    try {
      console.log('Attempting sign in with phone:', formData.phone)
      
      const result = await signInWithCredentials({
        phone: formData.phone,
        password: formData.password,
      })
      
      clearTimeout(timeoutId) // Clear timeout on success
      console.log('Sign in result:', result)
      console.log('Result type:', typeof result)
      console.log('Result keys:', result ? Object.keys(result) : 'null/undefined')
      
      if (!result.success) {
        console.log('⚠️ Sign in reported failure:', result.message)
        console.log('Result details:', { type: typeof result, keys: result ? Object.keys(result) : 'none' })
        
        // Clear password field on failed attempt
        form.setValue('password', '')
        
        // Check if we might actually be signed in despite the error
        // This can happen when NextAuth returns unexpected responses
        try {
          const sessionResponse = await fetch('/api/auth/session')
          const sessionData = await sessionResponse.json()
          
          if (sessionData?.user) {
            console.log('✅ Session found despite error, sign in actually succeeded')
            toast({
              title: 'تم تسجيل الدخول بنجاح!',
              description: 'أهلاً وسهلاً بك! جاري توجيهك...',
              variant: 'default',
            })
            
            // Redirect to the callback URL
            router.replace(callbackUrl)
            return
          }
        } catch (sessionCheckError) {
          console.log('Could not check session, proceeding with error')
        }
        
        toast({
          title: 'فشل تسجيل الدخول',
          description: result.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
          variant: 'destructive',
        })
        return
      }
      
      // Successfully signed in
      toast({
        title: 'تم تسجيل الدخول بنجاح!',
        description: 'أهلاً وسهلاً بك! جاري توجيهك...',
        variant: 'default',
      })
      
      // Wait a moment for the session to propagate, then check if we can redirect
      console.log('Sign in successful, waiting for session to propagate...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to get the session to confirm it's ready
      try {
        const session = await fetch('/api/auth/session').then(res => res.json())
        if (session?.user) {
          console.log('Session confirmed, redirecting to:', callbackUrl)
          router.replace(callbackUrl)
        } else {
          console.log('Session not ready yet, useEffect will handle redirect')
        }
      } catch (error) {
        console.log('Could not verify session, useEffect will handle redirect')
      }
      
    } catch (error) {
      clearTimeout(timeoutId) // Clear timeout on error
      console.log('⚠️ Sign in error caught:', error)
      
      // Clear password field on error
      form.setValue('password', '')
      
      // Handle different types of errors
      let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'يرجى التحقق من إدخالك والمحاولة مرة أخرى.'
        } else if (error.message.includes('credentials')) {
          errorMessage = 'بيانات غير صحيحة. يرجى التحقق من رقم الهاتف وكلمة المرور.'
        }
      }
      
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while session is being checked
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-cairo">جاري التحقق من الجلسة...</p>
          <p className="text-sm text-gray-500 font-cairo mt-2">يرجى الانتظار...</p>
        </div>
      </div>
    )
  }

  // If already authenticated, show redirecting message
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-cairo">تم تسجيل الدخول بنجاح! جاري توجيهك...</p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="font-cairo">
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        
        {/* General form errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 text-center font-cairo">
              ⚠️ يرجى التحقق من الأخطاء أدناه وإعادة المحاولة
            </p>
          </div>
        )}
        
        <div className='space-y-6 md:space-y-8 lg:space-y-10'>
          <FormField
            control={control}
            name='phone'
            render={({ field, fieldState }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg lg:text-xl mb-2 md:mb-3 lg:mb-4">رقم الهاتف</FormLabel>
                <FormControl>
                  <PhoneInput 
                    placeholder='أدخل رقم الهاتف' 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    className={`text-right font-cairo h-12 md:h-14 text-base md:text-lg px-4 md:px-6 ${
                      fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </FormControl>
                <FormMessage />
                {fieldState.error && (
                  <p className="text-sm text-red-600 mt-1 text-right font-cairo">
                    {fieldState.error.message}
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-500 mt-1 text-right font-cairo">
                  مثال: +201234567890
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field, fieldState }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg lg:text-xl mb-2 md:mb-3 lg:mb-4">كلمة المرور</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أدخل كلمة المرور'
                    {...field}
                    className={`text-right font-cairo h-12 md:h-14 text-base md:text-lg px-4 md:px-6 ${
                      fieldState.error ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                </FormControl>
                <FormMessage />
                {fieldState.error && (
                  <p className="text-sm text-red-600 mt-1 text-right font-cairo">
                    {fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />

          <div className="pt-4 md:pt-6">
            <Button 
              type='submit' 
              disabled={isSubmitting} 
              className="w-full font-cairo h-12 md:h-14 text-base md:text-lg relative"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs md:text-sm text-blue-800 text-center font-cairo">
                  💡 <strong>بيانات تجريبية:</strong> يمكنك استخدام رقم الهاتف +201234567890 وكلمة المرور 123456
                </p>
              </div>
            )}
          </div>
          
          <div className='text-sm md:text-base lg:text-lg text-right text-gray-600 font-cairo leading-relaxed'>
            عند تسجيل الدخول، فإنك توافق على{' '}
            <Link href='/page/conditions-of-use' className="text-blue-600 hover:underline">شروط الاستخدام</Link> و{' '}
            <Link href='/page/privacy-policy' className="text-blue-600 hover:underline">سياسة الخصوصية</Link> الخاصة بـ {site.name}.
          </div>
        </div>
      </form>
    </Form>
  )
}
