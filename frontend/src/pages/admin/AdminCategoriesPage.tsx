import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { deleteCategory, fetchAllCategories, saveCategory } from '../../lib/adminProducts'
import { slugify } from '../../lib/productUtils'
import type { MarketCategory } from '../../types/database'

const empty = (): Partial<MarketCategory> & { name_ar: string; slug: string } => ({
  name_ar: '',
  slug: '',
  icon: '',
  sort_order: 0,
  is_active: true,
})

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<MarketCategory[]>([])
  const [form, setForm] = useState(empty())
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    fetchAllCategories().then((data) => {
      setCategories(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const startEdit = (cat: MarketCategory) => {
    setEditing(cat.id)
    setForm({ ...cat })
  }

  const startNew = () => {
    setEditing('new')
    setForm(empty())
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveCategory({ ...form, id: editing !== 'new' ? editing! : undefined })
      setEditing(null)
      setForm(empty())
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا التصنيف؟')) return
    try {
      await deleteCategory(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'لا يمكن الحذف — قد يحتوي على منتجات')
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orbit-purple">التصنيفات</h1>
        <button
          type="button"
          onClick={startNew}
          className="bg-solar-gold text-space-black px-4 py-2 rounded-lg font-semibold text-sm"
        >
          + تصنيف جديد
        </button>
      </div>

      {(editing === 'new' || editing) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
          <h2 className="font-bold">{editing === 'new' ? 'تصنيف جديد' : 'تعديل تصنيف'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم *</label>
              <input
                required
                value={form.name_ar}
                onChange={(e) =>
                  setForm({ ...form, name_ar: e.target.value, slug: slugify(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">أيقونة (emoji)</label>
              <input
                value={form.icon ?? ''}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                placeholder="📋"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الترتيب</label>
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
                dir="ltr"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            نشط
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-orbit-purple text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'جاري...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(null); setError('') }}
              className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat.icon}</span>
              <div>
                <p className="font-medium">{cat.name_ar}</p>
                <p className="text-xs text-gray-400" dir="ltr">{cat.slug}</p>
              </div>
              {!cat.is_active && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">معطّل</span>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={() => startEdit(cat)} className="text-orbit-purple hover:underline">
                تعديل
              </button>
              <button type="button" onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
