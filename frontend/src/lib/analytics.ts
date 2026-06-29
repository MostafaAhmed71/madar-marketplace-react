import { fetchAdminOrders } from './admin'
import { supabase } from './supabase'

export interface Analytics {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  awaitingReview: number
  totalProducts: number
  publishedProducts: number
  totalSales: number
  topProducts: { title_ar: string; total_sales: number; total_views: number }[]
  recentOrders: { order_number: string; total_amount: number; status: string; created_at: string }[]
}

export async function fetchAnalytics(): Promise<Analytics> {
  const [orders, products] = await Promise.all([
    fetchAdminOrders(),
    supabase.from('products').select('title_ar, total_sales, total_views, status'),
  ])

  const allOrders = orders
  const paid = allOrders.filter((o) => o.status === 'PAID')
  const prods = (products.data ?? []) as { title_ar: string; total_sales: number; total_views: number; status: string }[]

  return {
    totalRevenue: paid.reduce((s, o) => s + Number(o.total_amount), 0),
    totalOrders: allOrders.length,
    paidOrders: paid.length,
    awaitingReview: allOrders.filter((o) => o.status === 'AWAITING_REVIEW').length,
    totalProducts: prods.length,
    publishedProducts: prods.filter((p) => p.status === 'PUBLISHED').length,
    totalSales: prods.reduce((s, p) => s + p.total_sales, 0),
    topProducts: [...prods].sort((a, b) => b.total_sales - a.total_sales).slice(0, 5),
    recentOrders: allOrders.slice(0, 5).map((o) => ({
      order_number: o.order_number,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.created_at,
    })),
  }
}
