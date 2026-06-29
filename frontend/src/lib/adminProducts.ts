import { supabase } from './supabase'
import { uploadFile } from './storage'
import type { MarketCategory, Product, ProductStatus } from '../types/database'
import type { ProductFile } from './downloads'

export interface ProductFormData {
  title_ar: string
  slug: string
  description: string
  detailed_desc: string
  category_id: string
  price: number
  discount_price: number | null
  thumbnail: string
  preview_images: string[]
  video_url: string
  file_types: string[]
  product_type: string
  status: ProductStatus
}

export async function fetchAdminProducts(status?: ProductStatus): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, market_categories(name_ar)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data } = await query
  return (data as Product[]) ?? []
}

export async function fetchAdminProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, market_categories(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Product
}

export async function fetchProductFiles(productId: string): Promise<ProductFile[]> {
  const { data } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  return (data as ProductFile[]) ?? []
}

export async function createProduct(form: ProductFormData): Promise<string> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      title_ar: form.title_ar,
      slug: form.slug,
      description: form.description,
      detailed_desc: form.detailed_desc || null,
      category_id: form.category_id,
      price: form.price,
      discount_price: form.discount_price,
      thumbnail: form.thumbnail,
      preview_images: form.preview_images,
      video_url: form.video_url || null,
      file_types: form.file_types,
      product_type: form.product_type,
      status: form.status,
    } as never)
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

export async function updateProduct(id: string, form: ProductFormData): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      title_ar: form.title_ar,
      slug: form.slug,
      description: form.description,
      detailed_desc: form.detailed_desc || null,
      category_id: form.category_id,
      price: form.price,
      discount_price: form.discount_price,
      thumbnail: form.thumbnail,
      preview_images: form.preview_images,
      video_url: form.video_url || null,
      file_types: form.file_types,
      product_type: form.product_type,
      status: form.status,
    } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadThumbnail(file: File): Promise<string> {
  const { url, key } = await uploadFile(file, 'previews')
  return url ?? key
}

export async function uploadPreviewImage(file: File): Promise<string> {
  const { url, key } = await uploadFile(file, 'previews')
  return url ?? key
}

export async function addProductFile(
  productId: string,
  file: File,
  fileType: string
): Promise<void> {
  const { key } = await uploadFile(file, 'products', productId)
  const ext = file.name.split('.').pop()?.toUpperCase() ?? fileType

  const { error } = await supabase.from('product_files').insert({
    product_id: productId,
    file_name: file.name,
    file_type: fileType || ext,
    storage_key: key,
    file_size: Math.round(file.size / 1024),
  } as never)

  if (error) throw new Error(error.message)
}

export async function removeProductFile(fileId: string): Promise<void> {
  const { error } = await supabase.from('product_files').delete().eq('id', fileId)
  if (error) throw new Error(error.message)
}

// ── التصنيفات ────────────────────────────────────────────

export async function fetchAllCategories(): Promise<MarketCategory[]> {
  const { data } = await supabase
    .from('market_categories')
    .select('*')
    .order('sort_order')

  return (data as MarketCategory[]) ?? []
}

export async function saveCategory(
  cat: Partial<MarketCategory> & { name_ar: string; slug: string }
): Promise<void> {
  if (cat.id) {
    const { error } = await supabase
      .from('market_categories')
      .update({
        name_ar: cat.name_ar,
        slug: cat.slug,
        icon: cat.icon,
        sort_order: cat.sort_order ?? 0,
        is_active: cat.is_active ?? true,
      } as never)
      .eq('id', cat.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('market_categories').insert({
      name_ar: cat.name_ar,
      slug: cat.slug,
      icon: cat.icon ?? null,
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active ?? true,
    } as never)
    if (error) throw new Error(error.message)
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('market_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
