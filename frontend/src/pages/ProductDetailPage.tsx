import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, FileText, ShoppingCart, Star, Shield, Zap, RefreshCw } from 'lucide-react'
import { Breadcrumb } from '../components/Breadcrumb'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ReviewsSection } from '../components/ReviewsSection'
import { WishlistButton } from '../components/WishlistButton'
import { Button } from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useProduct } from '../hooks/useProducts'
import { cn } from '../lib/cn'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { product, loading, error } = useProduct(slug)
  const { addProduct, isInCart } = useCart()
  const { toast } = useToast()
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'files'>('desc')

  if (loading) return <LoadingSpinner />
  if (error || !product) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-[#c8c5d0]/30 shadow-sm">
        <p className="text-lg text-[#47464f] mb-6">المنتج غير موجود</p>
        <Button to="/marketplace" variant="primary" className="rounded-xl">العودة للمتجر</Button>
      </div>
    )
  }

  const price = product.discount_price ?? product.price
  const hasDiscount = product.discount_price != null
  const images = [product.thumbnail, ...(product.preview_images ?? [])]
  const inCart = isInCart('product', product.id)
  const rating = product.avg_rating > 0 ? product.avg_rating : 4.8
  const salesCount = product.total_sales && product.total_sales > 0 ? product.total_sales : 120

  const handleAddToCart = () => {
    if (inCart) return
    addProduct(product)
    toast('تمت الإضافة إلى السلة')
  }

  const discountPercent = hasDiscount
    ? Math.round((1 - product.discount_price! / product.price) * 100)
    : 0

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'المتجر', to: '/marketplace' },
          ...(product.market_categories
            ? [{ label: product.market_categories.name_ar, to: `/marketplace/category/${product.market_categories.slug}` }]
            : []),
          { label: product.title_ar },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-2">
        {/* العمود الأيمن (التفاصيل والبيع) */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#c8c5d0]/30 shadow-xl shadow-[#39396d]/5">
            {/* حالة التوثيق والتصنيف */}
            <div className="flex justify-between items-center mb-4">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" /> موثق
              </span>
              {product.market_categories && (
                <span className="text-xs font-semibold text-[#595990]">{product.market_categories.name_ar}</span>
              )}
            </div>

            {/* العنوان */}
            <h1 className="text-xl sm:text-2xl font-bold leading-snug text-[#39396d] mb-3" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
              {product.title_ar}
            </h1>

            {/* مراجعات ومبيعات */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#edeef0]">
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-[#191c1e]">{rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-[#777680]">• تم بيع {salesCount}+ مرة</span>
            </div>

            {/* السعر والخصم */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {hasDiscount && (
                  <span className="price-old block mb-1">{product.price} ر.س</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="price-main text-3xl font-extrabold text-[#39396d]">{price}</span>
                  <span className="price-currency text-sm">ر.س</span>
                </div>
              </div>
              {hasDiscount && (
                <span className="badge-discount">خصم {discountPercent}%</span>
              )}
            </div>

            {/* أزرار السلة والمفضلة */}
            <div className="space-y-3">
              <Button
                variant={inCart ? 'outline' : 'primary'}
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={inCart}
                icon={inCart ? <Check className="w-5 h-5 text-emerald-600" /> : <ShoppingCart className="w-5 h-5" />}
                className={cn(
                  'rounded-xl h-12 font-bold transition-all',
                  inCart
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50 disabled:bg-emerald-50/50 disabled:text-emerald-700 disabled:border-emerald-200 disabled:opacity-100'
                    : 'bg-[#39396d] text-white hover:bg-[#505086]'
                )}
              >
                {inCart ? 'موجود في السلة' : 'إضافة إلى السلة'}
              </Button>

              <div className="flex gap-2">
                <WishlistButton
                  productId={product.id}
                  className="flex-1 h-12 border border-[#c8c5d0] hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-xs"
                />
              </div>
            </div>

            {/* نقاط ثقة المنتج */}
            <div className="mt-6 pt-6 border-t border-[#edeef0] space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-[#47464f]">
                <Zap className="w-4 h-4 text-[#39396d]" />
                <span>تحميل فوري بعد الدفع مباشرة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#47464f]">
                <RefreshCw className="w-4 h-4 text-[#39396d]" />
                <span>تحديثات مجانية مدى الحياة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#47464f]">
                <Shield className="w-4 h-4 text-[#39396d]" />
                <span>دفع آمن 100% ومحمي</span>
              </div>
            </div>
          </div>

          {/* معلومات البائع */}
          <div className="bg-white rounded-3xl p-5 border border-[#c8c5d0]/30 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e2dfff] text-[#39396d] font-bold flex items-center justify-center text-sm">
                مد
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#39396d]">أكاديمية مدار التعليمية</h4>
                <p className="text-xs text-[#777680]">بائع متميز • 5.0 تقييم</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#39396d] hover:underline">متابعة</button>
          </div>
        </div>

        {/* العمود الأيسر (الصور والمعاينة والتفاصيل) */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
          {/* معرض الصور */}
          <div className="bg-white p-4 rounded-3xl border border-[#c8c5d0]/30 shadow-sm">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#edeef0] border border-[#edeef0] mb-3 relative">
              <img key={activeImage} src={images[activeImage]} alt={product.title_ar} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all',
                      activeImage === i ? 'border-[#39396d]' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التبويبات (الوصف ومحتويات الملف) */}
          <div className="bg-white rounded-3xl border border-[#c8c5d0]/30 shadow-sm overflow-hidden">
            <div className="flex border-b border-[#edeef0]">
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={cn(
                  'flex-1 py-4 text-center font-bold text-sm transition-all border-b-2',
                  activeTab === 'desc' ? 'border-[#39396d] text-[#39396d]' : 'border-transparent text-[#777680] hover:text-[#39396d]'
                )}
              >
                الوصف
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('files')}
                className={cn(
                  'flex-1 py-4 text-center font-bold text-sm transition-all border-b-2',
                  activeTab === 'files' ? 'border-[#39396d] text-[#39396d]' : 'border-transparent text-[#777680] hover:text-[#39396d]'
                )}
              >
                محتويات الملف
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'desc' ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base leading-relaxed text-[#47464f] whitespace-pre-line">{product.description}</p>
                  {product.detailed_desc && (
                    <div className="pt-4 border-t border-[#edeef0] text-sm text-[#47464f] leading-loose whitespace-pre-line">
                      {product.detailed_desc}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#39396d] text-sm mb-3">الصيغ المتاحة للتحميل:</h3>
                  {product.file_types?.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {(product.file_types as string[]).map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#e2dfff] text-[#39396d] px-3.5 py-2 rounded-xl border border-[#39396d]/10"
                        >
                          <FileText className="w-4 h-4" />
                          {type} (قابل للتعديل والطباعة)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#e2dfff] text-[#39396d] px-3.5 py-2 rounded-xl">
                      <FileText className="w-4 h-4" /> PDF (جاهز للطباعة)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* المعاينة بالفيديو إن وجد */}
          {product.video_url && (
            <div className="bg-white p-6 rounded-3xl border border-[#c8c5d0]/30 shadow-sm">
              <h2 className="text-lg font-bold text-[#39396d] mb-4">فيديو معاينة المنتج</h2>
              <div className="aspect-video rounded-2xl overflow-hidden border border-[#edeef0]">
                <iframe src={product.video_url} title="معاينة" className="w-full h-full" allowFullScreen />
              </div>
            </div>
          )}

          {/* التقييمات */}
          <div className="bg-white p-6 rounded-3xl border border-[#c8c5d0]/30 shadow-sm">
            <ReviewsSection productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
