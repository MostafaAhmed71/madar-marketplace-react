import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { cartItemKey } from '../lib/cart'
import { useCart } from '../context/CartContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function CartPage() {
  const { items, total, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in-up bg-white rounded-3xl border border-[#c8c5d0]/30 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#e2dfff] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-[#39396d]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-[#39396d] mb-2" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>سلة الشراء فارغة</h1>
        <p className="text-[#777680] mb-8">أضف موارد تعليمية من المتجر للبدء في رحلتك التعليمية</p>
        <Button to="/marketplace" variant="primary" size="lg" icon={<ShoppingBag className="w-4 h-4" />} className="rounded-xl">
          تصفح المتجر
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex justify-between items-baseline mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#39396d]" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>سلة التسوق</h1>
        <span className="text-sm font-semibold text-[#777680]">{items.length} منتجات</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            {items.map((item) => {
              // تحديد صيغة أو نوع الملف لعرضه بشكل نظيف
              const slug = item.slug?.toLowerCase() ?? ''
              const fileFormat = slug.includes('canva') ? 'رابط تعديل: Canva'
                : slug.includes('excel') ? 'ملف: Excel'
                : slug.includes('word') ? 'مستند: Word'
                : 'ملف رقمي: PDF'

              return (
                <div
                  key={cartItemKey(item)}
                  className="bg-white rounded-2xl border border-[#c8c5d0]/30 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <img src={item.thumbnail} alt={item.titleAr} className="w-24 h-16 object-cover rounded-xl bg-[#edeef0] border border-[#edeef0]" />
                  <div className="flex-1 min-w-0 text-right">
                    <Link
                      to={item.type === 'bundle' ? `/marketplace/bundles/${item.slug}` : `/marketplace/${item.slug}`}
                      className="font-bold text-[#39396d] hover:text-[#505086] transition-colors line-clamp-1 text-sm sm:text-base"
                    >
                      {item.type === 'bundle' && (
                        <Badge variant="accent" className="ml-2 align-middle text-[10px] py-0">حزمة</Badge>
                      )}
                      {item.titleAr}
                    </Link>
                    <p className="text-xs text-[#777680] mt-1">{fileFormat}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-semibold text-[#47464f]">الكمية: 1</span>
                      <span className="text-sm font-bold text-[#39396d]">{item.price} ر.س</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(cartItemKey(item))}
                    className="p-2.5 text-[#777680] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs font-bold text-[#777680] hover:text-red-500 transition-colors"
            >
              تفريغ السلة بالكامل
            </button>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39396d] hover:underline"
            >
              مواصلة التسوق
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ملخص الدفع */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#c8c5d0]/30 p-6 shadow-xl shadow-[#39396d]/5 space-y-6">
            <h2 className="font-bold text-lg text-[#39396d] pb-3 border-b border-[#edeef0]" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>ملخص الطلب</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[#47464f] text-sm">
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{total.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-[#47464f] text-sm">
                <span>الخصم</span>
                <span className="text-[#22C55E] font-semibold">0.00 ر.س</span>
              </div>
              <div className="flex justify-between text-xs text-[#777680]">
                <span>شامل ضريبة القيمة المضافة</span>
                <span>%15</span>
              </div>
            </div>

            {/* إدخال كود الخصم */}
            <div className="pt-4 border-t border-[#edeef0]">
              <label className="block text-xs font-bold text-[#47464f] mb-2">هل لديك كود خصم؟</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="أدخل الكود هنا"
                  className="input-field h-10 text-xs flex-1 rounded-xl"
                />
                <button
                  type="button"
                  className="bg-[#39396d] text-white px-4 rounded-xl text-xs font-bold hover:bg-[#505086] transition-colors"
                >
                  تطبيق
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#edeef0]">
              <div className="flex justify-between font-bold text-lg text-[#39396d] mb-4">
                <span>الإجمالي النهائي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
              <Button to="/checkout" variant="accent" size="lg" fullWidth className="bg-[#39396d] text-white hover:bg-[#505086] rounded-xl font-bold h-12 shadow-lg shadow-[#39396d]/10">
                إتمام عملية الشراء
              </Button>
            </div>
          </div>

          {/* ضمان الجودة */}
          <div className="bg-[#e2dfff]/30 border border-[#39396d]/10 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#39396d] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-[#39396d]">ضمان جودة مدار</h4>
              <p className="text-[11px] text-[#47464f] mt-0.5 leading-relaxed">نتحقق يدوياً من كل مصدر تعليمي معروض للتأكد من جودته ومطابقته التامة للمناهج الدراسية.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
