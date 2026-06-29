import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import {
  confirmOrder,
  fetchAdminOrder,
  getReceiptImageUrl,
  rejectOrder,
} from '../../lib/admin'
import type { AdminOrder } from '../../lib/admin'
import { getDownloadUrl } from '../../lib/storage'

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptOpenUrl, setReceiptOpenUrl] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let blobUrl: string | null = null

    ;(async () => {
      const data = await fetchAdminOrder(id)
      setOrder(data)

      if (data?.receipt_storage_key) {
        try {
          const displayUrl = await getReceiptImageUrl(data.receipt_storage_key)
          if (displayUrl.startsWith('blob:')) blobUrl = displayUrl
          setReceiptUrl(displayUrl)
          setReceiptError('')
          try {
            setReceiptOpenUrl(await getDownloadUrl(data.receipt_storage_key))
          } catch {
            setReceiptOpenUrl(displayUrl)
          }
        } catch (err) {
          setReceiptUrl(null)
          setReceiptOpenUrl(null)
          setReceiptError(err instanceof Error ? err.message : 'تعذّر تحميل صورة الإيصال')
        }
      }

      setLoading(false)
    })()

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [id])

  const handleConfirm = async () => {
    if (!confirm('تأكيد الطلب وإتاحة التحميل للعميل؟')) return
    setSubmitting(true)
    setError('')
    try {
      await confirmOrder(id)
      navigate('/admin/orders?status=PAID')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التأكيد')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('أدخل سبب الرفض')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await rejectOrder(id, rejectReason)
      navigate('/admin/orders?status=REJECTED')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الرفض')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>
  if (!order) {
    return (
      <AdminLayout>
        <p className="text-center text-gray-500 py-16">الطلب غير موجود</p>
      </AdminLayout>
    )
  }

  const canReview = order.status === 'AWAITING_REVIEW'

  return (
    <AdminLayout>
      <Link to="/admin/orders" className="text-sm text-gray-400 hover:text-orbit-purple mb-4 inline-block">
        ← الطلبات
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orbit-purple">#{order.order_number}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* بيانات العميل */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">بيانات العميل</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">الاسم</dt>
              <dd className="font-medium">{order.profiles?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">البريد</dt>
              <dd className="font-medium" dir="ltr">{order.profiles?.email}</dd>
            </div>
            {order.profiles?.phone && (
              <div className="flex justify-between">
                <dt className="text-gray-500">الجوال</dt>
                <dd className="font-medium" dir="ltr">{order.profiles.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* ملخص المبلغ */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">ملخص الطلب</h2>
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.products?.title_ar ?? 'منتج'}</span>
              <span>{item.price} ر.س</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-orbit-purple">{order.total_amount} ر.س</span>
          </div>
        </div>
      </div>

      {/* الإيصال */}
      {order.receipt_storage_key && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="font-bold mb-4">إيصال التحويل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receiptUrl ? (
              <a href={receiptOpenUrl ?? receiptUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={receiptUrl}
                  alt="إيصال التحويل"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200 bg-gray-50 hover:opacity-90 transition-opacity"
                  onError={() => {
                    setReceiptError('تعذّر عرض الصورة — تأكد من رفع view.php على السيرفر')
                    setReceiptUrl(null)
                  }}
                />
              </a>
            ) : (
              <div className="bg-gray-100 rounded-lg min-h-48 flex flex-col items-center justify-center text-gray-500 text-sm p-4 text-center gap-2">
                <p>{receiptError || 'تعذّر تحميل صورة الإيصال'}</p>
                {receiptError && (
                  <p className="text-xs text-gray-400">ارفع ملف hostinger/api/view.php إلى السيرفر</p>
                )}
              </div>
            )}
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">المبلغ المحوّل</dt>
                <dd className="font-bold text-orbit-purple">{order.transfer_amount} ر.س</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">تاريخ التحويل</dt>
                <dd>{order.transfer_date}</dd>
              </div>
              {order.transfer_note && (
                <div>
                  <dt className="text-gray-500 mb-1">ملاحظة</dt>
                  <dd className="bg-stellar-gray p-3 rounded-lg">{order.transfer_note}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">تاريخ الرفع</dt>
                <dd>
                  {order.receipt_uploaded_at
                    ? new Date(order.receipt_uploaded_at).toLocaleString('ar-SA')
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* إجراءات */}
      {canReview && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="font-bold mb-4">إجراءات المراجعة</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {!showReject ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 bg-growth-green text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'جاري...' : '✓ تأكيد الدفع'}
              </button>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={submitting}
                className="flex-1 border border-red-400 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                ✗ رفض الطلب
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="سبب الرفض (يُرسل للعميل)..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  تأكيد الرفض
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReject(false); setRejectReason('') }}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
