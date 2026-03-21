-- Add public order code for customer-facing tracking
-- Run this on existing databases after order tables are created.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_code VARCHAR(32);

UPDATE orders
SET order_code =
  'ORD-' || TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' || LPAD(id::text, 6, '0')
WHERE order_code IS NULL;

ALTER TABLE orders
ALTER COLUMN order_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
