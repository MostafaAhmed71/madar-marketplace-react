import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Tag } from 'lucide-react'
import { BankDetailsCard } from '../components/BankDetailsCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { createOrder, fetchActiveBankAccount, previewCoupon } from '../lib/orders'
import { cartItemKey } from '../lib/cart'
import type { BankAccount } from '../types/database'

export function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [bank, setBank] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponValid, setCouponValid] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [checkoutDone, setCheckoutDone] = useState(false)

  const finalTotal = total - discount

  useEffect(() => {
    if (checkoutDone) return
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    fetchActiveBankAccount().then((data) => {
      setBank(data)
      setLoading(false)
    })
  }, [items.length, navigate, checkoutDone])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    const result = await previewCoupon(couponCode, total)
    if (result.valid) {
      setDiscount(result.discount ?? 0)
      setAppliedCoupon(result.code ?? couponCode)
      setCouponMsg('تم تطبيق الكود بنجاح')
      setCouponValid(true)
    } else {
      setDiscount(0)
      setAppliedCoupon('')
      setCouponMsg(result.message ?? 'كود غير صالح')
      setCouponValid(false)
    }
  }

  const handleCreateOrder = async () => {
    setSubmitting(true)
    setError('')
    try {
      const order = await createOrder(items, appliedCoupon || undefined)
      setCheckoutDone(true)
      navigate(`/checkout/upload-receipt/${order.id}`)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إنشاء الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-8">إتمام الشراء</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="font-bold text-lg text-zinc-900 mb-4">ملخص الطلب</h2>
            {items.map((item) => (
              <div key={cartItemKey(item)} className="flex justify-between py-3 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-700 line-clamp-1 flex-1 ml-4">{item.titleAr}</span>
                <span className="text-sm font-semibold text-zinc-900 shrink-0">{item.price} ر.س</span>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم</span>
                  <span>- {discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-zinc-200 text-zinc-900">
                <span>الإجمالي</span>
                <span>{finalTotal.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-500" />
              كود خصم
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل الكود"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input-field flex-1"
                dir="ltr"
              />
              <Button variant="secondary" onClick={handleApplyCoupon}>
                تطبيق
              </Button>
            </div>
            {couponMsg && (
              <p className={`text-sm mt-2 ${couponValid ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponMsg}
              </p>
            )}
          </div>
        </div>

        <div>
          {bank ? (
            <BankDetailsCard bank={bank} amount={finalTotal} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
              <p className="font-semibold">بيانات الحساب البنكي غير متوفرة</p>
              <p className="text-sm mt-1 text-amber-800">تواصل مع الإدارة لإتمام الدفع</p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mt-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <Button
            variant="accent"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={handleCreateOrder}
            disabled={!bank}
            loading={submitting}
            icon={<ArrowRight className="w-5 h-5 rotate-180" />}
          >
            حوّلت المبلغ — رفع الإيصال
          </Button>

          <Link to="/cart" className="block text-center text-sm text-zinc-500 mt-4 hover:text-orbit-purple transition-colors">
            العودة للسلة
          </Link>
        </div>
      </div>
    </div>
  )
}
