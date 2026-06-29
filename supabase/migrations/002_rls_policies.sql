-- ══════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ══════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Helper: هل المستخدم أدمن؟
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Profiles ─────────────────────────────────────────────

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ── Categories (عام للقراءة) ─────────────────────────────

CREATE POLICY "categories_public_read" ON market_categories
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "categories_admin_all" ON market_categories
  FOR ALL USING (is_admin());

-- ── Products (منشور للجميع) ──────────────────────────────

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (status = 'PUBLISHED' OR is_admin());

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin());

-- ── Product Files (أدمن فقط مباشرة) ──────────────────────

CREATE POLICY "product_files_admin" ON product_files
  FOR ALL USING (is_admin());

-- ── Bundles ──────────────────────────────────────────────

CREATE POLICY "bundles_public_read" ON bundles
  FOR SELECT USING (status = 'PUBLISHED' OR is_admin());

CREATE POLICY "bundles_admin_all" ON bundles
  FOR ALL USING (is_admin());

CREATE POLICY "bundle_items_public_read" ON bundle_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bundles b WHERE b.id = bundle_id AND (b.status = 'PUBLISHED' OR is_admin()))
  );

CREATE POLICY "bundle_items_admin" ON bundle_items
  FOR ALL USING (is_admin());

-- ── Coupons (التحقق عبر API) ─────────────────────────────

CREATE POLICY "coupons_admin" ON coupons
  FOR ALL USING (is_admin());

-- ── Orders ───────────────────────────────────────────────

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_own_pending" ON orders
  FOR UPDATE USING (
    (user_id = auth.uid() AND status = 'PENDING') OR is_admin()
  );

-- ── Order Items ──────────────────────────────────────────

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

-- ── Reviews ──────────────────────────────────────────────

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── Wishlist ─────────────────────────────────────────────

CREATE POLICY "wishlist_own" ON wishlist
  FOR ALL USING (user_id = auth.uid());

-- ── Cart ─────────────────────────────────────────────────

CREATE POLICY "cart_own" ON cart_items
  FOR ALL USING (user_id = auth.uid());

-- ── Bank Account (عام للقراءة النشطة) ────────────────────

CREATE POLICY "bank_public_read" ON bank_accounts
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "bank_admin_all" ON bank_accounts
  FOR ALL USING (is_admin());
