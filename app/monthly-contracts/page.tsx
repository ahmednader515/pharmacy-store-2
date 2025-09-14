'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadButton } from '@/lib/uploadthing'
import { useToast } from '@/hooks/use-toast'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'

export default function MonthlyContractsPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryAddress: '',
    branch: '',
    medicineNames: ''
  })
  const [prescriptionUrl, setPrescriptionUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/monthly-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prescriptionUrl
        }),
      })

      if (response.ok) {
        toast({
          title: 'تم إرسال طلبك بنجاح',
          description: 'سيتم التواصل معك قريباً لتأكيد التعاقد الشهري',
        })
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          branch: '',
          medicineNames: ''
        })
        setPrescriptionUrl('')
      } else {
        throw new Error('فشل في إرسال الطلب')
      }
    } catch (error) {
      toast({
        title: 'خطأ في الإرسال',
        description: 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Title Section with Background Image */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/icons/contracts-image.png)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">التعاقدات الشهرية</h1>
            <p className="text-xl">احصل على أدويتك الشهرية من فروعنا ووفرها كاملة مع توفير النواقص</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-right text-blue-600">
                نموذج طلب التعاقد الشهري
              </CardTitle>
              <p className="text-right text-gray-600 mt-2">
                يرجى ملء البيانات التالية لإتمام طلب التعاقد الشهري
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 text-right">
                {/* الاسم */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right">الاسم *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اسمك الكامل"
                    className="text-right"
                  />
                </div>

                {/* رقم الموبايل */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right">رقم الموبايل *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل رقم الموبايل"
                    className="text-right"
                  />
                </div>

                {/* عنوان التوصيل */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress" className="text-right">عنوان التوصيل *</Label>
                  <Textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل عنوان التوصيل الكامل"
                    rows={3}
                    className="text-right"
                  />
                </div>

                {/* فرع التعامل */}
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-right">فرع التعامل *</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل فرع التعامل المفضل"
                    className="text-right"
                  />
                </div>

                {/* أسماء الدواء */}
                <div className="space-y-2">
                  <Label htmlFor="medicineNames" className="text-right">أسماء الدواء *</Label>
                  <Textarea
                    id="medicineNames"
                    name="medicineNames"
                    value={formData.medicineNames}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل أسماء الأدوية المطلوبة (كل دواء في سطر منفصل)"
                    rows={4}
                    className="text-right"
                  />
                </div>

                {/* ارفق روشتة */}
                <div className="space-y-2">
                  <Label className="text-right">ارفق روشتة</Label>
                  <Card>
                    <CardContent className="space-y-4 mt-2 min-h-32">
                      {!prescriptionUrl ? (
                        <div className="flex items-center justify-center h-24 text-gray-500">
                          لم يتم رفع أي ملف بعد
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="relative group">
                            <Image
                              src={prescriptionUrl}
                              alt="الروشتة المرفوعة"
                              className="w-32 h-32 object-cover object-center rounded-sm border"
                              width={128}
                              height={128}
                            />
                            <button
                              type="button"
                              onClick={() => setPrescriptionUrl('')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm text-gray-600 text-center">
                          {!prescriptionUrl 
                            ? 'ارفع صورة الروشتة أو ملف PDF' 
                            : 'انقر على × لحذف الملف المرفوع'
                          }
                        </p>
                        <UploadButton
                          endpoint="prescriptionUploader"
                          onClientUploadComplete={(res) => {
                            console.log('Upload complete:', res)
                            if (res && res[0]) {
                              setPrescriptionUrl(res[0].url)
                              toast({
                                title: 'تم رفع الروشتة بنجاح',
                                description: 'تم رفع الروشتة بنجاح',
                              })
                            }
                          }}
                          onUploadError={(error: Error) => {
                            console.error('Upload error:', error)
                            toast({
                              title: 'خطأ في رفع الروشتة',
                              description: error.message,
                              variant: 'destructive'
                            })
                          }}
                          onUploadBegin={(name) => {
                            console.log('Upload begin:', name)
                            toast({
                              title: 'جاري رفع الملف...',
                              description: 'يرجى الانتظار',
                            })
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الطلب'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
