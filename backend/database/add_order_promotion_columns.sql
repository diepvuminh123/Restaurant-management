ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promotion_id INT REFERENCES promotions(id) ON DELETE SET NULL;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promotion_code VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_orders_promotion_id ON orders(promotion_id);