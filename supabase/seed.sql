-- منتجات تجريبية للاختبار

INSERT INTO products (
  title_ar, slug, description, detailed_desc, category_id,
  price, discount_price, thumbnail, preview_images, file_types,
  product_type, status
)
SELECT
  'خطة درس رياضيات - الكسور',
  'math-fractions-lesson',
  'خطة درس جاهزة لتعليم الكسور للصف الرابع مع أنشطة تفاعلية.',
  'تتضمن الخطة:\n• أهداف الدرس\n• التمهيد\n• العرض\n• التقويم\n• الواجب المنزلي',
  id,
  25.00,
  19.00,
  'https://placehold.co/600x400/505086/FFBA00?text=رياضيات',
  '["https://placehold.co/600x400/6B6BA8/ffffff?text=معاينة+1"]',
  '["PDF", "DOCX"]',
  'READY',
  'PUBLISHED'
FROM market_categories WHERE slug = 'lesson-plans' LIMIT 1;

INSERT INTO products (
  title_ar, slug, description, category_id,
  price, thumbnail, preview_images, file_types,
  product_type, status
)
SELECT
  'أوراق عمل - القواعد النحوية',
  'grammar-worksheets',
  'مجموعة أوراق عمل شاملة للقواعد النحوية للمرحلة المتوسطة.',
  id,
  15.00,
  'https://placehold.co/600x400/505086/FFBA00?text=نحو',
  '[]',
  '["PDF"]',
  'EDITABLE',
  'PUBLISHED'
FROM market_categories WHERE slug = 'worksheets' LIMIT 1;

INSERT INTO products (
  title_ar, slug, description, category_id,
  price, thumbnail, preview_images, file_types,
  product_type, status
)
SELECT
  'عرض تقديمي - النظام الشمسي',
  'solar-system-ppt',
  'عرض بوربوينت تفاعلي عن النظام الشمسي مع صور عالية الجودة.',
  id,
  30.00,
  'https://placehold.co/600x400/505086/FFBA00?text=علوم',
  '[]',
  '["PPTX", "PDF"]',
  'HYBRID',
  'PUBLISHED'
FROM market_categories WHERE slug = 'presentations' LIMIT 1;

-- كوبون تجريبي
INSERT INTO coupons (code, type, value, usage_limit, min_amount, is_active) VALUES
  ('MADAR10', 'PERCENTAGE', 10, 100, 10, TRUE),
  ('SAVE5', 'FIXED', 5, 50, 20, TRUE);

-- ملفات تجريبية (storage_key وهمي — استبدله بعد رفع ملف حقيقي على Hostinger)
INSERT INTO product_files (product_id, file_name, file_type, storage_key, file_size, sort_order)
SELECT id, 'خطة-الدرس.pdf', 'PDF', 'marketplace/products/demo/lesson.pdf', 512, 0
FROM products WHERE slug = 'math-fractions-lesson' LIMIT 1;

INSERT INTO product_files (product_id, file_name, file_type, storage_key, file_size, sort_order)
SELECT id, 'أوراق-العمل.pdf', 'PDF', 'marketplace/products/demo/worksheets.pdf', 256, 0
FROM products WHERE slug = 'grammar-worksheets' LIMIT 1;

-- لتعيين مستخدم كأدمن (بعد التسجيل):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- حزمة تجريبية
INSERT INTO bundles (title_ar, slug, description, price, discount_price, thumbnail, status) VALUES
  ('حزمة المعلم الشاملة', 'teacher-bundle', 'حزمة تجمع خطط الدروس وأوراق العمل والعروض بسعر مخفّض.', 60.00, 45.00, 'https://placehold.co/600x400/505086/FFBA00?text=حزمة', 'PUBLISHED');

INSERT INTO bundle_items (bundle_id, product_id)
SELECT b.id, p.id
FROM bundles b, products p
WHERE b.slug = 'teacher-bundle'
  AND p.slug IN ('math-fractions-lesson', 'grammar-worksheets', 'solar-system-ppt');
