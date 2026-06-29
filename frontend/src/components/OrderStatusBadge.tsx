import type { OrderStatus } from '../types/database'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../types/database'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
