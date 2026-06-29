import { cn } from '../../lib/cn'

interface AdminCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AdminCard({ title, description, children, className }: AdminCardProps) {
  return (
    <section className={cn('bg-white rounded-2xl border border-zinc-200 overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </section>
  )
}

interface AdminFieldProps {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

export function AdminField({ label, required, hint, children }: AdminFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-400 mt-1.5">{hint}</p>}
    </div>
  )
}
