-- تحديث متوسط التقييم تلقائياً
CREATE OR REPLACE FUNCTION update_product_avg_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET avg_rating = COALESCE((
    SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE product_id = v_product_id
  ), 0)
  WHERE id = v_product_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_update_avg_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_avg_rating();

-- التحقق من شراء المنتج قبل التقييم
CREATE OR REPLACE FUNCTION user_has_purchased_product(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id = p_product_id
      AND o.user_id = auth.uid()
      AND o.status = 'PAID'
  );
$$;

GRANT EXECUTE ON FUNCTION user_has_purchased_product(UUID) TO authenticated;
