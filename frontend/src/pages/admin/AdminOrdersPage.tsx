import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { fetchAdminOrders } from '../../lib/admin'
import type { AdminOrder } from '../../lib/admin'
import type { OrderStatus } from '../../types/database'

const FILTERS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'الكل', value: '' },
  { label: 'بانتظار المراجعة', value: 'AWAITING_REVIEW' },
  { label: 'في انتظار الإيصال', value: 'PENDING' },
  { label: 'مدفوع', value: 'PAID' },
  { label: 'مرفوض', value: 'REJECTED' },
]

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') ?? '') as OrderStatus | ''
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    setLoading(true)
    setFetchError('')
    fetchAdminOrders(status || undefined)
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : 'فشل تحميل الطلبات')
        setOrders([])
        setLoading(false)
      })
  }, [status])

  const awaitingCount = orders.filter((o) => o.status === 'AWAITING_REVIEW').length

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orbit-purple">إدارة الطلبات</h1>
          {status === 'AWAITING_REVIEW' && awaitingCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{awaitingCount} طلب ينتظر مراجعتك</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setSearchParams(f.value ? { status: f.value } : {})}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              status === f.value
                ? 'bg-orbit-purple text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {fetchError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {fetchError}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl">لا توجد طلبات</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">#{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{order.profiles?.name ?? '—'} — {order.profiles?.email}</span>
                <span className="font-semibold text-orbit-purple">{order.total_amount} ر.س</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.created_at).toLocaleString('ar-SA')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
