import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-[#39396d] text-white hover:bg-[#505086] active:bg-[#14124d] shadow-md shadow-[#39396d]/10 border border-[#39396d]/10 btn-shine',
  secondary:
    'bg-[#edeef0] text-[#191c1e] hover:bg-[#e7e8ea] border border-[#c8c5d0] btn-shine',
  accent:
    'bg-[#f9b500] text-[#684a00] hover:bg-[#f9b500]/95 shadow-md shadow-[#f9b500]/10 border border-[#f9b500]/10 btn-shine',
  outline:
    'bg-white text-[#39396d] border border-[#39396d]/30 hover:bg-[#e2dfff]/20',
  ghost: 'text-[#777680] hover:bg-[#edeef0] hover:text-[#39396d] border border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  icon: 'h-10 w-10 p-0 rounded-xl',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  to?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  to,
  fullWidth,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-250 relative overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39396d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:opacity-60 disabled:pointer-events-none disabled:bg-[#f3f4f6] disabled:text-[#777680] disabled:border-[#e7e8ea]',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )

  const content = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
