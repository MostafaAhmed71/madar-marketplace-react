export type ProductType = 'EDITABLE' | 'READY' | 'HYBRID'
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_REVIEW'
  | 'PAID'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface MarketCategory {
  id: string
  name_ar: string
  slug: string
  icon: string | null
  sort_order: number
  is_active: boolean
}

export interface Product {
  id: string
  title_ar: string
  slug: string
  description: string
  detailed_desc: string | null
  category_id: string
  price: number
  discount_price: number | null
  thumbnail: string
  preview_images: string[]
  video_url: string | null
  file_types: string[]
  product_type: ProductType
  status: ProductStatus
  total_sales: number
  total_views: number
  avg_rating: number
  created_at: string
  market_categories?: MarketCategory
}

export interface BankAccount {
  id: string
  bank_name: string
  account_name: string
  iban: string
  account_no: string | null
  is_active: boolean
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  bundle_id: string | null
  price: number
  products?: Pick<Product, 'id' | 'title_ar' | 'slug' | 'thumbnail'>
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  total_amount: number
  subtotal: number
  discount: number
  status: OrderStatus
  coupon_code: string | null
  receipt_storage_key: string | null
  receipt_uploaded_at: string | null
  transfer_amount: number | null
  transfer_date: string | null
  transfer_note: string | null
  rejection_reason: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'customer' | 'admin'
}

export interface CouponPreview {
  valid: boolean
  message?: string
  discount?: number
  total?: number
  code?: string
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      market_categories: {
        Row: MarketCategory
        Insert: Partial<MarketCategory>
        Update: Partial<MarketCategory>
      }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      bank_accounts: { Row: BankAccount; Insert: Partial<BankAccount>; Update: Partial<BankAccount> }
    }
  }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'في انتظار رفع الإيصال',
  AWAITING_REVIEW: 'قيد المراجعة',
  PAID: 'مدفوع',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  REFUNDED: 'مسترد',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  AWAITING_REVIEW: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDED: 'bg-purple-100 text-purple-800',
}
