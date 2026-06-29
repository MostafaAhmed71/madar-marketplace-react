import { cn } from '../../lib/cn'

type BadgeVariant = 'default' | 'sale' | 'success' | 'muted' | 'accent'

const styles: Record<BadgeVariant, string> = {
  default: 'bg-orbit-purple/10 text-orbit-purple',
  sale: 'bg-red-500 text-white',
  success: 'bg-emerald-50 text-emerald-700',
  muted: 'bg-zinc-100 text-zinc-600',
  accent: 'bg-solar-gold text-zinc-900',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
