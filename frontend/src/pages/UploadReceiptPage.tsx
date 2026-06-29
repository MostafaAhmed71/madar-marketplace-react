import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">رفع إيصال التحويل</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-zinc-500 text-sm">طلب #{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-sm font-semibold text-zinc-900">بيانات الإيصال</h2>
          <p className="text-xs text-zinc-500 mt-1">ارفع صورة واضحة لإيصال التحويل البنكي</p>
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">المبلغ المحوّل (ر.س)</label>
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">تاريخ التحويل</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">ملاحظة (اختياري)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-field resize-none" placeholder="أي ملاحظات إضافية..." />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} disabled={!file}>
            إرسال الإيصال للمراجعة
          </Button>
        </div>
      </form>

      <p className="text-center text-xs text-zinc-400 mt-4">سيتم مراجعة إيصالك خلال 24 ساعة</p>
    </div>
  )
}
