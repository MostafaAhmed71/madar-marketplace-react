import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ClipboardList, ShoppingBag } from 'lucide-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Button } from '../components/ui/Button'
import { fetchUserOrders } from '../lib/orders'
import type { Order } from '../types/database'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-8">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 mb-8">لا توجد طلبات بعد</p>
          <Button to="/marketplace" variant="primary" icon={<ShoppingBag className="w-4 h-4" />}>
            تصفح المتجر
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-zinc-900">#{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between items-center text-sm text-zinc-500">
                <span>{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900">{order.total_amount} ر.س</span>
                  <ChevronLeft className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
