import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { fetchAnalytics, type Analytics } from '../../lib/analytics'
import type { OrderStatus } from '../../types/database'

function StatCard({ label, value, sub, color = 'text-orbit-purple' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics().then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>
  if (!data) return null

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-orbit-purple mb-6">الإحصائيات</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي الإيرادات" value={`${data.totalRevenue.toFixed(0)} ر.س`} />
        <StatCard label="طلبات مدفوعة" value={data.paidOrders} sub={`من ${data.totalOrders} طلب`} color="text-growth-green" />
        <StatCard label="بانتظار المراجعة" value={data.awaitingReview} color="text-yellow-600" />
        <StatCard label="إجمالي المبيعات" value={data.totalSales} sub="منتج مباع" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">المنتجات الأكثر مبيعاً</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{p.title_ar}</span>
                  <span className="text-orbit-purple font-semibold shrink-0 mr-2">{p.total_sales} مبيعة</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">آخر الطلبات</h2>
          <div className="space-y-3">
            {data.recentOrders.map((o, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>#{o.order_number}</span>
                <OrderStatusBadge status={o.status as OrderStatus} />
                <span className="font-semibold text-orbit-purple">{o.total_amount} ر.س</span>
              </div>
            ))}
          </div>
          <Link to="/admin/orders" className="block text-center text-sm text-orbit-purple mt-4 hover:underline">
            عرض كل الطلبات
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <StatCard label="إجمالي المنتجات" value={data.totalProducts} />
        <StatCard label="منتجات منشورة" value={data.publishedProducts} color="text-growth-green" />
      </div>
    </AdminLayout>
  )
}
