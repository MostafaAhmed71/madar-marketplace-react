/**
 * رفع وتحميل الملفات عبر API على Hostinger
 * ارفع مجلد hostinger/api إلى استضافتك على Hostinger
 */

const API_URL = import.meta.env.VITE_STORAGE_API_URL
const API_KEY = import.meta.env.VITE_STORAGE_API_KEY
const PUBLIC_URL = import.meta.env.VITE_STORAGE_PUBLIC_URL

export type StorageFolder = 'products' | 'receipts' | 'previews'

interface UploadResponse {
  key: string
  url?: string
}

export async function uploadFile(
  file: File,
  folder: StorageFolder,
  subfolder?: string
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  if (subfolder) formData.append('subfolder', subfolder)

  const res = await fetch(`${API_URL}/upload.php`, {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'فشل رفع الملف')
  }

  return res.json()
}

/** رابط تحميل مؤقت (15 دقيقة) للملفات المحمية */
export async function getDownloadUrl(storageKey: string): Promise<string> {
  const res = await fetch(`${API_URL}/download.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ key: storageKey }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'غير مصرح بتحميل هذا الملف')
  }
  const data = await res.json()
  return data.url
}

/** جلب ملف محمي كـ blob URL للعرض في <img> (أكثر موثوقية من الرابط المؤقت) */
export async function fetchProtectedFileBlobUrl(storageKey: string): Promise<string> {
  const res = await fetch(`${API_URL}/view.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ key: storageKey }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'فشل تحميل الملف')
  }

  const blob = await res.blob()
  if (!blob.size) throw new Error('الملف فارغ أو غير موجود')
  return URL.createObjectURL(blob)
}

/** رابط عام لصور المعاينة */
export function getPublicUrl(storageKey: string): string {
  return `${PUBLIC_URL}/${storageKey}`
}
