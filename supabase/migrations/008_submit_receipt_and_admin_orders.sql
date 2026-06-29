-- ══════════════════════════════════════════════════════════
-- رفع الإيصال عبر دالة آمنة + تأكيد صلاحيات الأدمن
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION submit_order_receipt(
  p_order_id UUID,
  p_storage_key TEXT,
  p_transfer_amount NUMERIC,
  p_transfer_date TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  UPDATE orders
  SET
    status = 'AWAITING_REVIEW',
    receipt_storage_key = p_storage_key,
    receipt_uploaded_at = NOW(),
    transfer_amount = p_transfer_amount,
    transfer_date = p_transfer_date,
    transfer_note = p_note,
    updated_at = NOW()
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'لم يتم العثور على الطلب أو تم رفع الإيصال مسبقاً';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_order_receipt(UUID, TEXT, NUMERIC, TEXT, TEXT) TO authenticated;

-- السماح للأدمن بتحديث أي طلب (تأكيد/رفض)
DROP POLICY IF EXISTS "orders_update_own_pending" ON orders;

CREATE POLICY "orders_update_own_pending" ON orders
  FOR UPDATE
  USING (
    (user_id = auth.uid() AND status IN ('PENDING', 'AWAITING_REVIEW'))
    OR is_admin()
  )
  WITH CHECK (
    (user_id = auth.uid() AND status IN ('PENDING', 'AWAITING_REVIEW', 'CANCELLED'))
    OR is_admin()
  );
