import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { canReview, fetchReviews, submitReview } from '../lib/reviews'
import type { Review } from '../lib/reviews'
import { cn } from '../lib/cn'

interface ReviewsSectionProps {
  productId: string
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [canUserReview, setCanUserReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const load = () => {
    fetchReviews(productId).then(setReviews)
    if (user) canReview(productId).then(setCanUserReview)
  }

  useEffect(() => { load() }, [productId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg('')
    try {
      await submitReview(productId, rating, comment)
      setMsg('تم إرسال تقييمك')
      setMsgOk(true)
      setComment('')
      load()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'فشل الإرسال')
      setMsgOk(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-zinc-900 mb-6">التقييمات ({reviews.length})</h2>

      {canUserReview && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-4">
          <p className="text-sm font-medium text-zinc-700">قيّم هذا المنتج</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`${n} نجوم`}
              >
                <Star
                  className={cn('w-7 h-7', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200')}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="تعليقك (اختياري)..."
            rows={2}
            className="input-field resize-none text-sm"
          />
          {msg && <p className={`text-sm ${msgOk ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
          <Button type="submit" variant="primary" size="sm" loading={submitting}>
            إرسال التقييم
          </Button>
        </form>
      )}

      {!user && (
        <p className="text-sm text-zinc-500 mb-6">
          <Link to="/login" className="text-orbit-purple font-medium hover:underline">سجّل دخولك</Link> لإضافة تقييم
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-zinc-400 text-sm text-center py-6">لا توجد تقييمات بعد — كن أول من يقيّم</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-zinc-100 pb-5 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-zinc-900">{r.profiles?.name ?? 'مستخدم'}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-zinc-600 leading-relaxed">{r.comment}</p>}
              <p className="text-xs text-zinc-400 mt-2">{new Date(r.created_at).toLocaleDateString('ar-SA')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
