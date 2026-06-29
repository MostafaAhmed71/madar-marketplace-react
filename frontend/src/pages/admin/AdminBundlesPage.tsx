import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { deleteBundle, fetchAdminBundles } from '../../lib/bundles'
import type { Bundle } from '../../lib/bundles'

export function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => fetchAdminBundles().then((data) => { setBundles(data); setLoading(false) })

  useEffect(() => { load() }, [])

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orbit-purple">الحزم</h1>
        <Link to="/admin/bundles/new" className="bg-solar-gold text-space-black px-4 py-2 rounded-lg font-semibold text-sm">
          + حزمة جديدة
        </Link>
      </div>
      {bundles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl">لا توجد حزم</div>
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold">{b.title_ar}</p>
                <p className="text-sm text-gray-400">{b.bundle_items?.length ?? 0} منتجات — {b.discount_price ?? b.price} ر.س</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link to={`/admin/bundles/${b.id}`} className="text-orbit-purple hover:underline">تعديل</Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('حذف الحزمة؟')) {
                      await deleteBundle(b.id)
                      load()
                    }
                  }}
                  className="text-red-500 hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
