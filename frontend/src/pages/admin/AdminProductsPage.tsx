import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { fetchAdminProducts } from '../../lib/adminProducts'
import type { Product, ProductStatus } from '../../types/database'

const STATUS_FILTERS: { label: string; value: ProductStatus | '' }[] = [
  { label: 'الكل', value: '' },
  { label: 'منشور', value: 'PUBLISHED' },
  { label: 'مسودة', value: 'DRAFT' },
  { label: 'مؤرشف', value: 'ARCHIVED' },
]

const STATUS_BADGE: Record<ProductStatus, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-600',
  ARCHIVED: 'bg-red-100 text-red-700',
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<ProductStatus | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAdminProducts(filter || undefined).then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [filter])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orbit-purple">المنتجات</h1>
        <Link
          to="/admin/marketplace/new"
          className="bg-solar-gold text-space-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400"
        >
          + منتج جديد
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === f.value ? 'bg-orbit-purple text-white' : 'bg-white text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl">
          لا توجد منتجات — <Link to="/admin/marketplace/new" className="text-orbit-purple">أضف أول منتج</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stellar-gray text-gray-600">
              <tr>
                <th className="text-right px-4 py-3">المنتج</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">التصنيف</th>
                <th className="text-right px-4 py-3">السعر</th>
                <th className="text-right px-4 py-3">الحالة</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">مبيعات</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail} alt="" className="w-10 h-8 object-cover rounded" />
                      <span className="font-medium line-clamp-1">{p.title_ar}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {(p as Product & { market_categories?: { name_ar: string } }).market_categories?.name_ar ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orbit-purple">
                    {p.discount_price ?? p.price} ر.س
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>
                      {p.status === 'PUBLISHED' ? 'منشور' : p.status === 'DRAFT' ? 'مسودة' : 'مؤرشف'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.total_sales}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/marketplace/${p.id}`}
                      className="text-orbit-purple hover:underline text-xs"
                    >
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
