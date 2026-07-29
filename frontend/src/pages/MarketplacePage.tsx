import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  Search, X, BookOpen, Layers, Package, LayoutGrid, TrendingUp, SlidersHorizontal,
} from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { ProductCard } from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { Button } from '../components/ui/Button'
import { useCategories, useProducts } from '../hooks/useProducts'
import { cn } from '../lib/cn'


export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [activeCategory, setActiveCategory] = useState<string | undefined>()
  const { categories } = useCategories()
  const { products, loading } = useProducts(activeCategory, search)
  const location = useLocation()

  const showHero =
    (location.pathname === '/' || location.pathname === '/marketplace') && !search

  const handleClearSearch = () => {
    searchParams.delete('q')
    setSearchParams(searchParams)
  }

  return (
    <div className="space-y-8">
      {showHero && <HeroSection />}

      {/* ======= بحث موبايل ======= */}
      <div className="md:hidden flex gap-2 animate-fade-in-up">
        <div className="relative flex-grow">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#777680' }} />
          <input
            type="search"
            placeholder="ابحث في المتجر..."
            value={search}
            onChange={(e) => {
              if (e.target.value) setSearchParams({ q: e.target.value })
              else handleClearSearch()
            }}
            className="input-field pr-10 pl-8"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#777680' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ======= تصفح حسب الفئة (Bento Style) ======= */}
      {showHero && categories.length > 0 && (
        <div className="animate-fade-in-up space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#39396d', fontFamily: 'IBM Plex Sans Arabic' }}>
                تصفح حسب الفئة
              </h2>
              <p className="text-sm mt-1" style={{ color: '#47464f' }}>
                كل ما تحتاجه للفصل الدراسي في مكان واحد
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[320px]">
            {/* التصنيف الأول — كبير */}
            {categories[0] && (
              <button
                type="button"
                onClick={() => setActiveCategory(categories[0].slug)}
                className="md:col-span-2 rounded-3xl p-7 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-sm hover:shadow-xl transition-all text-right min-h-[160px] md:min-h-0"
                style={{ background: '#e2dfff' }}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#14124d', fontFamily: 'IBM Plex Sans Arabic' }}>
                    {categories[0].name_ar}
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(20,18,77,0.65)' }}>
                    مصادر متنوعة ومعتمدة لجميع المراحل
                  </p>
                </div>
                <div className="absolute -bottom-4 -left-4 opacity-10 group-hover:opacity-20 transition-opacity text-[120px]">📋</div>
                <div className="relative z-10 flex gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.55)', color: '#14124d' }}>وزاري</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.55)', color: '#14124d' }}>فصلي</span>
                </div>
              </button>
            )}

            {/* التصنيف الثاني */}
            {categories[1] && (
              <button
                type="button"
                onClick={() => setActiveCategory(categories[1].slug)}
                className="rounded-3xl p-6 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-sm hover:shadow-xl transition-all text-right min-h-[140px] md:min-h-0"
                style={{ background: '#ffdea6' }}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#271900', fontFamily: 'IBM Plex Sans Arabic' }}>
                    {categories[1].name_ar}
                  </h3>
                  <p className="text-xs" style={{ color: 'rgba(39,25,0,0.60)' }}>تحضير كامل وشامل</p>
                </div>
                <div className="absolute bottom-4 left-4 text-5xl opacity-20">📒</div>
              </button>
            )}

            {/* التصنيف الثالث */}
            {categories[2] && (
              <button
                type="button"
                onClick={() => setActiveCategory(categories[2].slug)}
                className="rounded-3xl p-6 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-sm hover:shadow-xl transition-all text-right min-h-[140px] md:min-h-0"
                style={{ background: '#e7e8ea' }}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#191c1e', fontFamily: 'IBM Plex Sans Arabic' }}>
                    {categories[2].name_ar}
                  </h3>
                  <p className="text-xs" style={{ color: '#47464f' }}>تفاعلية وقابلة للطباعة</p>
                </div>
                <div className="absolute bottom-4 left-4 text-5xl opacity-20">📄</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======= شريط التصنيفات Pills ======= */}
      <div className="animate-fade-in-up">
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory(undefined)}
            className={cn('category-pill shrink-0', !activeCategory && 'active')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            الكل
          </button>
          {categories.map((cat) => {
            const active = activeCategory === cat.slug
            const Icon = cat.slug === 'lesson-plans' ? BookOpen : cat.slug === 'worksheets' ? Layers : Package
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={cn('category-pill shrink-0', active && 'active')}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name_ar}
              </button>
            )
          })}
        </div>
      </div>

      {/* ======= المنتجات ======= */}
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl animate-fade-in border"
          style={{ background: '#ffffff', borderColor: '#e7e8ea' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e2dfff' }}
          >
            <Search className="w-6 h-6" style={{ color: '#39396d' }} />
          </div>
          <p className="text-lg font-bold mb-1" style={{ color: '#191c1e' }}>لا توجد نتائج</p>
          <p className="text-sm mb-6" style={{ color: '#47464f' }}>جرّب كلمة بحث أو تصنيفاً مختلفاً</p>
          <Button variant="outline" onClick={() => { handleClearSearch(); setActiveCategory(undefined) }}>
            مسح الفلاتر
          </Button>
        </div>
      ) : (
        <div className="space-y-10">

          {/* قسم الأكثر مبيعاً */}
          {!search && products.length > 2 && (
            <div className="space-y-5 animate-fade-in-up" style={{ background: '#f3f4f6', borderRadius: '24px', padding: '28px' }}>
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(200,197,208,0.40)' }}>
                <div className="section-title">
                  <TrendingUp className="w-5 h-5" style={{ color: '#39396d' }} />
                  أحدث المصادر المضافة
                </div>
                <span className="text-xs font-bold" style={{ color: '#777680' }}>الخيار الأول للمعلمين</span>
              </div>
              <div className="h-scroll -mx-2 px-2">
                {products.slice(0, 4).map((product, i) => (
                  <div key={product.id} className="w-[255px] sm:w-[275px] shrink-0">
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* جميع المنتجات */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(200,197,208,0.30)' }}>
              <div className="section-title">
                <SlidersHorizontal className="w-4 h-4" style={{ color: '#39396d' }} />
                {search ? `نتائج البحث عن "${search}"` : 'جميع الموارد التعليمية'}
                <span className="text-sm font-normal" style={{ color: '#777680' }}>({products.length})</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
