import { BookOpen, Download, Layers, Package, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'

const features = [
  { icon: BookOpen, label: 'خطط دروس' },
  { icon: Layers, label: 'أوراق عمل' },
  { icon: Package, label: 'عروض تقديمية' },
  { icon: Download, label: 'تحميل فوري' },
]

export function HeroSection() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl bg-zinc-900 text-white animate-fade-in-up">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(80,80,134,0.4)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,186,0,0.08)_0%,_transparent_40%)]" />

      <div className="relative px-6 py-14 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-solar-gold" />
            موارد تعليمية رقمية
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight mb-4">
            كل ما يحتاجه المعلم
            <span className="block text-solar-gold mt-1">في مكان واحد</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            خطط دروس، أوراق عمل، وعروض احترافية — جاهزة للتحميل والاستخدام فوراً.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button to="/marketplace" variant="accent" size="lg" icon={<ShoppingBag className="w-4 h-4" />}>
              تصفح المنتجات
            </Button>
            <Button to="/marketplace/bundles" variant="outline" size="lg" className="!bg-transparent !border-zinc-600 !text-white hover:!bg-zinc-800">
              عروض الحزم
            </Button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-3 shrink-0 w-72">
          {features.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <Icon className="w-6 h-6 text-solar-gold" strokeWidth={1.5} />
              <span className="text-xs font-medium text-zinc-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
