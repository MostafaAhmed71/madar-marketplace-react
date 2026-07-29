import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'
import type { Product } from '../types/database'
import { WishlistButton } from './WishlistButton'

interface ProductCardProps {
  product: Product
  index?: number
}

// نوع الملف → لون الشارة
const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  pdf:   { bg: '#39396d', text: '#ffffff', label: 'PDF' },
  canva: { bg: '#f9b500', text: '#684a00', label: 'Canva' },
  excel: { bg: '#22C55E', text: '#ffffff', label: 'Excel' },
  word:  { bg: '#3B82F6', text: '#ffffff', label: 'Word' },
  ppt:   { bg: '#F97316', text: '#ffffff', label: 'PPT' },
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const price = product.discount_price ?? product.price
  const hasDiscount = product.discount_price != null
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discount_price! / product.price) * 100)
    : 0

  const { addProduct, isInCart } = useCart()
  const { toast } = useToast()
  const [adding, setAdding] = useState(false)
  const inCart = isInCart('product', product.id)

  const rating = product.avg_rating > 0 ? product.avg_rating : 4.5
  const reviewCount = product.total_sales && product.total_sales > 0 ? product.total_sales : 12 + index * 3

  // تحديد نوع الملف من العنوان أو التصنيف
  const slug = product.slug?.toLowerCase() ?? ''
  const fileType = slug.includes('canva') ? 'canva'
    : slug.includes('excel') ? 'excel'
    : slug.includes('word') ? 'word'
    : slug.includes('ppt') ? 'ppt'
    : 'pdf'
  const typeMeta = typeColors[fileType] ?? typeColors.pdf

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) return
    setAdding(true)
    addProduct(product)
    toast('تمت الإضافة إلى السلة')
    setTimeout(() => setAdding(false), 500)
  }

  return (
    <article
      className="animate-fade-in-up group/card"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.40)}s` }}
    >
      <div className="product-card flex flex-col h-full">

        {/* صورة المنتج */}
        <Link
          to={`/marketplace/${product.slug}`}
          className="block relative overflow-hidden"
          style={{ aspectRatio: '4/3', background: '#e7e8ea' }}
        >
          <img
            src={product.thumbnail}
            alt={product.title_ar}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />

          {/* شارة نوع الملف */}
          <span
            className="absolute top-2.5 right-2.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase"
            style={{ background: typeMeta.bg, color: typeMeta.text }}
          >
            {typeMeta.label}
          </span>

          {/* شارة الخصم */}
          {hasDiscount && (
            <span
              className="absolute top-2.5 left-2.5 badge-discount"
            >
              خصم {discountPercent}%
            </span>
          )}

          {/* زر المفضلة */}
          <div
            className="absolute bottom-2.5 left-2.5 opacity-0 group-hover/card:opacity-100 transition-all duration-300"
            onClick={(e) => e.preventDefault()}
          >
            <WishlistButton
              productId={product.id}
              size="sm"
              className="shadow-md bg-white hover:bg-red-50 border border-[#c8c5d0] text-[#777680] hover:text-red-500"
            />
          </div>
        </Link>

        {/* محتوى البطاقة */}
        <div className="p-4 flex flex-col flex-grow text-right">

          {/* التصنيف */}
          {product.market_categories && (
            <span
              className="text-[10px] font-bold mb-1.5 uppercase tracking-widest block"
              style={{ color: '#595990' }}
            >
              {product.market_categories.name_ar}
            </span>
          )}

          {/* العنوان + قلب */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <Link to={`/marketplace/${product.slug}`} className="flex-1">
              <h3
                className="font-semibold line-clamp-2 text-sm leading-relaxed min-h-[2.5rem] transition-colors duration-200 group-hover/card:text-[#39396d]"
                style={{ color: '#191c1e', fontFamily: 'IBM Plex Sans Arabic' }}
              >
                {product.title_ar}
              </h3>
            </Link>
          </div>

          {/* التقييم */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="star-fill text-sm">★</span>
            <span className="text-xs font-bold" style={{ color: '#191c1e' }}>{rating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: '#777680' }}>({reviewCount} تقييم)</span>
          </div>

          {/* السعر + زر سلة */}
          <div
            className="flex items-center justify-between gap-2 pt-3 mt-auto"
            style={{ borderTop: '1px solid rgba(200,197,208,0.20)' }}
          >
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="price-old">{product.price} ر.س</span>
              )}
              <div className="flex items-baseline gap-0.5">
                <span className="price-main">{price}</span>
                <span className="price-currency"> ر.س</span>
              </div>
            </div>

            {/* زر أضف للسلة */}
            <button
              onClick={handleAddToCart}
              disabled={inCart || adding}
              className={cn(
                'p-2.5 rounded-xl transition-all duration-250',
                inCart ? 'cursor-default' : 'hover:scale-110 active:scale-95'
              )}
              style={
                inCart
                  ? { background: '#e2dfff', color: '#39396d' }
                  : { background: '#f9b500', color: '#684a00' }
              }
              title={inCart ? 'في السلة' : 'أضف للسلة'}
            >
              {adding ? (
                <span className="animate-spin text-base block w-5 h-5 flex items-center justify-center">⟳</span>
              ) : inCart ? (
                <Check className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
