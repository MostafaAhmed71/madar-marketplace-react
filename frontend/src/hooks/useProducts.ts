import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MarketCategory, Product } from '../types/database'

export function useCategories() {
  const [categories, setCategories] = useState<MarketCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('market_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setCategories((data as MarketCategory[]) ?? [])
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}

export function useCategory(slug: string) {
  const [category, setCategory] = useState<MarketCategory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('market_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        setCategory(data as MarketCategory | null)
        setLoading(false)
      })
  }, [slug])

  return { category, loading }
}

export function useProducts(categorySlug?: string, search?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    let query = supabase
      .from('products')
      .select('*, market_categories(*)')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title_ar', `%${search}%`)
    }

    query.then(async ({ data, error }) => {
      if (error) {
        setProducts([])
        setLoading(false)
        return
      }

      let result = (data as Product[]) ?? []

      if (categorySlug) {
        result = result.filter((p) => p.market_categories?.slug === categorySlug)
      }

      setProducts(result)
      setLoading(false)
    })
  }, [categorySlug, search])

  return { products, loading }
}

export function useProductsByCategoryId(categoryId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryId) return

    supabase
      .from('products')
      .select('*, market_categories(*)')
      .eq('status', 'PUBLISHED')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      })
  }, [categoryId])

  return { products, loading }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return

    supabase
      .from('products')
      .select('*, market_categories(*)')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(true)
          setLoading(false)
          return
        }
        setProduct(data as Product)
        setLoading(false)
        supabase.rpc('increment_product_views', { product_slug: slug } as never)
      })
  }, [slug])

  return { product, loading, error }
}

export function getDisplayPrice(product: Product): number {
  return product.discount_price ?? product.price
}

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  EDITABLE: 'قابل للتعديل',
  READY: 'جاهز للاستخدام',
  HYBRID: 'مختلط',
}
