import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import type { Bundle } from '../lib/bundles'
import { getBundlePrice } from '../lib/bundles'
import { Badge } from './ui/Badge'

interface BundleCardProps {
  bundle: Bundle
  index?: number
}

export function BundleCard({ bundle, index = 0 }: BundleCardProps) {
  const price = getBundlePrice(bundle)
  const hasDiscount = bundle.discount_price != null

  return (
    <Link
      to={`/marketplace/bundles/${bundle.slug}`}
      className="animate-fade-in-up block bg-white rounded-xl border border-zinc-200 overflow-hidden group hover:border-zinc-300 hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${Math.min(index * 0.07, 0.5)}s` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 flex items-center justify-center">
        {bundle.thumbnail ? (
          <img
            src={bundle.thumbnail}
            alt={bundle.title_ar}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package className="w-16 h-16 text-zinc-300" strokeWidth={1.25} />
        )}
        <Badge variant="accent" className="absolute top-3 right-3 shadow-sm">
          حزمة موفّرة
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 line-clamp-2 mb-2 group-hover:text-orbit-purple transition-colors">
          {bundle.title_ar}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-zinc-900 font-bold text-lg">{price}</span>
          <span className="text-xs text-zinc-500">ر.س</span>
          {hasDiscount && <span className="text-zinc-400 line-through text-sm">{bundle.price} ر.س</span>}
        </div>
      </div>
    </Link>
  )
}
