import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Eye, FileText, ShoppingCart, Star } from 'lucide-react'
import { Breadcrumb } from '../components/Breadcrumb'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ReviewsSection } from '../components/ReviewsSection'
import { WishlistButton } from '../components/WishlistButton'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { PRODUCT_TYPE_LABELS, useProduct } from '../hooks/useProducts'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { product, loading, error } = useProduct(slug)
  const { addProduct, isInCart } = useCart()
  const { toast } = useToast()
  const [activeImage, setActiveImage] = useState(0)

  if (loading) return <LoadingSpinner />
  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-zinc-600 mb-6">المنتج غير موجود</p>
        <Button to="/marketplace" variant="primary">العودة للمتجر</Button>
      </div>
    )
  }

  const price = product.discount_price ?? product.price
  const hasDiscount = product.discount_price != null
  const images = [product.thumbnail, ...(product.preview_images ?? [])]
  const inCart = isInCart('product', product.id)

  const handleAddToCart = () => {
    if (inCart) return
    addProduct(product)
    toast('تمت الإضافة إلى السلة')
  }

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          ...(product.market_categories
            ? [{ label: product.market_categories.name_ar, to: `/marketplace/category/${product.market_categories.slug}` }]
            : []),
          { label: product.title_ar },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
        <div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-3">
            <img key={activeImage} src={images[activeImage]} alt={product.title_ar} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-zinc-900' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            {product.market_categories && (
              <Badge variant="muted">{product.market_categories.name_ar}</Badge>
            )}
            <WishlistButton productId={product.id} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug mb-4">{product.title_ar}</h1>

          <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-zinc-200">
            <span className="text-3xl font-bold text-zinc-900">{price}</span>
            <span className="text-sm text-zinc-500">ر.س</span>
            {hasDiscount && <span className="text-lg text-zinc-400 line-through">{product.price} ر.س</span>}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.avg_rating > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.avg_rating.toFixed(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg">
              <Eye className="w-3.5 h-3.5" />
              {product.total_views}
            </span>
            <Badge variant="default">{PRODUCT_TYPE_LABELS[product.product_type]}</Badge>
          </div>

          <p className="text-zinc-600 leading-relaxed mb-6">{product.description}</p>

          {product.file_types?.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                صيغ الملفات
              </p>
              <div className="flex flex-wrap gap-2">
                {(product.file_types as string[]).map((type) => (
                  <span key={type} className="text-xs font-medium bg-white border border-zinc-200 px-3 py-1.5 rounded-md text-zinc-700">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            variant={inCart ? 'outline' : 'primary'}
            size="lg"
            fullWidth
            onClick={handleAddToCart}
            disabled={inCart}
            icon={inCart ? <Check className="w-5 h-5 text-emerald-600" /> : <ShoppingCart className="w-5 h-5" />}
            className={inCart ? 'border-emerald-200 text-emerald-700' : ''}
          >
            {inCart ? 'موجود في السلة' : 'أضف إلى السلة'}
          </Button>
        </div>
      </div>

      {product.detailed_desc && (
        <div className="mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">التفاصيل</h2>
          <div className="text-zinc-600 leading-loose whitespace-pre-line">{product.detailed_desc}</div>
        </div>
      )}

      {product.video_url && (
        <div className="mt-6 p-6 bg-white rounded-2xl border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">معاينة</h2>
          <div className="aspect-video rounded-xl overflow-hidden border border-zinc-200">
            <iframe src={product.video_url} title="معاينة" className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}

      <ReviewsSection productId={product.id} />
    </div>
  )
}
