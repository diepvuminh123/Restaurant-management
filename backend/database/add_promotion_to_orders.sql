-- ========================================
-- MIGRATION: ADD PROMOTION TO ORDERS
-- ========================================

-- Thêm FK promotion_id và snapshot promotion_code vào orders
ALTER TABLE orders
    ADD COLUMN promotion_id   INT REFERENCES promotions(id) ON DELETE SET NULL,
    ADD COLUMN promotion_code VARCHAR(50);

-- Index để tra cứu nhanh
CREATE INDEX idx_orders_promotion_id ON orders(promotion_id);
