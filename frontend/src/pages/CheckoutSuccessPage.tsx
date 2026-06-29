import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { fetchOrder } from '../lib/orders'
import type { Order } from '../types/database'

export function CheckoutSuccessPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder(orderId).then((data) => {
      setOrder(data)
      setLoading(false)
    })
  }, [orderId])

  if (loading) return <LoadingSpinner />
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">الطلب غير موجود</p>
        <Link to="/orders" className="text-orbit-purple hover:underline mt-4 inline-block">
          سجل الطلبات
        </Link>
      </div>
    )
  }

  const isPaid = order.status === 'PAID'
  const isRejected = order.status === 'REJECTED'
  const isAwaiting = order.status === 'AWAITING_REVIEW'

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="text-6xl mb-4">
        {isPaid ? '✅' : isRejected ? '❌' : '⏳'}
      </div>

      <h1 className="text-2xl font-bold text-orbit-purple mb-2">
        {isPaid
          ? 'تم تأكيد طلبك!'
          : isRejected
            ? 'تم رفض الطلب'
            : isAwaiting
              ? 'تم استلام إيصالك'
              : 'طلبك قيد المعالجة'}
      </h1>

      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-gray-500">#{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="text-gray-600 mb-8">
        {isPaid
          ? 'يمكنك الآن تحميل منتجاتك من صفحة التنزيلات.'
          : isRejected
            ? `السبب: ${order.rejection_reason ?? 'غير محدد'}`
            : isAwaiting
              ? 'سيتم مراجعة إيصال التحويل خلال 24 ساعة. ستصلك رسالة عند التأكيد.'
              : 'أكمل رفع الإيصال لإتمام الطلب.'}
      </p>

      <div className="flex flex-col gap-3">
        {order.status === 'PENDING' && (
          <Link
            to={`/checkout/upload-receipt/${order.id}`}
            className="bg-solar-gold text-space-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors"
          >
            رفع الإيصال
          </Link>
        )}
        {isPaid && (
          <Link
            to={`/downloads/${order.id}`}
            className="bg-growth-green text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-colors"
          >
            تحميل الملفات
          </Link>
        )}
        <Link
          to={`/orders/${order.id}`}
          className="border border-orbit-purple text-orbit-purple py-3 rounded-xl font-semibold hover:bg-orbit-purple hover:text-white transition-colors"
        >
          تفاصيل الطلب
        </Link>
        <Link to="/marketplace" className="text-sm text-gray-400 hover:text-orbit-purple">
          متابعة التسوق
        </Link>
      </div>
    </div>
  )
}
