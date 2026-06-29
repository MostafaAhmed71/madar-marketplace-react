-- زيادة مشاهدات المنتج (للجميع)
CREATE OR REPLACE FUNCTION increment_product_views(product_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET total_views = total_views + 1
  WHERE slug = product_slug AND status = 'PUBLISHED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_product_views(TEXT) TO anon, authenticated;
