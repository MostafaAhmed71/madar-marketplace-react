import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, FileText, Trash2, X } from 'lucide-react'
import { AdminCard, AdminField } from '../../components/admin/AdminCard'
import { AdminLayout } from '../../components/AdminLayout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { FileUploadZone } from '../../components/ui/FileUploadZone'
import { cn } from '../../lib/cn'
import {
  addProductFile,
  createProduct,
  fetchAdminProduct,
  fetchAllCategories,
  fetchProductFiles,
  removeProductFile,
  updateProduct,
  uploadPreviewImage,
  uploadThumbnail,
} from '../../lib/adminProducts'
import type { ProductFormData } from '../../lib/adminProducts'
import {
  FILE_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  slugify,
} from '../../lib/productUtils'
import type { MarketCategory } from '../../types/database'
import type { ProductFile } from '../../lib/downloads'

const emptyForm = (): ProductFormData => ({
  title_ar: '',
  slug: '',
  description: '',
  detailed_desc: '',
  category_id: '',
  price: 0,
  discount_price: null,
  thumbnail: '',
  preview_images: [],
  video_url: '',
  file_types: [],
  product_type: 'READY',
  status: 'DRAFT',
})

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<ProductFormData>(emptyForm())
  const [categories, setCategories] = useState<MarketCategory[]>([])
  const [files, setFiles] = useState<ProductFile[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingPreview, setUploadingPreview] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState('')
  const [autoSlug, setAutoSlug] = useState(!isEdit)

  useEffect(() => {
    fetchAllCategories().then(setCategories)
    if (id) {
      Promise.all([fetchAdminProduct(id), fetchProductFiles(id)]).then(([product, productFiles]) => {
        if (product) {
          setForm({
            title_ar: product.title_ar,
            slug: product.slug,
            description: product.description,
            detailed_desc: product.detailed_desc ?? '',
            category_id: product.category_id,
            price: product.price,
            discount_price: product.discount_price,
            thumbnail: product.thumbnail,
            preview_images: product.preview_images ?? [],
            video_url: product.video_url ?? '',
            file_types: product.file_types ?? [],
            product_type: product.product_type,
            status: product.status,
          })
          setFiles(productFiles)
        }
        setLoading(false)
      })
    }
  }, [id])

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleTitleChange = (title: string) => {
    set('title_ar', title)
    if (autoSlug) set('slug', slugify(title))
  }

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumb(true)
    setError('')
    try {
      const url = await uploadThumbnail(file)
      set('thumbnail', url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploadingThumb(false)
    }
  }

  const handlePreviewUpload = async (file: File) => {
    setUploadingPreview(true)
    setError('')
    try {
      const url = await uploadPreviewImage(file)
      set('preview_images', [...form.preview_images, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploadingPreview(false)
    }
  }

  const handleProductFileUpload = async (file: File) => {
    if (!id) return
    setUploadingFile(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()?.toUpperCase() ?? 'PDF'
      await addProductFile(id, file, ext)
      const updated = await fetchProductFiles(id)
      setFiles(updated)
      if (!form.file_types.includes(ext)) {
        set('file_types', [...form.file_types, ext])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الملف')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    if (!id || !confirm('حذف هذا الملف؟')) return
    await removeProductFile(fileId)
    setFiles((f) => f.filter((x) => x.id !== fileId))
  }

  const toggleFileType = (type: string) => {
    set(
      'file_types',
      form.file_types.includes(type)
        ? form.file_types.filter((t) => t !== type)
        : [...form.file_types, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (!form.category_id) throw new Error('اختر تصنيفاً')
      if (!form.thumbnail) throw new Error('أضف صورة مصغرة')

      if (isEdit && id) {
        await updateProduct(id, form)
        navigate('/admin/marketplace')
      } else {
        const newId = await createProduct(form)
        navigate(`/admin/marketplace/${newId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const isUploading = uploadingThumb || uploadingPreview || uploadingFile

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <Link
        to="/admin/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        المنتجات
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">{isEdit ? 'تعديل منتج' : 'منتج جديد'}</h1>
        <p className="text-sm text-zinc-500 mt-1">أضف التفاصيل والصور وملفات التحميل للعملاء</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
        <AdminCard title="المعلومات الأساسية">
          <AdminField label="عنوان المنتج" required>
            <input
              required
              value={form.title_ar}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input-field"
            />
          </AdminField>

          <AdminField
            label="الرابط (slug)"
            hint={!isEdit && autoSlug ? 'يُولَّد تلقائياً من العنوان' : undefined}
          >
            <div className="flex gap-2">
              <input
                required
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); set('slug', e.target.value) }}
                className="input-field flex-1"
                dir="ltr"
              />
              {!isEdit && (
                <Button type="button" variant="outline" size="sm" onClick={() => setAutoSlug(!autoSlug)}>
                  {autoSlug ? 'يدوي' : 'تلقائي'}
                </Button>
              )}
            </div>
          </AdminField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="التصنيف" required>
              <select
                required
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="input-field"
              >
                <option value="">اختر تصنيفاً</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="نوع المنتج">
              <select
                value={form.product_type}
                onChange={(e) => set('product_type', e.target.value)}
                className="input-field"
              >
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </AdminField>
          </div>

          <AdminField label="الوصف المختصر" required>
            <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field" />
          </AdminField>

          <AdminField label="الوصف التفصيلي">
            <textarea rows={5} value={form.detailed_desc} onChange={(e) => set('detailed_desc', e.target.value)} className="input-field" />
          </AdminField>
        </AdminCard>

        <AdminCard title="التسعير">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="السعر (ر.س)" required>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price || ''}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                className="input-field"
                dir="ltr"
              />
            </AdminField>
            <AdminField label="سعر الخصم" hint="اتركه فارغاً إن لم يكن هناك خصم">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price ?? ''}
                onChange={(e) => set('discount_price', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-field"
                dir="ltr"
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="الصور والمعاينة" description="الصورة المصغرة تظهر في بطاقة المنتج بالمتجر">
          <FileUploadZone
            variant="image"
            accept="image/*"
            label="الصورة المصغرة"
            hint="PNG أو JPG — يُفضّل 800×600"
            previewUrl={form.thumbnail || null}
            loading={uploadingThumb}
            onFileSelect={handleThumbnailUpload}
            onClear={form.thumbnail ? () => set('thumbnail', '') : undefined}
          />

          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">صور المعاينة</p>
            {form.preview_images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {form.preview_images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-24 h-20 object-cover rounded-lg border border-zinc-200" />
                    <button
                      type="button"
                      onClick={() => set('preview_images', form.preview_images.filter((_, j) => j !== i))}
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUploadZone
              variant="image"
              accept="image/*"
              hint="أضف صوراً إضافية لصفحة المنتج"
              loading={uploadingPreview}
              onFileSelect={handlePreviewUpload}
            />
          </div>

          <AdminField label="رابط فيديو المعاينة" hint="YouTube أو Vimeo">
            <input
              value={form.video_url}
              onChange={(e) => set('video_url', e.target.value)}
              placeholder="https://..."
              className="input-field"
              dir="ltr"
            />
          </AdminField>
        </AdminCard>

        <AdminCard title="صيغ الملفات" description="ما يحصل عليه العميل بعد الشراء">
          <div className="flex flex-wrap gap-2">
            {FILE_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleFileType(type)}
                className={cn(
                  'h-9 px-4 rounded-lg text-sm font-medium border transition-colors',
                  form.file_types.includes(type)
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </AdminCard>

        {isEdit && id && (
          <AdminCard
            title="ملفات التحميل"
            description="الملفات التي يحمّلها العميل بعد تأكيد الدفع"
          >
            {files.length === 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                لم تُرفع ملفات بعد — العملاء لن يتمكنوا من التحميل حتى ترفع ملفاً هنا.
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-orbit-purple" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{f.file_name}</p>
                        <p className="text-xs text-zinc-500">
                          {f.file_type}
                          {f.file_size ? ` · ${f.file_size} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FileUploadZone
              accept=".pdf,.docx,.pptx,.xlsx,.zip"
              hint="PDF, DOCX, PPTX, XLSX, ZIP — حتى 50MB"
              loading={uploadingFile}
              onFileSelect={handleProductFileUpload}
            />
          </AdminCard>
        )}

        <AdminCard title="حالة النشر">
          <div className="flex flex-wrap gap-2">
            {PRODUCT_STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set('status', o.value)}
                className={cn(
                  'h-10 px-5 rounded-lg text-sm font-medium border transition-colors',
                  form.status === o.value
                    ? 'bg-orbit-purple text-white border-orbit-purple'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </AdminCard>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" fullWidth loading={saving} disabled={isUploading} className="sm:flex-1">
            {isEdit ? 'حفظ التعديلات' : 'إنشاء المنتج'}
          </Button>
          <Button to="/admin/marketplace" variant="outline" size="lg" className="sm:w-auto">
            إلغاء
          </Button>
        </div>

        {!isEdit && (
          <p className="text-xs text-zinc-400 text-center pb-4">
            بعد إنشاء المنتج ستتمكن من رفع ملفات التحميل
          </p>
        )}
      </form>
    </AdminLayout>
  )
}
