import { supabase } from './supabase'
import type { Order, OrderStatus, Profile } from '../types/database'
import { getDownloadUrl, fetchProtectedFileBlobUrl } from './storage'

export interface AdminOrder extends Order {
  profiles?: Pick<Profile, 'name' | 'email' | 'phone'>
}

/** orders له علاقتان مع profiles (user_id + confirmed_by) — نحدد user_id صراحة */
const ADMIN_ORDER_SELECT =
  '*, profiles!user_id(name, email, phone), order_items(*, products(id, title_ar, slug, thumbnail))'

export async function fetchAdminOrders(status?: OrderStatus): Promise<AdminOrder[]> {
  let query = supabase
    .from('orders')
    .select(ADMIN_ORDER_SELECT)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as AdminOrder[]) ?? []
}

export async function fetchAdminOrder(orderId: string): Promise<AdminOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(ADMIN_ORDER_SELECT)
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as AdminOrder
}

export async function confirmOrder(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_confirm_order', { p_order_id: orderId } as never)
  if (error) throw new Error(error.message)
  await notifyOrder(orderId, 'confirmed')
}

export async function rejectOrder(orderId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reject_order', {
    p_order_id: orderId,
    p_reason: reason,
  } as never)
  if (error) throw new Error(error.message)
  await notifyOrder(orderId, 'rejected', reason)
}

export async function getReceiptImageUrl(storageKey: string): Promise<string> {
  try {
    return await fetchProtectedFileBlobUrl(storageKey)
  } catch {
    return getDownloadUrl(storageKey)
  }
}

async function notifyOrder(orderId: string, type: string, reason?: string) {
  // عطّل الاستدعاء من المتصفح حتى تنشر Edge Function وتفعّل الإيميلات
  if (import.meta.env.VITE_ENABLE_EMAIL_NOTIFY !== 'true') return

  const { error } = await supabase.functions.invoke('notify-order', {
    body: { orderId, type, reason },
  })
  if (error) {
    console.warn('[notify-order]', error.message)
  }
}

export async function notifyReceiptUploaded(orderId: string) {
  await notifyOrder(orderId, 'receipt_uploaded')
}
