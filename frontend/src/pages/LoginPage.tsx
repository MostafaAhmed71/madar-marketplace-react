import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/marketplace'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await signUp(email, password, name)
        setError('تم إنشاء الحساب! تحقق من بريدك ثم سجّل الدخول.')
        setIsRegister(false)
      } else {
        await signIn(email, password)
        navigate(from)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(message && message !== '{}' ? message : 'حدث خطأ — راجع إعدادات Supabase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-orbit-purple flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-white" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">
          {isRegister ? 'إنشاء حساب' : 'مرحباً بعودتك'}
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          {isRegister ? 'انضم لمتجر مدار التعليمية' : 'سجّل دخولك للمتابعة'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-4 shadow-sm">
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">الاسم الكامل</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">البريد الإلكتروني</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">كلمة المرور</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" dir="ltr" />
        </div>

        {error && (
          <p className={`text-sm px-3 py-2 rounded-lg ${error.includes('تم إنشاء') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
        >
          {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-zinc-500">
        {isRegister ? 'لديك حساب؟' : 'ليس لديك حساب؟'}{' '}
        <button type="button" onClick={() => { setIsRegister(!isRegister); setError('') }} className="text-orbit-purple font-semibold hover:underline">
          {isRegister ? 'سجّل دخول' : 'إنشاء حساب'}
        </button>
      </p>
    </div>
  )
}
