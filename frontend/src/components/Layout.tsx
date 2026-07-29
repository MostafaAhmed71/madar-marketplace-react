import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen, Download, Heart, Menu, Package,
  Settings, ShoppingBag, X, Search, Shield, Star, User, Home
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { UserMenu } from './UserMenu'

interface LayoutProps { children: React.ReactNode }

const mainNav = [
  { to: '/marketplace', label: 'الرئيسية' },
  { to: '/marketplace', label: 'المصادر' },
  { to: '/marketplace/bundles', label: 'العروض' },
]

const trustBadges = [
  { icon: Shield, label: 'مراجعة يدوية 24/7',      sub: 'نضمن جودة كل ملف خلال 24 ساعة' },
  { icon: BookOpen, label: 'تحويل بنكي آمن',         sub: 'عمليات دفع موثقة وتدقيق يدوي' },
  { icon: Star, label: 'جودة تعليمية عالية',         sub: 'مصادر مصممة من قبل خبراء الميدان' },
]

export function Layout({ children }: LayoutProps) {
  const { count } = useCart()
  const { user, profile, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  useEffect(() => { setSearchQuery(urlQuery) }, [urlQuery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`)
    else navigate('/marketplace')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fb' }}>

      {/* ======= HEADER ======= */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'shadow-md' : 'shadow-sm'
        )}
        style={{ background: '#f8f9fb', borderBottom: '1px solid #e7e8ea' }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* الشعار */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ background: '#39396d' }}
              >
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: '#39396d', fontFamily: 'IBM Plex Sans Arabic' }}
              >
                متجر مدار
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {mainNav.map(({ to, label }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={label}
                    to={to}
                    className={cn(
                      'text-sm font-medium pb-0.5 border-b-2 transition-all duration-200',
                      active
                        ? 'border-[#39396d] text-[#39396d]'
                        : 'border-transparent text-[#47464f] hover:text-[#39396d]'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* بحث */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
              <input
                type="text"
                placeholder="ابحث عن موارد تعليمية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pr-10 pl-12 text-sm bg-white border border-[#c8c5d0] rounded-full outline-none transition-all focus:border-[#39396d] focus:ring-2 focus:ring-[#39396d]/10"
                style={{ fontFamily: 'IBM Plex Sans Arabic' }}
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777680] pointer-events-none" />
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 px-3 flex items-center justify-center rounded-full text-white text-xs font-bold transition-all hover:opacity-90"
                style={{ background: '#39396d' }}
              >
                بحث
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!loading && user && (
                <>
                  <Link
                    to="/wishlist"
                    className="flex w-9 h-9 items-center justify-center rounded-full text-[#47464f] hover:text-[#EF4444] hover:bg-[#f3f4f6] transition-all"
                    title="المفضلة"
                  >
                    <Heart className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin/orders"
                      className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-[#47464f] hover:text-[#39396d] hover:bg-[#f3f4f6] transition-all"
                      title="لوحة الإدارة"
                    >
                      <Settings className="w-5 h-5" strokeWidth={1.75} />
                    </Link>
                  )}
                </>
              )}

              {/* السلة */}
              <Link
                to="/cart"
                className="relative hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-[#47464f] hover:text-[#39396d] hover:bg-[#f3f4f6] transition-all"
                title="السلة"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-white text-[10px] font-extrabold rounded-full"
                    style={{ background: '#39396d' }}
                  >
                    {count}
                  </span>
                )}
              </Link>

              {!loading && user && <UserMenu />}
              {!loading && !user && (
                <Button
                  to="/login"
                  variant="primary"
                  size="sm"
                  className="hidden sm:inline-flex mr-1 rounded-full font-bold text-sm"
                >
                  تسجيل الدخول
                </Button>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-[#47464f] hover:bg-[#f3f4f6] transition-all"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الموبايل المنسدلة */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 animate-slide-down"
            style={{ background: '#f8f9fb', borderColor: '#e7e8ea' }}
          >
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="ابحث في المتجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10 text-sm"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777680] pointer-events-none" />
            </form>
            <nav className="flex flex-col gap-1">
              {mainNav.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#47464f] hover:bg-[#edeef0] hover:text-[#39396d] font-medium transition-all"
                >
                  {label}
                </Link>
              ))}
              {!user && (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-2 block">
                  <button
                    className="w-full h-11 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{ background: '#39396d' }}
                  >
                    تسجيل الدخول
                  </button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ======= MAIN CONTENT ======= */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fade-in pb-24 md:pb-10">
        {children}
      </main>

      {/* ======= TRUST BAR ======= */}
      <div style={{ background: '#39396d' }} className="py-8 pb-20 md:pb-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          {trustBadges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <Icon className="w-8 h-8 shrink-0" style={{ color: '#f9b500' }} strokeWidth={1.5} />
              <div>
                <h3 className="font-semibold text-white text-base">{label}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======= FOOTER ======= */}
      <footer style={{ background: '#1F2937', color: '#d9dadc' }} className="pb-16 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-bold" style={{ color: '#f9b500', fontFamily: 'IBM Plex Sans Arabic' }}>
              مدار التعليمية
            </span>
            <p className="text-sm text-center opacity-70">بوابتك لمستقبل تعليمي رقمي متطور وآمن.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            {['سياسة الخصوصية', 'شروط الاستخدام', 'طرق الدفع', 'الأسئلة الشائعة'].map((t) => (
              <a key={t} href="#" className="footer-link text-sm">{t}</a>
            ))}
          </nav>
          <p className="text-xs opacity-40 mt-2">
            © {new Date().getFullYear()} متجر مدار التعليمي. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>

      {/* ======= MOBILE BOTTOM NAV BAR (شريط التنقل السفلي للهواتف) ======= */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#edeef0] z-50 flex items-center justify-around md:hidden px-2 shadow-2xl"
      >
        <Link
          to="/marketplace"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5",
            location.pathname === '/marketplace' ? "text-[#39396d]" : "text-[#777680]"
          )}
        >
          <Home className="w-5 h-5" strokeWidth={location.pathname === '/marketplace' ? 2.5 : 2} />
          <span>الرئيسية</span>
        </Link>

        <Link
          to="/marketplace/bundles"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5",
            location.pathname === '/marketplace/bundles' ? "text-[#39396d]" : "text-[#777680]"
          )}
        >
          <Package className="w-5 h-5" strokeWidth={location.pathname === '/marketplace/bundles' ? 2.5 : 2} />
          <span>العروض</span>
        </Link>

        <Link
          to="/cart"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5 relative",
            location.pathname === '/cart' ? "text-[#39396d]" : "text-[#777680]"
          )}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={location.pathname === '/cart' ? 2.5 : 2} />
          <span>السلة</span>
          {count > 0 && (
            <span
              className="absolute top-1.5 right-1/2 translate-x-3 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-white text-[9px] font-black rounded-full"
              style={{ background: '#f9b500', color: '#684a00' }}
            >
              {count}
            </span>
          )}
        </Link>

        <Link
          to="/wishlist"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5",
            location.pathname === '/wishlist' ? "text-[#39396d]" : "text-[#777680]"
          )}
        >
          <Heart className="w-5 h-5" strokeWidth={location.pathname === '/wishlist' ? 2.5 : 2} />
          <span>المفضلة</span>
        </Link>

        {user ? (
          <Link
            to="/downloads"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5",
              location.pathname === '/downloads' ? "text-[#39396d]" : "text-[#777680]"
            )}
          >
            <Download className="w-5 h-5" strokeWidth={location.pathname === '/downloads' ? 2.5 : 2} />
            <span>تنزيلاتي</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-xs font-semibold gap-0.5",
              location.pathname === '/login' ? "text-[#39396d]" : "text-[#777680]"
            )}
          >
            <User className="w-5 h-5" strokeWidth={location.pathname === '/login' ? 2.5 : 2} />
            <span>حسابي</span>
          </Link>
        )}
      </nav>

    </div>
  )
}
