import type { AuthError } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function authErrorMessage(error: AuthError): string {
  const msg = error.message?.trim()
  if (msg && msg !== '{}') return translateAuthError(msg)

  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'هذا البريد مسجّل مسبقاً — جرّب تسجيل الدخول'
    case 'weak_password':
      return 'كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل'
    case 'invalid_credentials':
      return 'بيانات الدخول غير صحيحة'
    case 'email_not_confirmed':
      return 'يجب تأكيد بريدك الإلكتروني أولاً'
    case 'signup_disabled':
      return 'التسجيل معطّل — راجع إعدادات Supabase'
    default:
      if (msg?.toLowerCase().includes('database error')) {
        return 'خطأ في قاعدة البيانات — تأكد من تشغيل migrations في Supabase'
      }
      return msg || error.code || 'حدث خطأ غير متوقع، حاول مرة أخرى'
  }
}

function translateAuthError(msg: string): string {
  if (msg === 'Invalid login credentials') return 'بيانات الدخول غير صحيحة'
  if (msg.includes('User already registered')) return 'هذا البريد مسجّل مسبقاً'
  if (msg.includes('Password should be at least')) return 'كلمة المرور قصيرة — 6 أحرف على الأقل'
  if (msg.includes('Unable to validate email')) return 'البريد الإلكتروني غير صالح'
  if (msg.includes('Database error saving new user')) {
    return 'خطأ في قاعدة البيانات — شغّل migrations في Supabase (جدول profiles)'
  }
  return msg
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data as Profile | null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(authErrorMessage(error))
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) throw new Error(authErrorMessage(error))

    if (!data.user) {
      throw new Error('فشل إنشاء الحساب — تحقق من إعدادات Supabase')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
