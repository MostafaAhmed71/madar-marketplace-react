import { useEffect, useState } from 'react'
import { BundleCard } from '../components/BundleCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchBundles } from '../lib/bundles'
import type { Bundle } from '../lib/bundles'

export function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBundles().then((data) => {
      setBundles(data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orbit-purple mb-2">حزم الموارد</h1>
        <p className="text-gray-600">مجموعات منتجات بأسعار مخفّضة</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bundles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">لا توجد حزم حالياً</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((b, i) => (
            <BundleCard key={b.id} bundle={b} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
