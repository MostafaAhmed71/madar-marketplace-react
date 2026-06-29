import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import type { BankAccount } from '../../types/database'

export function AdminBankPage() {
  const [bank, setBank] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    bank_name: 'بنك الراجحي',
    account_name: '',
    iban: '',
    account_no: '',
  })

  const loadBank = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('bank_accounts:', error.message)
    }

    if (data) {
      const b = data as BankAccount
      setBank(b)
      setForm({
        bank_name: b.bank_name,
        account_name: b.account_name,
        iban: b.iban,
        account_no: b.account_no ?? '',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBank()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    if (bank) {
      const { error } = await supabase
        .from('bank_accounts')
        .update(form as never)
        .eq('id', bank.id)
      if (error) {
        setMsg('فشل الحفظ: ' + error.message)
      } else {
        setMsg('✓ تم الحفظ')
        await loadBank()
      }
    } else {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ ...form, is_active: true } as never)
        .select()
        .maybeSingle()

      if (error) {
        setMsg('فشل الإنشاء: ' + error.message)
      } else {
        setMsg('✓ تم إنشاء الحساب البنكي')
        if (data) setBank(data as BankAccount)
      }
    }
    setSaving(false)
  }

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-orbit-purple mb-2">الحساب البنكي</h1>
      {!bank && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          لم يُضف حساب بنكي بعد — أدخل البيانات واحفظ ليظهر للعملاء عند الدفع.
        </p>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">اسم البنك</label>
          <input
            required
            value={form.bank_name}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">اسم صاحب الحساب</label>
          <input
            required
            value={form.account_name}
            onChange={(e) => setForm({ ...form, account_name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الآيبان (IBAN)</label>
          <input
            required
            value={form.iban}
            onChange={(e) => setForm({ ...form, iban: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
            dir="ltr"
            placeholder="SA..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رقم الحساب (اختياري)</label>
          <input
            value={form.account_no}
            onChange={(e) => setForm({ ...form, account_no: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
            dir="ltr"
          />
        </div>

        {msg && (
          <p className={`text-sm ${msg.startsWith('✓') ? 'text-growth-green' : 'text-red-500'}`}>{msg}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orbit-purple text-white py-3 rounded-xl font-semibold hover:bg-nebula-laven disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : bank ? 'حفظ التعديلات' : 'إنشاء الحساب البنكي'}
        </button>
      </form>
    </AdminLayout>
  )
}
