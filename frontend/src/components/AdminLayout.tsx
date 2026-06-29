import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock,
  Gift,
  LayoutGrid,
  Package,
  Tags,
} from 'lucide-react'
import { cn } from '../lib/cn'

interface AdminLayoutProps {
  children: React.ReactNode
}

const links = [
  { to: '/admin/marketplace', label: 'المنتجات', icon: Package, match: '/admin/marketplace' },
  { to: '/admin/marketplace/categories', label: 'التصنيفات', icon: Tags, match: '/admin/marketplace/categories' },
  { to: '/admin/bundles', label: 'الحزم', icon: Gift, match: '/admin/bundles' },
  { to: '/admin/orders', label: 'الطلبات', icon: LayoutGrid, match: '/admin/orders' },
  { to: '/admin/orders?status=AWAITING_REVIEW', label: 'بانتظار المراجعة', icon: Clock, match: 'awaiting' },
  { to: '/admin/analytics', label: 'الإحصائيات', icon: BarChart3, match: '/admin/analytics' },
  { to: '/admin/bank-account', label: 'الحساب البنكي', icon: Building2, match: '/admin/bank-account' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()

  const isActive = (link: (typeof links)[0]) => {
    if (link.match === 'awaiting') return location.search === '?status=AWAITING_REVIEW'
    if (link.match === '/admin/bundles') return location.pathname.startsWith('/admin/bundles')
    if (link.match === '/admin/marketplace') {
      return location.pathname.startsWith('/admin/marketplace') && !location.pathname.includes('/categories')
    }
    if (link.match === '/admin/orders') return location.pathname === '/admin/orders' && !location.search
    return location.pathname === link.match
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-60 shrink-0">
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 sticky top-24">
          <h2 className="font-bold text-zinc-900 mb-4 text-sm px-2">لوحة الإدارة</h2>
          <nav className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActive(link)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <Link
            to="/marketplace"
            className="flex items-center gap-2 mt-4 px-3 py-2 text-xs text-zinc-400 hover:text-orbit-purple transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            العودة للمتجر
          </Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
