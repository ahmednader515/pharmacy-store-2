import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CredentialsSignInForm from "./credentials-signin-form";
import { Button } from "@/components/ui/button";
import data from '@/lib/data'

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { site } = data.settings[0];

  const { callbackUrl = "/" } = searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl);
  }

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
              <h1 className="text-6xl font-bold text-gray-900 font-cairo">مرحباً بك في {site.name}</h1>
              <p className="text-3xl text-gray-600 font-cairo">تسوق بسهولة وأمان</p>
            </div>
          </div>

                    {/* Form Section - Left Side */}
          <div className="flex justify-center form-section">
            <Card className="w-full max-w-8xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl text-right font-cairo mb-3">تسجيل الدخول</CardTitle>
                <p className="text-gray-600 text-right font-cairo text-lg">أدخل بياناتك للوصول إلى حسابك</p>
              </CardHeader>
              <CardContent className="px-20 pb-12">
                <CredentialsSignInForm />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="text-gray-600 mb-6 font-cairo text-lg">
            جديد في {site.name}؟
          </div>
          <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button className="w-full max-w-lg font-cairo text-lg h-12" variant="outline">
              إنشاء حساب جديد
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
