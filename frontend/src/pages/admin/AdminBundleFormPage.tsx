import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { fetchAdminProducts } from '../../lib/adminProducts'
import { fetchAdminBundle, saveBundle } from '../../lib/bundles'
import { slugify } from '../../lib/productUtils'
import type { Product, ProductStatus } from '../../types/database'

export function AdminBundleFormPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title_ar: '',
    slug: '',
    description: '',
    price: 0,
    discount_price: null as number | null,
    thumbnail: '',
    status: 'DRAFT' as ProductStatus,
    productIds: [] as string[],
  })

  useEffect(() => {
    fetchAdminProducts().then(setProducts)
    if (!isNew && id) {
      fetchAdminBundle(id).then((b) => {
        if (b) {
          setForm({
            title_ar: b.title_ar,
            slug: b.slug,
            description: b.description,
            price: b.price,
            discount_price: b.discount_price,
            thumbnail: b.thumbnail ?? '',
            status: b.status,
            productIds: b.bundle_items?.map((bi) => bi.product_id) ?? [],
          })
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [id, isNew])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveBundle(
        { ...form, id: isNew ? undefined : id, discount_price: form.discount_price },
        form.productIds
      )
      navigate('/admin/bundles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const toggleProduct = (pid: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(pid) ? f.productIds.filter((x) => x !== pid) : [...f.productIds, pid],
    }))
  }

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <Link to="/admin/bundles" className="text-sm text-gray-400 hover:text-orbit-purple mb-4 inline-block">← الحزم</Link>
      <h1 className="text-2xl font-bold text-orbit-purple mb-6">{isNew ? 'حزمة جديدة' : 'تعديل حزمة'}</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">العنوان *</label>
          <input
            required
            value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value, slug: slugify(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orbit-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوصف *</label>
          <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">السعر *</label>
            <input type="number" required min="0" step="0.01" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-lg border border-gray-200" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">سعر الخصم</label>
            <input type="number" min="0" step="0.01" value={form.discount_price ?? ''} onChange={(e) => setForm({ ...form, discount_price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-4 py-2 rounded-lg border border-gray-200" dir="ltr" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رابط الصورة</label>
          <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">المنتجات المضمّنة</label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-3">
            {products.filter((p) => p.status === 'PUBLISHED').map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                {p.title_ar}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`px-3 py-1 rounded-full text-xs border ${form.status === s ? 'bg-orbit-purple text-white border-orbit-purple' : 'border-gray-200'}`}>
              {s === 'PUBLISHED' ? 'منشور' : s === 'DRAFT' ? 'مسودة' : 'مؤرشف'}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-orbit-purple text-white py-3 rounded-xl font-semibold disabled:opacity-50">
          {saving ? 'جاري...' : 'حفظ'}
        </button>
      </form>
    </AdminLayout>
  )
}
