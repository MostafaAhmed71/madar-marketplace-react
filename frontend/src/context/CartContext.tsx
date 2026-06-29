import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Product } from '../types/database'
import type { Bundle } from '../lib/bundles'
import { getBundlePrice } from '../lib/bundles'
import { getDisplayPrice } from '../hooks/useProducts'
import { type CartItem, cartItemKey, getCartTotal, loadCart, saveCart } from '../lib/cart'

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addProduct: (product: Product) => void
  addBundle: (bundle: Bundle) => void
  removeItem: (key: string) => void
  clearCart: () => void
  isInCart: (type: 'product' | 'bundle', id: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addProduct = useCallback((product: Product) => {
    setItems((prev) => {
      const key = `product-${product.id}`
      if (prev.some((i) => cartItemKey(i) === key)) return prev
      return [
        ...prev,
        {
          type: 'product',
          id: product.id,
          slug: product.slug,
          titleAr: product.title_ar,
          thumbnail: product.thumbnail,
          price: getDisplayPrice(product),
        },
      ]
    })
  }, [])

  const addBundle = useCallback((bundle: Bundle) => {
    setItems((prev) => {
      const key = `bundle-${bundle.id}`
      if (prev.some((i) => cartItemKey(i) === key)) return prev
      return [
        ...prev,
        {
          type: 'bundle',
          id: bundle.id,
          slug: bundle.slug,
          titleAr: bundle.title_ar,
          thumbnail: bundle.thumbnail ?? 'https://placehold.co/400x300/505086/FFBA00?text=حزمة',
          price: getBundlePrice(bundle),
        },
      ]
    })
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = useCallback(
    (type: 'product' | 'bundle', id: string) =>
      items.some((i) => i.type === type && i.id === id),
    [items]
  )

  return (
    <CartContext.Provider
      value={{ items, count: items.length, total: getCartTotal(items), addProduct, addBundle, removeItem, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
