-- ══════════════════════════════════════════════════════════
-- تأكيد/رفض الطلبات + صلاحيات التحميل
-- ══════════════════════════════════════════════════════════

-- قراءة ملفات المنتج للمشترين
CREATE POLICY "product_files_buyer_read" ON product_files
  FOR SELECT USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = product_files.product_id
        AND o.user_id = auth.uid()
        AND o.status = 'PAID'
    )
  );

-- تأكيد الطلب من الأدمن
CREATE OR REPLACE FUNCTION admin_confirm_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  UPDATE orders
  SET status = 'PAID',
      confirmed_at = NOW(),
      confirmed_by = auth.uid()
  WHERE id = p_order_id AND status = 'AWAITING_REVIEW';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود أو حالته لا تسمح بالتأكيد';
  END IF;

  UPDATE products
  SET total_sales = total_sales + 1
  WHERE id IN (
    SELECT product_id FROM order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  );
END;
$$;

-- رفض الطلب من الأدمن
CREATE OR REPLACE FUNCTION admin_reject_order(p_order_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'يجب إدخال سبب الرفض';
  END IF;

  UPDATE orders
  SET status = 'REJECTED',
      rejected_at = NOW(),
      confirmed_by = auth.uid(),
      rejection_reason = TRIM(p_reason)
  WHERE id = p_order_id AND status = 'AWAITING_REVIEW';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود أو حالته لا تسمح بالرفض';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_confirm_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reject_order(UUID, TEXT) TO authenticated;
