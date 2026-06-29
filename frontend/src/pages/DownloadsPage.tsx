import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, FileText, Inbox } from 'lucide-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Button } from '../components/ui/Button'
import {
  downloadFile,
  fetchAllDownloads,
  fetchDownloadableFiles,
  type DownloadableProduct,
} from '../lib/downloads'

export function DownloadsPage() {
  const { orderId } = useParams()
  const [downloads, setDownloads] = useState<DownloadableProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const load = orderId ? fetchDownloadableFiles(orderId) : fetchAllDownloads()
    load.then((data) => {
      setDownloads(data)
      setLoading(false)
    })
  }, [orderId])

  const handleDownload = async (fileId: string, file: DownloadableProduct['files'][0]) => {
    setDownloading(fileId)
    try {
      await downloadFile(file)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <LoadingSpinner />

  if (downloads.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-6">
          <Inbox className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">لا توجد تنزيلات</h1>
        <p className="text-zinc-500 mb-8">ستظهر ملفاتك هنا بعد تأكيد الدفع</p>
        <Button to="/orders" variant="outline">عرض طلباتي</Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">تنزيلاتي</h1>
      <p className="text-zinc-500 mb-8 text-sm">روابط التحميل صالحة لمدة 15 دقيقة</p>

      <div className="space-y-4">
        {downloads.map((product) => (
          <div key={`${product.orderId}-${product.productId}`} className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-100">
              <img src={product.thumbnail} alt={product.titleAr} className="w-16 h-12 object-cover rounded-lg bg-zinc-100" />
              <div>
                <h2 className="font-semibold text-zinc-900">{product.titleAr}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">طلب #{product.orderNumber}</p>
              </div>
            </div>

            {product.files.length === 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                <p className="font-medium">لا توجد ملفات للتحميل بعد</p>
                <p className="text-amber-800 mt-1 text-xs leading-relaxed">
                  المنتج مؤكّد لكن لم يُرفع ملف تحميل من لوحة الإدارة. تواصل مع الدعم أو انتظر رفع الملفات.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {product.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-zinc-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{file.file_name}</p>
                        <p className="text-xs text-zinc-400">
                          {file.file_type}
                          {file.file_size ? ` · ${file.file_size} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(file.id, file)}
                      loading={downloading === file.id}
                      icon={<Download className="w-4 h-4" />}
                      className="shrink-0 mr-2"
                    >
                      تحميل
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!orderId && (
        <p className="text-center mt-8">
          <Link to="/orders" className="text-sm text-zinc-500 hover:text-orbit-purple transition-colors">
            عرض سجل الطلبات
          </Link>
        </p>
      )}
    </div>
  )
}
