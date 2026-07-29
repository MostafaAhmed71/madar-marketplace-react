import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Button } from '../components/ui/Button'
import { FileUploadZone } from '../components/ui/FileUploadZone'
import { fetchOrder, uploadReceipt } from '../lib/orders'
import type { Order } from '../types/database'

export function UploadReceiptPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchOrder(orderId).then((data) => {
      if (!data || data.status !== 'PENDING') {
        navigate(data ? `/checkout/success/${orderId}` : '/orders')
        return
      }
      setOrder(data)
      setAmount(String(data.total_amount))
      setLoading(false)
    })
  }, [orderId, navigate])

  const handleFileSelect = (f: File) => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleClearFile = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !order) return
    setSubmitting(true)
    setError('')
    try {
      await uploadReceipt(order.id, file, parseFloat(amount), date, note)
      navigate(`/checkout/success/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الإيصال')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return null

  return (
    <div className="max-w-xl mx-auto animate-fade-in-up space-y-6">
      {/* ======= شريط الخطوات ======= */}
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 pb-4">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#39396d] text-white flex items-center justify-center font-bold text-sm">1</div>
          <span className="text-xs font-semibold text-[#39396d]">ملخص الطلب</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#39396d] mx-4" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#39396d] text-white flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-xs font-semibold text-[#39396d]">الدفع والتحويل</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#39396d] mx-4" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#39396d] text-white flex items-center justify-center font-bold text-sm ring-4 ring-[#39396d]/10">3</div>
          <span className="text-xs font-bold text-[#39396d]">تأكيد الطلب</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#39396d]" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>رفع إيصال التحويل</h1>
          <p className="text-xs text-[#777680] mt-1">طلب #{order.order_number}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#c8c5d0]/30 overflow-hidden shadow-xl shadow-[#39396d]/5">
        <div className="px-6 py-4 border-b border-[#edeef0] bg-[#f8f9fb]">
          <h2 className="text-sm font-bold text-[#39396d]">بيانات إيصال التحويل</h2>
          <p className="text-xs text-[#777680] mt-0.5">يرجى إرفاق صورة واضحة لإيصال التحويل البنكي الصادر من تطبيق البنك الخاص بك.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <FileUploadZone
            variant="image"
            accept="image/jpeg,image/png,image/webp"
            label="صورة الإيصال"
            hint="JPG, PNG أو WebP — حد أقصى 5MB"
            previewUrl={preview}
            onFileSelect={handleFileSelect}
            onClear={file ? handleClearFile : undefined}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#47464f] mb-1.5">المبلغ المحوّل (ر.س)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-xs rounded-xl"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47464f] mb-1.5">تاريخ التحويل</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field text-xs rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#47464f] mb-1.5">ملاحظة (اختياري)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input-field resize-none rounded-xl text-xs py-2 h-auto"
              placeholder="مثال: تم التحويل من حساب الوالد/الاسم..."
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!file}
            className="bg-[#39396d] hover:bg-[#505086] text-white rounded-xl font-bold h-12"
          >
            إرسال إيصال الدفع للتدقيق والتفعيل
          </Button>
        </div>
      </form>

      <div className="bg-[#edeef0]/40 border border-[#c8c5d0]/30 rounded-2xl p-4 flex items-start gap-2.5">
        <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#47464f] leading-relaxed">
          <strong>ماذا يحدث بعد الإرسال؟</strong> سيقوم فريق التدقيق والمالية بمراجعة طلبك ومطابقة الحوالة، وسيتم تنشيط الروابط وتنزيل المنتجات مباشرة فور التأكيد (خلال أقل من 24 ساعة).
        </p>
      </div>
    </div>
  )
}
