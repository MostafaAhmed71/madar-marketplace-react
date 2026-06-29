import { supabase } from './supabase'

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: { name: string }
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  return (data as Review[]) ?? []
}

export async function canReview(productId: string): Promise<boolean> {
  const { data } = await supabase.rpc('user_has_purchased_product', {
    p_product_id: productId,
  } as never)
  return Boolean(data)
}

export async function submitReview(
  productId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('يجب تسجيل الدخول')

  const { error } = await supabase.from('reviews').upsert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment: comment || null,
  } as never, { onConflict: 'user_id,product_id' })

  if (error) throw new Error(error.message)
}
