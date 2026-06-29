/** تحويل العنوان العربي إلى slug */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `product-${Date.now()}`
}

export const FILE_TYPE_OPTIONS = ['PDF', 'DOCX', 'PPTX', 'XLSX', 'CANVA_LINK'] as const

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'READY', label: 'جاهز للاستخدام' },
  { value: 'EDITABLE', label: 'قابل للتعديل' },
  { value: 'HYBRID', label: 'مختلط' },
] as const

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'مسودة' },
  { value: 'PUBLISHED', label: 'منشور' },
  { value: 'ARCHIVED', label: 'مؤرشف' },
] as const
