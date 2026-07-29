import { Sparkles, Zap, CheckCircle2, Package } from 'lucide-react'
import { Button } from './ui/Button'

const trustPoints = [
  'تحميل فوري بعد الشراء',
  'ملفات Word & PDF قابلة للتعديل',
  'مراجعة وإتاحة خلال 24 ساعة',
]

export function HeroSection() {
  return (
    <section
      className="relative min-h-[420px] md:min-h-[560px] flex items-center overflow-hidden rounded-3xl mb-12"
      style={{
        background: 'radial-gradient(circle at top right, rgba(194,193,255,0.18), transparent 55%), #f8f9fb',
      }}
    >
      {/* توهج بنفسجي خفيف */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(194,193,255,0.20) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-10 items-center py-10 md:py-16">

        {/* النص الرئيسي */}
        <div className="space-y-6 animate-fade-in-up">

          {/* شارة */}
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            style={{
              background: '#e2dfff',
              color: '#39396d',
              border: '1px solid rgba(57,57,109,0.18)',
            }}
          >
            <Sparkles className="w-3 h-3" />
            حقائب وموارد تعليمية مطورة — وفّر حتى 45%
          </span>

          {/* العنوان */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: '#39396d', fontFamily: 'IBM Plex Sans Arabic' }}
          >
            اكتشف آفاقاً جديدة <br />
            <span
              className="inline-block px-4 py-1 rounded-lg mt-1"
              style={{ background: '#39396d', color: '#f9b500' }}
            >
              في التعليم الرقمي
            </span>
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: '#47464f' }}>
            متجر مدار يوفر للمعلمين والطلاب أجود المصادر التعليمية الرقمية الموثقة،
            من خطط الدروس إلى أوراق العمل التفاعلية.
          </p>

          {/* نقاط الثقة */}
          <div className="flex flex-col gap-2">
            {trustPoints.map((p) => (
              <div key={p} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} strokeWidth={2.5} />
                <span className="text-sm font-medium" style={{ color: '#47464f' }}>{p}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              to="/marketplace"
              variant="primary"
              size="lg"
              className="btn-shine rounded-2xl font-bold px-8 text-base shadow-lg flex-1 sm:flex-initial"
              icon={<Zap className="w-4 h-4" />}
            >
              تصفح المنتجات الآن
            </Button>
            <Button
              to="/marketplace/bundles"
              variant="outline"
              size="lg"
              className="rounded-2xl font-bold px-7 text-base flex-1 sm:flex-initial"
              icon={<Package className="w-4 h-4" />}
            >
              الحزم الشاملة
            </Button>
          </div>

          {/* Tags شائع */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium" style={{ color: '#777680' }}>شائع:</span>
            {['اختبارات نافس', 'تحضير رياضيات', 'أوراق عمل'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:bg-[#39396d] hover:text-white"
                style={{
                  background: '#e7e8ea',
                  color: '#47464f',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* البطاقات التوضيحية */}
        <div className="hidden md:block relative h-[460px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* توهج خلفي */}
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ background: 'rgba(57,57,109,0.06)', animation: 'orbit-pulse 4s ease-in-out infinite' }}
          />
          <div className="relative z-10 grid grid-cols-2 gap-4 animate-float">
            {/* بطاقة 1 */}
            <div
              className="rounded-2xl p-4 shadow-xl border -translate-y-8 group hover:shadow-2xl transition-all"
              style={{
                background: '#ffffff',
                borderColor: 'rgba(200,197,208,0.40)',
              }}
            >
              <div
                className="aspect-[4/3] rounded-xl mb-3 overflow-hidden"
                style={{ background: '#e2dfff' }}
              >
                <div className="w-full h-full flex items-center justify-center text-4xl">📘</div>
              </div>
              <div className="h-3 w-3/4 rounded-full mb-2" style={{ background: '#e7e8ea' }} />
              <div className="h-3 w-1/2 rounded-full" style={{ background: '#e7e8ea' }} />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-bold" style={{ color: '#39396d' }}>45 ر.س</span>
                <span className="badge-new text-[9px]">PDF</span>
              </div>
            </div>
            {/* بطاقة 2 */}
            <div
              className="rounded-2xl p-4 shadow-xl border translate-y-8 group hover:shadow-2xl transition-all"
              style={{
                background: '#ffffff',
                borderColor: 'rgba(200,197,208,0.40)',
              }}
            >
              <div
                className="aspect-[4/3] rounded-xl mb-3 overflow-hidden"
                style={{ background: '#ffdea6' }}
              >
                <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
              </div>
              <div className="h-3 w-3/4 rounded-full mb-2" style={{ background: '#e7e8ea' }} />
              <div className="h-3 w-1/2 rounded-full" style={{ background: '#e7e8ea' }} />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-bold" style={{ color: '#39396d' }}>30 ر.س</span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#f9b500', color: '#684a00' }}
                >
                  Canva
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
