import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../lib/cn'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

const config = {
  success: { icon: CheckCircle2, class: 'bg-zinc-900 text-white' },
  error: { icon: AlertCircle, class: 'bg-red-600 text-white' },
  info: { icon: Info, class: 'bg-orbit-purple text-white' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((t) => {
          const { icon: Icon, class: cls } = config[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                'animate-slide-down flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium',
                cls
              )}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
