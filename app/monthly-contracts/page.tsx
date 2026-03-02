'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { UploadButton } from '@/lib/uploadthing'
import { useToast } from '@/hooks/use-toast'
import { Loader2, X } from 'lucide-react'
import Image from 'next/image'

const SUPER_SAVE_TAG = 'super_tawfeer'

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
  const [isSuperSaveDialogOpen, setIsSuperSaveDialogOpen] = useState(false)
  const [isSuperSaveConfirmed, setIsSuperSaveConfirmed] = useState(false)
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
          prescriptionUrl,
          deliveryServiceTag: isSuperSaveConfirmed ? SUPER_SAVE_TAG : null,
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
          deliveryAddress: '',
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
          {/* Super Save banner */}
          <button
            type="button"
            onClick={() => setIsSuperSaveDialogOpen(true)}
            className="w-full mb-6 text-right"
          >
            <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-l from-blue-50 via-white to-white" />
              <div className="relative p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-600 hover:bg-pink-600 text-white">حصرياً</Badge>
                    <span className="text-lg sm:text-xl font-bold text-gray-900">توصيل سوبر توفير</span>
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    وفر حتى 15% وتوصيل مجاني خلال 3 أيام
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white border shadow flex items-center justify-center">
                    <div className="text-center leading-tight">
                      <div className="text-[11px] font-extrabold text-blue-700">BIG</div>
                      <div className="text-[11px] font-extrabold text-blue-700">SAVE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>

          <Dialog open={isSuperSaveDialogOpen} onOpenChange={setIsSuperSaveDialogOpen}>
            <DialogContent className="p-0 overflow-hidden max-w-md">
              <div className="relative">
                <div className="h-44 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow flex items-center justify-center border">
                    <span className="text-blue-700 font-extrabold leading-tight text-center text-sm">
                      BIG
                      <br />
                      SAVE
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-right">
                  <div className="text-xl font-bold text-gray-900">ما خدمة سوبر توفير</div>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc pr-5">
                    <li>وفر حتى 15% على طلبك</li>
                    <li>توصيل مجاني</li>
                    <li>توصيل خلال 3 أيام</li>
                    <li>الحد الأدنى للطلب: 700 جنيه مصري</li>
                    <li>اطلب أكثر من مرة بدون رسوم</li>
                  </ul>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setIsSuperSaveConfirmed(true)
                      setIsSuperSaveDialogOpen(false)
                    }}
                  >
                    مفهوم
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {!isSuperSaveConfirmed ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-right text-gray-900">
                  أكمل بعد قراءة تفاصيل خدمة سوبر توفير
                </CardTitle>
                <p className="text-right text-gray-600 mt-2">
                  اضغط على بانر <span className="font-semibold">توصيل سوبر توفير</span> ثم اختر <span className="font-semibold">مفهوم</span> لعرض النموذج.
                </p>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-2xl font-bold text-right text-blue-600">
                    نموذج طلب التعاقد الشهري
                  </CardTitle>
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-white">
                    سوبر توفير
                  </Badge>
                </div>
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
          )}
        </div>
      </div>
    </div>
  )
}
