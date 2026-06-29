-- ══════════════════════════════════════════════════════════
-- تحميل ملفات المنتج للمشترين (منتج مباشر أو عبر حزمة)
-- ══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "product_files_buyer_read" ON product_files;

CREATE POLICY "product_files_buyer_read" ON product_files
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND o.status = 'PAID'
        AND (
          oi.product_id = product_files.product_id
          OR EXISTS (
            SELECT 1
            FROM bundle_items bi
            WHERE bi.bundle_id = oi.bundle_id
              AND bi.product_id = product_files.product_id
          )
        )
    )
  );

CREATE OR REPLACE FUNCTION get_purchased_product_files(p_product_id UUID)
RETURNS SETOF product_files
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT pf.*
  FROM product_files pf
  WHERE pf.product_id = p_product_id
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = auth.uid()
          AND o.status = 'PAID'
          AND (
            oi.product_id = p_product_id
            OR EXISTS (
              SELECT 1
              FROM bundle_items bi
              WHERE bi.bundle_id = oi.bundle_id
                AND bi.product_id = p_product_id
            )
          )
      )
    )
  ORDER BY pf.sort_order, pf.created_at;
$$;

GRANT EXECUTE ON FUNCTION get_purchased_product_files(UUID) TO authenticated;
