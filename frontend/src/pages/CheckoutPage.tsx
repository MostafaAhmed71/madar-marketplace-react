import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Tag, ShieldCheck, Info } from 'lucide-react'
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
    <div className="animate-fade-in-up space-y-6">
      {/* ======= شريط الخطوات ======= */}
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 pb-4">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#39396d] text-white flex items-center justify-center font-bold text-sm">1</div>
          <span className="text-xs font-semibold text-[#39396d]">ملخص الطلب</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#39396d] mx-4" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#39396d] text-white flex items-center justify-center font-bold text-sm ring-4 ring-[#39396d]/10">2</div>
          <span className="text-xs font-bold text-[#39396d]">الدفع والتحويل</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#edeef0] mx-4" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-[#edeef0] text-[#777680] flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs font-semibold text-[#777680]">تأكيد الطلب</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* تفاصيل الطلب */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
          <div className="bg-white rounded-3xl border border-[#c8c5d0]/30 p-6 shadow-sm">
            <h2 className="font-bold text-base text-[#39396d] mb-4 pb-3 border-b border-[#edeef0]" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>ملخص الطلب</h2>
            <div className="divide-y divide-[#edeef0] max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={cartItemKey(item)} className="flex justify-between py-3">
                  <span className="text-xs text-[#47464f] line-clamp-1 flex-1 ml-4">{item.titleAr}</span>
                  <span className="text-xs font-bold text-[#191c1e] shrink-0">{item.price} ر.س</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#edeef0] space-y-2 text-xs">
              <div className="flex justify-between text-[#777680]">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#22C55E] font-semibold">
                  <span>الخصم</span>
                  <span>- {discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-3 border-t border-[#edeef0] text-[#39396d]">
                <span>الإجمالي</span>
                <span>{finalTotal.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* تنبيه ملاحظة الطلب */}
          <div className="bg-[#ffdea6]/20 border border-[#f9b500]/10 rounded-2xl p-4 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#7b5800] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#684a00] leading-relaxed">
              يرجى التأكد من كتابة <strong>رقم الطلب</strong> في ملاحظات التحويل البنكي لسرعة التأكيد وتفادي التأخير.
            </p>
          </div>

          {/* كود الخصم */}
          <div className="bg-white rounded-3xl border border-[#c8c5d0]/30 p-6 shadow-sm">
            <h2 className="font-bold text-sm text-[#39396d] mb-3 flex items-center gap-2" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
              <Tag className="w-4 h-4 text-[#777680]" />
              كود خصم إضافي
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل الكود"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input-field flex-1 h-10 text-xs rounded-xl"
                dir="ltr"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-[#e2dfff] text-[#39396d] border border-[#39396d]/10 px-4 rounded-xl text-xs font-bold hover:bg-[#39396d] hover:text-white transition-all"
              >
                تطبيق
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-2 font-bold ${couponValid ? 'text-[#22C55E]' : 'text-red-500'}`}>
                {couponMsg}
              </p>
            )}
          </div>
        </div>

        {/* بيانات الحساب البنكي وزر التحويل */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
          {bank ? (
            <BankDetailsCard bank={bank} amount={finalTotal} />
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-900">
              <p className="font-bold">بيانات الحساب البنكي غير متوفرة حالياً</p>
              <p className="text-xs mt-1 text-red-800">يرجى الاتصال بالدعم الفني لإتمام الدفع</p>
            </div>
          )}

          <div className="space-y-4">
            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            <Button
              variant="accent"
              size="lg"
              fullWidth
              className="bg-[#f9b500] text-[#684a00] hover:bg-[#f9b500]/90 rounded-2xl font-bold h-14 shadow-lg shadow-[#f9b500]/10 flex items-center justify-center gap-2"
              onClick={handleCreateOrder}
              disabled={!bank}
              loading={submitting}
              icon={<ArrowRight className="w-5 h-5 rotate-180" />}
            >
              تم التحويل، رفع الإيصال
            </Button>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#777680]">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>دفع آمن ومشفّر 100%</span>
              </div>
              <Link to="/cart" className="text-xs font-bold text-[#777680] hover:text-[#39396d] transition-colors underline">
                العودة لتعديل السلة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
