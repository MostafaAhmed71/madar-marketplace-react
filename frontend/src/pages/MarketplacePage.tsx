import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { ProductCard } from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { Button } from '../components/ui/Button'
import { useCategories, useProducts } from '../hooks/useProducts'
import { cn } from '../lib/cn'

export function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>()
  const { categories } = useCategories()
  const { products, loading } = useProducts(activeCategory, search)
  const location = useLocation()
  const showHero = location.pathname === '/' || location.pathname === '/marketplace'

  return (
    <div>
      {showHero && <HeroSection />}

      {/* شريط البحث والفلاتر */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="search"
            placeholder="ابحث في المتجر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10 pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {!loading && (
          <p className="flex items-center gap-2 text-sm text-zinc-500 sm:mr-auto">
            <SlidersHorizontal className="w-4 h-4" />
            {products.length} منتج
          </p>
        )}
      </div>

      {/* التصنيفات */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <button
          type="button"
          onClick={() => setActiveCategory(undefined)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            !activeCategory
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
          )}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
              activeCategory === cat.slug
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            )}
          >
            {cat.name_ar}
          </button>
        ))}
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 animate-fade-in">
          <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-zinc-800 mb-1">لا توجد نتائج</p>
          <p className="text-sm text-zinc-500 mb-6">جرّب كلمة بحث أو تصنيفاً مختلفاً</p>
          <Button variant="outline" onClick={() => { setSearch(''); setActiveCategory(undefined) }}>
            مسح الفلاتر
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
