-- ══════════════════════════════════════════════════════════
-- دوال إنشاء الطلب والكوبونات
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION preview_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_discount NUMERIC(10,2) := 0;
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE UPPER(code) = UPPER(p_code) AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'كود غير صالح');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'message', 'انتهت صلاحية الكود');
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'message', 'تم استنفاد الكود');
  END IF;

  IF v_coupon.min_amount IS NOT NULL AND p_subtotal < v_coupon.min_amount THEN
    RETURN jsonb_build_object('valid', false, 'message', 'الحد الأدنى للطلب ' || v_coupon.min_amount || ' ر.س');
  END IF;

  IF v_coupon.type = 'PERCENTAGE' THEN
    v_discount := ROUND(p_subtotal * (v_coupon.value / 100), 2);
  ELSE
    v_discount := v_coupon.value;
  END IF;

  v_discount := LEAST(v_discount, p_subtotal);

  RETURN jsonb_build_object(
    'valid', true,
    'discount', v_discount,
    'total', p_subtotal - v_discount,
    'code', v_coupon.code
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_marketplace_order(
  p_items JSONB,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_subtotal   NUMERIC(10,2) := 0;
  v_discount   NUMERIC(10,2) := 0;
  v_total      NUMERIC(10,2);
  v_coupon_id  UUID;
  v_coupon     coupons%ROWTYPE;
  v_order_id   UUID;
  v_order_num  TEXT;
  item         JSONB;
  preview      JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'السلة فارغة';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (item->>'price')::NUMERIC;
  END LOOP;

  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) != '' THEN
    preview := preview_coupon(p_coupon_code, v_subtotal);
    IF (preview->>'valid')::BOOLEAN THEN
      v_discount := (preview->>'discount')::NUMERIC;
      SELECT id INTO v_coupon_id FROM coupons WHERE UPPER(code) = UPPER(p_coupon_code);
      UPDATE coupons SET usage_count = usage_count + 1 WHERE id = v_coupon_id;
    END IF;
  END IF;

  v_total := GREATEST(v_subtotal - v_discount, 0);
  v_order_num := generate_order_number();

  INSERT INTO orders (
    order_number, user_id, total_amount, subtotal, discount,
    status, coupon_code, coupon_id
  ) VALUES (
    v_order_num, v_user_id, v_total, v_subtotal, v_discount,
    'PENDING', NULLIF(TRIM(p_coupon_code), ''), v_coupon_id
  ) RETURNING id INTO v_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, bundle_id, price)
    VALUES (
      v_order_id,
      (item->>'product_id')::UUID,
      NULLIF(item->>'bundle_id', '')::UUID,
      (item->>'price')::NUMERIC
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_num,
    'total_amount', v_total,
    'subtotal', v_subtotal,
    'discount', v_discount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION preview_coupon(TEXT, NUMERIC) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_marketplace_order(JSONB, TEXT) TO authenticated;
