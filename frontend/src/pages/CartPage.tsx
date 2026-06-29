import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { cartItemKey } from '../lib/cart'
import { useCart } from '../context/CartContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function CartPage() {
  const { items, total, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">سلة الشراء فارغة</h1>
        <p className="text-zinc-500 mb-8">أضف موارد تعليمية من المتجر للبدء</p>
        <Button to="/marketplace" variant="primary" size="lg" icon={<ShoppingBag className="w-4 h-4" />}>
          تصفح المتجر
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-8">سلة الشراء</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={cartItemKey(item)}
              className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4"
            >
              <img src={item.thumbnail} alt={item.titleAr} className="w-20 h-16 object-cover rounded-lg bg-zinc-100" />
              <div className="flex-1 min-w-0">
                <Link
                  to={item.type === 'bundle' ? `/marketplace/bundles/${item.slug}` : `/marketplace/${item.slug}`}
                  className="font-semibold text-zinc-900 hover:text-orbit-purple line-clamp-2"
                >
                  {item.type === 'bundle' && (
                    <Badge variant="accent" className="ml-2 align-middle text-[10px] py-0">حزمة</Badge>
                  )}
                  {item.titleAr}
                </Link>
                <p className="text-zinc-900 font-bold mt-1">{item.price} <span className="text-sm font-normal text-zinc-500">ر.س</span></p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(cartItemKey(item))}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <Button variant="ghost" size="sm" onClick={clearCart} className="text-zinc-500">
            إفراغ السلة
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg text-zinc-900 mb-4">ملخص الطلب</h2>
          <div className="flex justify-between mb-2 text-zinc-600 text-sm">
            <span>المجموع ({items.length} عنصر)</span>
            <span>{total.toFixed(2)} ر.س</span>
          </div>
          <hr className="my-4 border-zinc-200" />
          <div className="flex justify-between font-bold text-lg mb-6 text-zinc-900">
            <span>الإجمالي</span>
            <span>{total.toFixed(2)} ر.س</span>
          </div>
          <Button to="/checkout" variant="accent" size="lg" fullWidth>
            إتمام الشراء
          </Button>
        </div>
      </div>
    </div>
  )
}
