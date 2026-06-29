export interface CartItem {
  type: 'product' | 'bundle'
  id: string
  slug: string
  titleAr: string
  thumbnail: string
  price: number
}

const STORAGE_KEY = 'madar_cart'

function normalizeItem(raw: Record<string, unknown>): CartItem {
  return {
    type: (raw.type as CartItem['type']) ?? 'product',
    id: (raw.id as string) ?? (raw.productId as string),
    slug: raw.slug as string,
    titleAr: (raw.titleAr as string) ?? (raw.title_ar as string),
    thumbnail: raw.thumbnail as string,
    price: raw.price as number,
  }
}

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    return parsed.map(normalizeItem)
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

export function cartItemKey(item: CartItem): string {
  return `${item.type}-${item.id}`
}
