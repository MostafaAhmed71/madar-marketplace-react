import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProductCard } from '../components/ProductCard'
import { useCategory, useProductsByCategoryId } from '../hooks/useProducts'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const { category, loading: catLoading } = useCategory(slug)
  const { products, loading: prodLoading } = useProductsByCategoryId(category?.id ?? '')
  const [search, setSearch] = useState('')

  if (catLoading) return <LoadingSpinner />

  if (!category) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-600 mb-4">التصنيف غير موجود</p>
        <Link to="/marketplace" className="text-orbit-purple hover:underline">
          العودة للمتجر
        </Link>
      </div>
    )
  }

  const filtered = search
    ? products.filter((p) => p.title_ar.includes(search))
    : products

  return (
    <div>
      <Breadcrumb items={[{ label: category.name_ar }]} />

      <div className="flex items-center gap-3 mb-2">
        {category.icon && <span className="text-3xl">{category.icon}</span>}
        <h1 className="text-3xl font-bold text-orbit-purple">{category.name_ar}</h1>
      </div>
      <p className="text-gray-600 mb-6">{filtered.length} منتج</p>

      <input
        type="search"
        placeholder="ابحث في هذا التصنيف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple mb-8"
      />

      {prodLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">لا توجد منتجات في هذا التصنيف</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
