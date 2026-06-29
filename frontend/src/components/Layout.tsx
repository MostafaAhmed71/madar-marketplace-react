import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Download,
  Heart,
  LayoutGrid,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { UserMenu } from './UserMenu'

interface LayoutProps {
  children: React.ReactNode
}

const mainNav = [
  { to: '/marketplace', label: 'المنتجات', icon: LayoutGrid },
  { to: '/marketplace/bundles', label: 'الحزم', icon: Package },
]

export function Layout({ children }: LayoutProps) {
  const { count } = useCart()
  const { user, profile, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg bg-orbit-purple flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="leading-tight">
                <span className="block text-base font-bold text-zinc-900">مدار</span>
                <span className="block text-[10px] text-zinc-500 font-medium tracking-wide">المتجر التعليمي</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNav.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(to)
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!loading && user && (
                <>
                  <Link
                    to="/wishlist"
                    className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                    title="المفضلة"
                  >
                    <Heart className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin/orders"
                      className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-orbit-purple transition-colors"
                      title="لوحة الإدارة"
                    >
                      <Settings className="w-5 h-5" strokeWidth={1.75} />
                    </Link>
                  )}
                </>
              )}

              <Link
                to="/cart"
                className="relative flex w-10 h-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                title="السلة"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                {count > 0 && (
                  <span className="absolute top-1 left-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-orbit-purple text-white text-[10px] font-bold rounded-full">
                    {count}
                  </span>
                )}
              </Link>

              {!loading && user && <UserMenu />}

              {!loading && !user && (
                <Button to="/login" variant="primary" size="sm" className="hidden sm:inline-flex mr-1">
                  تسجيل الدخول
                </Button>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4 animate-slide-down">
            <nav className="flex flex-col gap-1">
              {mainNav.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-50 font-medium"
                >
                  <Icon className="w-5 h-5 text-zinc-400" strokeWidth={1.75} />
                  {label}
                </Link>
              ))}
              {user && (
                <>
                  {[
                    { to: '/orders', label: 'طلباتي', icon: ShoppingBag },
                    { to: '/downloads', label: 'تنزيلاتي', icon: Download },
                    { to: '/wishlist', label: 'المفضلة', icon: Heart },
                    ...(profile?.role === 'admin'
                      ? [{ to: '/admin/orders', label: 'لوحة الإدارة', icon: Settings }]
                      : []),
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-50 font-medium"
                    >
                      <Icon className="w-5 h-5 text-zinc-400" strokeWidth={1.75} />
                      {label}
                    </Link>
                  ))}
                </>
              )}
              {!user && (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-3 block">
                  <Button variant="primary" fullWidth>تسجيل الدخول</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
        {children}
      </main>

      <footer className="bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orbit-purple flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <span className="font-bold text-zinc-900">مدار التعليمية</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              منصة موارد تعليمية رقمية — خطط دروس، أوراق عمل، وعروض جاهزة للتحميل الفوري.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">المتجر</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/marketplace" className="text-zinc-600 hover:text-zinc-900 transition-colors">جميع المنتجات</Link>
              <Link to="/marketplace/bundles" className="text-zinc-600 hover:text-zinc-900 transition-colors">الحزم</Link>
              <Link to="/cart" className="text-zinc-600 hover:text-zinc-900 transition-colors">سلة الشراء</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">الدعم</p>
            <div className="flex flex-col gap-2.5 text-sm text-zinc-600">
              <span>دفع آمن — تحويل بنكي</span>
              <span>مراجعة خلال 24 ساعة</span>
              <span>تحميل فوري بعد التأكيد</span>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-100 py-5 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} مدار التعليمية. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}
