import { supabase } from './supabase'
import { getDownloadUrl } from './storage'

export interface ProductFile {
  id: string
  product_id: string
  file_name: string
  file_type: string
  storage_key: string
  file_size: number | null
  sort_order: number
}

export interface DownloadableProduct {
  productId: string
  titleAr: string
  slug: string
  thumbnail: string
  orderId: string
  orderNumber: string
  files: ProductFile[]
}

export async function fetchPaidOrders() {
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, created_at, order_items(product_id, products(id, title_ar, slug, thumbnail))')
    .eq('status', 'PAID')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function fetchDownloadableFiles(orderId: string): Promise<DownloadableProduct[]> {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, status,
      order_items(
        product_id, bundle_id,
        products(id, title_ar, slug, thumbnail),
        bundles(bundle_items(product_id, products(id, title_ar, slug, thumbnail)))
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) return []

  const o = order as {
    id: string
    order_number: string
    status: string
    order_items: Array<{
      product_id: string | null
      bundle_id: string | null
      products: { id: string; title_ar: string; slug: string; thumbnail: string } | null
      bundles: {
        bundle_items: Array<{
          product_id: string
          products: { id: string; title_ar: string; slug: string; thumbnail: string }
        }>
      } | null
    }>
  }

  if (o.status !== 'PAID') return []

  const result: DownloadableProduct[] = []
  const seen = new Set<string>()

  const addProduct = async (product: { id: string; title_ar: string; slug: string; thumbnail: string }) => {
    if (seen.has(product.id)) return
    seen.add(product.id)

    let productFiles: ProductFile[] = []

    const { data: rpcFiles, error } = await supabase.rpc('get_purchased_product_files', {
      p_product_id: product.id,
    } as never)

    if (!error && rpcFiles) {
      productFiles = rpcFiles as ProductFile[]
    } else {
      const { data: tableFiles } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order')
      productFiles = (tableFiles as ProductFile[]) ?? []
    }

    result.push({
      productId: product.id,
      titleAr: product.title_ar,
      slug: product.slug,
      thumbnail: product.thumbnail,
      orderId: o.id,
      orderNumber: o.order_number,
      files: productFiles,
    })
  }

  for (const item of o.order_items) {
    if (item.products) {
      await addProduct(item.products)
    }
    if (item.bundles?.bundle_items) {
      for (const bi of item.bundles.bundle_items) {
        if (bi.products) await addProduct(bi.products)
      }
    }
  }

  return result
}

export async function fetchAllDownloads(): Promise<DownloadableProduct[]> {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, order_items(product_id, products(id, title_ar, slug, thumbnail))')
    .eq('status', 'PAID')
    .order('created_at', { ascending: false })

  const all: DownloadableProduct[] = []

  for (const order of (orders ?? []) as { id: string }[]) {
    const items = await fetchDownloadableFiles(order.id)
    all.push(...items)
  }

  return all
}

export async function downloadFile(file: ProductFile): Promise<void> {
  const url = await getDownloadUrl(file.storage_key)
  window.open(url, '_blank')
}
