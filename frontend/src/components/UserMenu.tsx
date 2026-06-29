import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Download,
  Heart,
  LogOut,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user) return null

  const firstName = profile?.name?.split(' ')[0] ?? 'حسابي'

  const links = [
    { to: '/orders', label: 'طلباتي', icon: ShoppingBag },
    { to: '/downloads', label: 'تنزيلاتي', icon: Download },
    { to: '/wishlist', label: 'المفضلة', icon: Heart },
    ...(profile?.role === 'admin'
      ? [{ to: '/admin/orders', label: 'لوحة الإدارة', icon: Settings }]
      : []),
  ]

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          open ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span className="max-w-[120px] truncate">{firstName}</span>
        <ChevronDown className={cn('w-4 h-4 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl border border-zinc-200 shadow-lg py-1.5 z-50 animate-scale-in"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-zinc-100 mb-1">
            <p className="text-sm font-semibold text-zinc-900 truncate">{profile?.name ?? firstName}</p>
            <p className="text-xs text-zinc-500 truncate" dir="ltr">{profile?.email ?? user.email}</p>
          </div>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <Icon className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
          <div className="border-t border-zinc-100 mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false)
                await signOut()
                navigate('/marketplace')
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
