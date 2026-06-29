import { supabase } from './supabase'
import type { Product } from '../types/database'

export async function fetchWishlist(): Promise<Product[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('wishlist')
    .select('product_id, products(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data?.map((w) => (w as { products: Product }).products).filter(Boolean) ?? [])
}

export async function fetchWishlistIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', user.id)

  return new Set((data ?? []).map((w) => (w as { product_id: string }).product_id))
}

export async function toggleWishlist(productId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('LOGIN_REQUIRED')

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', (existing as { id: string }).id)
    return false
  }

  const { error } = await supabase.from('wishlist').insert({
    user_id: user.id,
    product_id: productId,
  } as never)

  if (error) throw new Error(error.message)
  return true
}
