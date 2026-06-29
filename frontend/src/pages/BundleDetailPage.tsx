import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { fetchBundle, getBundlePrice } from '../lib/bundles'
import type { Bundle } from '../lib/bundles'

export function BundleDetailPage() {
  const { slug = '' } = useParams()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addBundle, isInCart } = useCart()

  useEffect(() => {
    fetchBundle(slug).then((data) => {
      setBundle(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) return <LoadingSpinner />
  if (!bundle) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">الحزمة غير موجودة</p>
        <Link to="/marketplace/bundles" className="text-orbit-purple hover:underline">العودة للحزم</Link>
      </div>
    )
  }

  const price = getBundlePrice(bundle)
  const hasDiscount = bundle.discount_price != null
  const inCart = isInCart('bundle', bundle.id)
  const products = bundle.bundle_items?.map((bi) => bi.products).filter(Boolean) ?? []

  const handleAdd = () => {
    addBundle(bundle)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/marketplace/bundles" className="hover:text-orbit-purple">الحزم</Link>
        <span> / </span>
        <span className="text-space-black">{bundle.title_ar}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-nebula-laven/10 flex items-center justify-center">
          {bundle.thumbnail ? (
            <img src={bundle.thumbnail} alt={bundle.title_ar} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">📦</span>
          )}
        </div>

        <div>
          <span className="text-xs bg-solar-gold/30 text-space-black px-3 py-1 rounded-full">حزمة موفّرة</span>
          <h1 className="text-2xl font-bold text-space-black mt-3 mb-4">{bundle.title_ar}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-orbit-purple">{price} ر.س</span>
            {hasDiscount && <span className="text-gray-400 line-through text-lg">{bundle.price} ر.س</span>}
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{bundle.description}</p>
          <p className="text-sm text-gray-500 mb-6">تتضمن {products.length} منتجات</p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={inCart}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              inCart || added ? 'bg-growth-green text-white' : 'bg-solar-gold text-space-black hover:bg-yellow-400'
            }`}
          >
            {inCart ? '✓ في السلة' : added ? '✓ تمت الإضافة' : 'أضف الحزمة للسلة'}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-orbit-purple mb-4">المنتجات المضمّنة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => p && <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
