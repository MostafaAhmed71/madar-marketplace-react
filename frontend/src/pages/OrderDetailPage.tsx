import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { cancelOrder, fetchOrder } from '../lib/orders'
import type { Order } from '../types/database'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder(id).then((data) => {
      setOrder(data)
      setLoading(false)
    })
  }, [id])

  const handleCancel = async () => {
    if (!order || !confirm('هل تريد إلغاء هذا الطلب؟')) return
    await cancelOrder(order.id)
    setOrder({ ...order, status: 'CANCELLED' })
  }

  if (loading) return <LoadingSpinner />
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">الطلب غير موجود</p>
        <Link to="/orders" className="text-orbit-purple hover:underline mt-4 inline-block">العودة</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/orders" className="text-sm text-gray-400 hover:text-orbit-purple mb-4 inline-block">
        ← طلباتي
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orbit-purple">#{order.order_number}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
        <h2 className="font-bold">المنتجات</h2>
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
            {item.products?.thumbnail && (
              <img src={item.products.thumbnail} alt="" className="w-12 h-10 object-cover rounded" />
            )}
            <span className="flex-1 text-sm">{item.products?.title_ar ?? 'منتج'}</span>
            <span className="text-sm font-semibold">{item.price} ر.س</span>
          </div>
        ))}

        <div className="pt-2 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي</span><span>{order.subtotal} ر.س</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-growth-green">
              <span>الخصم {order.coupon_code && `(${order.coupon_code})`}</span>
              <span>- {order.discount} ر.س</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-orbit-purple">{order.total_amount} ر.س</span>
          </div>
        </div>
      </div>

      {order.transfer_amount && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-sm space-y-2">
          <h2 className="font-bold mb-2">بيانات التحويل</h2>
          <div className="flex justify-between"><span className="text-gray-500">المبلغ</span><span>{order.transfer_amount} ر.س</span></div>
          <div className="flex justify-between"><span className="text-gray-500">التاريخ</span><span>{order.transfer_date}</span></div>
          {order.transfer_note && (
            <div className="flex justify-between"><span className="text-gray-500">ملاحظة</span><span>{order.transfer_note}</span></div>
          )}
        </div>
      )}

      {order.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          <strong>سبب الرفض:</strong> {order.rejection_reason}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {order.status === 'PENDING' && (
          <>
            <Link
              to={`/checkout/upload-receipt/${order.id}`}
              className="text-center bg-solar-gold text-space-black py-3 rounded-xl font-semibold"
            >
              رفع الإيصال
            </Link>
            <button
              type="button"
              onClick={handleCancel}
              className="text-center text-red-500 text-sm hover:underline"
            >
              إلغاء الطلب
            </button>
          </>
        )}
        {order.status === 'PAID' && (
          <Link
            to={`/downloads/${order.id}`}
            className="text-center bg-growth-green text-white py-3 rounded-xl font-semibold"
          >
            تحميل الملفات
          </Link>
        )}
        {(order.status === 'AWAITING_REVIEW' || order.status === 'PAID') && (
          <Link
            to={`/checkout/success/${order.id}`}
            className="text-center border border-orbit-purple text-orbit-purple py-3 rounded-xl font-semibold"
          >
            حالة الطلب
          </Link>
        )}
      </div>
    </div>
  )
}
