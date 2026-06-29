import { useId, useRef, useState } from 'react'
import { FileText, ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface FileUploadZoneProps {
  accept: string
  onFileSelect: (file: File) => void
  onClear?: () => void
  previewUrl?: string | null
  fileName?: string | null
  loading?: boolean
  label?: string
  hint?: string
  variant?: 'image' | 'document'
  className?: string
}

export function FileUploadZone({
  accept,
  onFileSelect,
  onClear,
  previewUrl,
  fileName,
  loading,
  label,
  hint,
  variant = 'document',
  className,
}: FileUploadZoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const pickFile = (file: File) => {
    onFileSelect(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) pickFile(file)
  }

  const hasPreview = variant === 'image' ? Boolean(previewUrl) : Boolean(previewUrl || fileName)

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 mb-2">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all overflow-hidden',
          dragOver
            ? 'border-orbit-purple bg-orbit-purple/5'
            : hasPreview
              ? 'border-zinc-200 bg-zinc-50'
              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80'
        )}
      >
        {hasPreview ? (
          <div className="relative">
            {variant === 'image' && previewUrl ? (
              <img src={previewUrl} alt="" className="w-full max-h-56 object-contain p-4" />
            ) : (
              <div className="flex items-center gap-3 p-4">
                <div className="w-11 h-11 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-orbit-purple" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{fileName ?? 'ملف مرفوع'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">جاهز للرفع أو الاستبدال</p>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 rounded-lg bg-white/95 border border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-200 shadow-sm transition-colors"
                  aria-label="إزالة"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <label
              htmlFor={inputId}
              className="block border-t border-zinc-200 px-4 py-3 text-center text-sm font-medium text-orbit-purple cursor-pointer hover:bg-white transition-colors"
            >
              {loading ? 'جاري الرفع...' : 'استبدال الملف'}
            </label>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              'flex flex-col items-center justify-center cursor-pointer px-6 py-10 text-center',
              loading && 'pointer-events-none opacity-60'
            )}
          >
            {loading ? (
              <Loader2 className="w-10 h-10 text-orbit-purple animate-spin mb-3" />
            ) : variant === 'image' ? (
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                <ImagePlus className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
              </div>
            )}
            <p className="text-sm font-semibold text-zinc-800">
              {loading ? 'جاري رفع الملف...' : 'اسحب الملف هنا أو اضغط للاختيار'}
            </p>
            {hint && <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">{hint}</p>}
          </label>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) pickFile(file)
          }}
        />
      </div>
    </div>
  )
}
