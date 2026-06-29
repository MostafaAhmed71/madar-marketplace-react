import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { fetchWishlist } from '../lib/wishlist'
import type { Product } from '../types/database'

export function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-8">المفضلة</h1>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-zinc-300" />
          </div>
          <p className="text-zinc-500 mb-8">قائمة المفضلة فارغة</p>
          <Button to="/marketplace" variant="primary">تصفح المنتجات</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
