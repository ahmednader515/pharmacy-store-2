import { Metadata } from 'next'
import Image from 'next/image'
import SignupForm from './signup-form'
import data from '@/lib/data'

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد',
}

export default function SignUpPage() {
  const { site } = data.settings[0];
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#f9fafb] signin-page-rtl" dir="rtl">
      <div className="w-full max-w-[1800px] mx-auto p-8">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          {/* Logo Section - Right Side */}
          <div className="flex flex-col items-center justify-center space-y-10 text-center logo-section">
            <div className="w-64 h-64 relative">
              <Image
                src="/icons/logo.svg"
                alt="شعار المتجر"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-8">
              <h1 className="text-6xl font-bold text-gray-900 font-cairo">انضم إلى {site.name}</h1>
              <p className="text-3xl text-gray-600 font-cairo">أنشئ حسابك واستمتع بالتسوق</p>
            </div>
          </div>

          {/* Form Section - Left Side */}
          <div className="flex justify-center form-section">
            <div className="w-full max-w-5xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-right font-cairo mb-3">إنشاء حساب جديد</h2>
                <p className="text-gray-600 text-right font-cairo text-lg">أدخل بياناتك لإنشاء حساب جديد</p>
              </div>
              <SignupForm />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="text-gray-600 mb-6 font-cairo text-lg">
            لديك حساب بالفعل؟
          </div>
          <a href="/sign-in" className="inline-block">
            <button className="w-full max-w-lg font-cairo text-lg h-12 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              تسجيل الدخول
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
