import { supabase } from './supabase'
import type { Product, ProductStatus } from '../types/database'

export interface Bundle {
  id: string
  title_ar: string
  slug: string
  description: string
  price: number
  discount_price: number | null
  thumbnail: string | null
  status: ProductStatus
  created_at: string
  bundle_items?: BundleItem[]
}

export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  products?: Product
}

export function getBundlePrice(bundle: Bundle): number {
  return bundle.discount_price ?? bundle.price
}

export async function fetchBundles(): Promise<Bundle[]> {
  const { data } = await supabase
    .from('bundles')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })

  return (data as Bundle[]) ?? []
}

export async function fetchBundle(slug: string): Promise<Bundle | null> {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, products(*))')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .single()

  if (error) return null
  return data as Bundle
}

export async function fetchAdminBundles(): Promise<Bundle[]> {
  const { data } = await supabase
    .from('bundles')
    .select('*, bundle_items(id)')
    .order('created_at', { ascending: false })

  return (data as Bundle[]) ?? []
}

export async function fetchAdminBundle(id: string): Promise<Bundle | null> {
  const { data } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, products(id, title_ar, thumbnail, price))')
    .eq('id', id)
    .single()

  return data as Bundle | null
}

export async function saveBundle(
  bundle: Partial<Bundle> & { title_ar: string; slug: string; description: string; price: number },
  productIds: string[]
): Promise<string> {
  let bundleId = bundle.id

  if (bundleId) {
    const { error } = await supabase.from('bundles').update({
      title_ar: bundle.title_ar,
      slug: bundle.slug,
      description: bundle.description,
      price: bundle.price,
      discount_price: bundle.discount_price,
      thumbnail: bundle.thumbnail,
      status: bundle.status ?? 'DRAFT',
    } as never).eq('id', bundleId)
    if (error) throw new Error(error.message)

    await supabase.from('bundle_items').delete().eq('bundle_id', bundleId)
  } else {
    const { data, error } = await supabase.from('bundles').insert({
      title_ar: bundle.title_ar,
      slug: bundle.slug,
      description: bundle.description,
      price: bundle.price,
      discount_price: bundle.discount_price,
      thumbnail: bundle.thumbnail,
      status: bundle.status ?? 'DRAFT',
    } as never).select('id').single()
    if (error) throw new Error(error.message)
    bundleId = (data as { id: string }).id
  }

  if (productIds.length > 0) {
    const { error } = await supabase.from('bundle_items').insert(
      productIds.map((pid) => ({ bundle_id: bundleId, product_id: pid })) as never
    )
    if (error) throw new Error(error.message)
  }

  return bundleId!
}

export async function deleteBundle(id: string): Promise<void> {
  const { error } = await supabase.from('bundles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
