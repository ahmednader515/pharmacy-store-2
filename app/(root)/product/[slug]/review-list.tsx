'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Rating from '@/components/shared/product/rating'
import { Separator } from '@/components/ui/separator'
import { Star, User, Lock, Edit, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  user: {
    name: string
    id: string
  }
  rating: number
  comment: string
  title?: string
  createdAt: string
}

interface ReviewListProps {
  productId: string
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    title: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    rating: 0,
    comment: '',
    title: '',
  })

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews()
  }, [productId, currentPage])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/reviews?productId=${productId}&page=${currentPage}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
        setTotalPages(data.totalPages || 1)
      } else {
        console.error('Failed to fetch reviews:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: 'خطأ في تحميل التقييمات',
        description: 'فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }))
  }

  const handleEditRatingChange = (rating: number) => {
    setEditForm(prev => ({ ...prev, rating }))
  }

  const handleSubmitReview = async () => {
    if (!session) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول لكتابة تقييم',
        variant: 'destructive',
      })
      router.push('/sign-in')
      return
    }

    if (newReview.rating === 0) {
      toast({
        title: 'التقييم مطلوب',
        description: 'يرجى اختيار تقييم قبل الإرسال',
        variant: 'destructive',
      })
      return
    }

    if (!newReview.comment.trim()) {
      toast({
        title: 'التعليق مطلوب',
        description: 'يرجى كتابة تعليق قبل الإرسال',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          rating: newReview.rating, 
          comment: newReview.comment,
          title: newReview.title 
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'تم إرسال التقييم',
          description: result.message || 'شكراً لك على تقييمك!',
          variant: 'default',
        })

        // Reset form and refresh reviews
        setNewReview({ rating: 0, comment: '', title: '' })
        setCurrentPage(1)
        await fetchReviews()
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في إرسال التقييم. يرجى المحاولة مرة أخرى.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال التقييم. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id)
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      title: review.title || '',
    })
  }

  const handleUpdateReview = async () => {
    if (!editingReview) return

    if (editForm.rating === 0 || !editForm.comment.trim()) {
      toast({
        title: 'بيانات غير مكتملة',
        description: 'يرجى إكمال جميع الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          rating: editForm.rating, 
          comment: editForm.comment,
          title: editForm.title 
        }),
      })

      if (response.ok) {
        toast({
          title: 'تم تحديث التقييم',
          description: 'تم تحديث تقييمك بنجاح',
          variant: 'default',
        })
        setEditingReview(null)
        await fetchReviews()
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في تحديث التقييم',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث التقييم',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'تم حذف التقييم',
          description: 'تم حذف تقييمك بنجاح',
          variant: 'default',
        })
        await fetchReviews()
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في حذف التقييم',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التقييم',
        variant: 'destructive',
      })
    }
  }

  const handleSignInClick = () => {
    router.push('/sign-in')
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setEditForm({ rating: 0, comment: '', title: '' })
  }

  if (isLoading) {
    return (
      <div className='space-y-6' dir="rtl">
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>جاري تحميل التقييمات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6' dir="rtl">
      {/* Write Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>اكتب تقييماً</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {!session ? (
            <div className='text-center py-6'>
              <Lock className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-muted-foreground mb-4'>
                يجب تسجيل الدخول لكتابة تقييم
              </p>
              <Button onClick={handleSignInClick} className='w-full'>
                تسجيل الدخول
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className='text-sm font-medium mb-2 block'>التقييم</label>
                <div className='flex gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => handleRatingChange(star)}
                      className='p-1'
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor='title' className='text-sm font-medium mb-2 block'>
                  العنوان (اختياري)
                </label>
                <input
                  id='title'
                  type='text'
                  placeholder='عنوان التقييم...'
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                />
              </div>

              <div>
                <label htmlFor='comment' className='text-sm font-medium mb-2 block'>
                  التعليق
                </label>
                <Textarea
                  id='comment'
                  placeholder='شارك أفكارك حول هذا المنتج...'
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmitReview} 
                disabled={isSubmitting}
                className='w-full'
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Reviews List */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>
          تقييمات العملاء ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <User className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className='p-4'>
                  {editingReview === review.id ? (
                    // Edit Form
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>تعديل التقييم</span>
                        <div className='flex gap-2'>
                          <Button size='sm' onClick={handleUpdateReview}>
                            حفظ
                          </Button>
                          <Button size='sm' variant='outline' onClick={cancelEdit}>
                            إلغاء
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className='text-sm font-medium mb-2 block'>التقييم</label>
                        <div className='flex gap-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type='button'
                              onClick={() => handleEditRatingChange(star)}
                              className='p-1'
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= editForm.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className='text-sm font-medium mb-2 block'>العنوان</label>
                        <input
                          type='text'
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='text-sm font-medium mb-2 block'>التعليق</label>
                        <Textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Review
                    <>
                      <div className='mb-3'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                              <User className='h-4 w-4 text-primary' />
                            </div>
                            <span className='font-medium'>
                              {review.user.name}
                            </span>
                          </div>
                          
                          {/* Edit/Delete buttons for user's own review */}
                          {session?.user?.id === review.user.id && (
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleEditReview(review)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleDeleteReview(review.id)}
                                className='text-red-600 hover:text-red-700'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Rating rating={review.rating} />
                      </div>
                      
                      {review.title && (
                        <h4 className='font-medium mb-2 text-sm'>{review.title}</h4>
                      )}
                      <p className='text-muted-foreground mb-2'>{review.comment}</p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center gap-2 mt-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <span className='px-3 py-2 text-sm'>
              صفحة {currentPage} من {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
