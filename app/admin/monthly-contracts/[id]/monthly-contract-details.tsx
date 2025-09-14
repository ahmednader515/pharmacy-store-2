'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type MonthlyContract = {
  id: string
  name: string
  phone: string
  email: string
  branch: string
  medicineNames: string
  prescriptionUrl: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

interface MonthlyContractDetailsProps {
  contract: MonthlyContract
}

export default function MonthlyContractDetails({ contract }: MonthlyContractDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/monthly-contracts/${contract.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'تم تحديث الحالة بنجاح',
          description: `تم تغيير حالة التعاقد إلى ${getStatusText(newStatus)}`,
        })
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        throw new Error('فشل في تحديث الحالة')
      }
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة التعاقد',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'موافق عليه'
      case 'rejected':
        return 'مرفوض'
      default:
        return 'قيد المراجعة'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            موافق عليه
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوض
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            قيد المراجعة
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للطلبات
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">تفاصيل التعاقد الشهري</h1>
          </div>
          {getStatusBadge(contract.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">معلومات التعاقد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">الاسم</label>
                  <p className="text-lg font-semibold text-gray-900">{contract.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">رقم الهاتف</label>
                  <p className="text-lg text-gray-900">{contract.phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                  <p className="text-lg text-gray-900">{contract.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">الفرع المفضل</label>
                  <p className="text-lg text-gray-900">{contract.branch}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">تاريخ الطلب</label>
                  <p className="text-lg text-gray-900">{formatDateTime(contract.createdAt).dateTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicine Names */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">أسماء الأدوية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {contract.medicineNames}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription Image */}
        {contract.prescriptionUrl && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">الروشتة المرفوعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Image
                    src={contract.prescriptionUrl}
                    alt="الروشتة المرفوعة"
                    width={400}
                    height={400}
                    className="max-w-full h-auto rounded-lg border shadow-lg"
                  />
                </div>
                <Button asChild variant="outline">
                  <a 
                    href={contract.prescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    تحميل الروشتة
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">إجراءات الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {contract.status !== 'approved' && (
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  موافقة على التعاقد
                </Button>
              )}
              
              {contract.status !== 'rejected' && (
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  رفض التعاقد
                </Button>
              )}
              
              {contract.status !== 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={isUpdating}
                  variant="outline"
                >
                  <Clock className="w-4 h-4 ml-2" />
                  إعادة للمراجعة
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
