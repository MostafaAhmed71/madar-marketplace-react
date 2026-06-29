import { supabase } from './supabase'
import { notifyReceiptUploaded } from './admin'
import type { BankAccount, CouponPreview, Order } from '../types/database'
import type { CartItem } from './cart'
import { uploadFile } from './storage'

export async function fetchActiveBankAccount(): Promise<BankAccount | null> {
  const { data } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  return data as BankAccount | null
}

export async function previewCoupon(code: string, subtotal: number): Promise<CouponPreview> {
  const { data, error } = await supabase.rpc('preview_coupon', {
    p_code: code,
    p_subtotal: subtotal,
  } as never)

  if (error) return { valid: false, message: 'خطأ في التحقق من الكود' }
  return data as CouponPreview
}

export async function createOrder(
  items: CartItem[],
  couponCode?: string
): Promise<{ id: string; order_number: string; total_amount: number }> {
  const payload = items.map((item) => ({
    product_id: item.type === 'product' ? item.id : null,
    bundle_id: item.type === 'bundle' ? item.id : null,
    price: item.price,
  }))

  const { data, error } = await supabase.rpc('create_marketplace_order', {
    p_items: payload,
    p_coupon_code: couponCode || null,
  } as never)

  if (error) throw new Error(error.message)

  const result = data as { id?: string; order_number?: string; total_amount?: number }
  if (!result?.id) throw new Error('فشل إنشاء الطلب — لم يُرجع معرف الطلب')
  return result as { id: string; order_number: string; total_amount: number }
}

export async function uploadReceipt(
  orderId: string,
  file: File,
  transferAmount: number,
  transferDate: string,
  note?: string
): Promise<void> {
  const { key } = await uploadFile(file, 'receipts', orderId)

  const { error } = await supabase.rpc('submit_order_receipt', {
    p_order_id: orderId,
    p_storage_key: key,
    p_transfer_amount: transferAmount,
    p_transfer_date: transferDate,
    p_note: note || null,
  } as never)

  if (!error) {
    await notifyReceiptUploaded(orderId)
    return
  }

  // fallback للمشاريع التي لم تشغّل migration 008 بعد
  const { data: row, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'AWAITING_REVIEW',
      receipt_storage_key: key,
      receipt_uploaded_at: new Date().toISOString(),
      transfer_amount: transferAmount,
      transfer_date: transferDate,
      transfer_note: note || null,
    } as never)
    .eq('id', orderId)
    .eq('status', 'PENDING')
    .select('id')
    .maybeSingle()

  if (updateError) throw new Error(updateError.message)
  if (!row) throw new Error('لم يتم تحديث الطلب — تأكد أن الطلب في حالة انتظار الإيصال')
  await notifyReceiptUploaded(orderId)
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, title_ar, slug, thumbnail))')
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as Order
}

export async function fetchUserOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, title_ar, slug, thumbnail))')
    .order('created_at', { ascending: false })

  return (data as Order[]) ?? []
}

export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'CANCELLED' } as never)
    .eq('id', orderId)
    .eq('status', 'PENDING')

  if (error) throw new Error(error.message)
}
