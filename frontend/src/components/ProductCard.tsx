import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'
import type { Product } from '../types/database'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { WishlistButton } from './WishlistButton'

interface ProductCardProps {
  product: Product
  index?: number
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
      className="animate-fade-in-up group"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.35)}s` }}
    >
      <div className="product-card">
        <Link to={`/marketplace/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={product.thumbnail}
            alt={product.title_ar}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <Badge variant="sale" className="absolute top-3 right-3">
              −{discountPercent}%
            </Badge>
          )}
          <div
            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.preventDefault()}
          >
            <WishlistButton productId={product.id} size="sm" />
          </div>
        </Link>

        <div className="p-4">
          {product.market_categories && (
            <p className="text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
              {product.market_categories.name_ar}
            </p>
          )}
          <Link to={`/marketplace/${product.slug}`}>
            <h3 className="font-semibold text-zinc-900 line-clamp-2 text-sm leading-snug mb-3 group-hover:text-orbit-purple transition-colors min-h-[2.5rem]">
              {product.title_ar}
            </h3>
          </Link>

          <div className="flex items-end justify-between gap-2 mb-4">
            <div>
              <span className="text-lg font-bold text-zinc-900">{price}</span>
              <span className="text-xs text-zinc-500 mr-1">ر.س</span>
              {hasDiscount && (
                <span className="text-sm text-zinc-400 line-through mr-2">{product.price}</span>
              )}
            </div>
            {product.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-600 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.avg_rating.toFixed(1)}
              </div>
            )}
          </div>

          <Button
            variant={inCart ? 'outline' : 'primary'}
            size="sm"
            fullWidth
            loading={adding}
            disabled={inCart}
            icon={
              inCart ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )
            }
            onClick={handleAddToCart}
            className={cn(inCart && 'border-emerald-200 text-emerald-700')}
          >
            {inCart ? 'في السلة' : 'أضف للسلة'}
          </Button>
        </div>
      </div>
    </article>
  )
}
