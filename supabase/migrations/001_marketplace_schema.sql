-- ══════════════════════════════════════════════════════════
-- مدار التعليمية - متجر الموارد التعليمية
-- Supabase Migration 001
-- ══════════════════════════════════════════════════════════

-- ── ENUMs ────────────────────────────────────────────────

CREATE TYPE product_type AS ENUM ('EDITABLE', 'READY', 'HYBRID');
CREATE TYPE product_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'AWAITING_REVIEW',
  'PAID',
  'REJECTED',
  'CANCELLED',
  'REFUNDED'
);
CREATE TYPE coupon_type AS ENUM ('PERCENTAGE', 'FIXED');

-- ── Profiles (مرتبط بـ Supabase Auth) ───────────────────

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── تصنيفات المنتجات ─────────────────────────────────────

CREATE TABLE market_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar    TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── المنتجات ─────────────────────────────────────────────

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar        TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  detailed_desc   TEXT,
  category_id     UUID NOT NULL REFERENCES market_categories(id),
  price           NUMERIC(10,2) NOT NULL,
  discount_price  NUMERIC(10,2),
  thumbnail       TEXT NOT NULL,
  preview_images  JSONB NOT NULL DEFAULT '[]',
  video_url       TEXT,
  file_types      JSONB NOT NULL DEFAULT '[]',
  product_type    product_type NOT NULL DEFAULT 'READY',
  status          product_status NOT NULL DEFAULT 'DRAFT',
  total_sales     INT NOT NULL DEFAULT 0,
  total_views     INT NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ملفات المنتج (مخزنة على Hostinger) ───────────────────

CREATE TABLE product_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  file_size   INT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── الحزم ────────────────────────────────────────────────

CREATE TABLE bundles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar        TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  discount_price  NUMERIC(10,2),
  thumbnail       TEXT,
  status          product_status NOT NULL DEFAULT 'DRAFT',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bundle_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id  UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (bundle_id, product_id)
);

-- ── الكوبونات ────────────────────────────────────────────

CREATE TABLE coupons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  type        coupon_type NOT NULL,
  value       NUMERIC(10,2) NOT NULL,
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  min_amount  NUMERIC(10,2),
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── الطلبات ──────────────────────────────────────────────

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT NOT NULL UNIQUE,
  user_id             UUID NOT NULL REFERENCES profiles(id),
  total_amount        NUMERIC(10,2) NOT NULL,
  subtotal            NUMERIC(10,2) NOT NULL,
  discount            NUMERIC(10,2) NOT NULL DEFAULT 0,
  status              order_status NOT NULL DEFAULT 'PENDING',
  coupon_code         TEXT,
  coupon_id           UUID REFERENCES coupons(id),
  receipt_storage_key TEXT,
  receipt_uploaded_at TIMESTAMPTZ,
  transfer_amount     NUMERIC(10,2),
  transfer_date       TEXT,
  transfer_note       TEXT,
  confirmed_at        TIMESTAMPTZ,
  confirmed_by        UUID REFERENCES profiles(id),
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  bundle_id  UUID REFERENCES bundles(id),
  price      NUMERIC(10,2) NOT NULL
);

-- ── المراجعات ────────────────────────────────────────────

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── المفضلة ──────────────────────────────────────────────

CREATE TABLE wishlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── السلة (مؤقتة في DB) ──────────────────────────────────

CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  bundle_id  UUID REFERENCES bundles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (product_id IS NOT NULL AND bundle_id IS NULL) OR
    (product_id IS NULL AND bundle_id IS NOT NULL)
  )
);

-- ── الحساب البنكي ────────────────────────────────────────

CREATE TABLE bank_accounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name    TEXT NOT NULL,
  account_name TEXT NOT NULL,
  iban         TEXT NOT NULL,
  account_no   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ── توليد رقم الطلب ──────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num   INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ── تحديث updated_at تلقائياً ────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── إنشاء profile تلقائياً عند التسجيل ─────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
