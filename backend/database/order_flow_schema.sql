-- ========================================
-- ORDER SYSTEM SCHEMA (Orders & Order Items)
-- PostgreSQL Database Schema
-- ========================================
-- 
-- PREREQUISITES: 
-- 1. Run auth_schema.sql first (users, email_verifications)
-- 2. Run menu_schema.sql (menu_sections, menu_categories, menu_items)
-- 3. Run Cart.sql (carts with session_id, cart_items)
-- 
-- This file contains ONLY the order-related tables
-- ========================================

-- ========================================
-- ORDER SYSTEM (Checkout Result)
-- ========================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    
    -- User identification
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    session_id VARCHAR(255),            -- Copy from carts.session_id
    cart_id INT NOT NULL UNIQUE REFERENCES carts(id) ON DELETE RESTRICT,
    
    -- Order status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
        CHECK (payment_status IN ('UNPAID', 'DEPOSIT_PAID', 'PAID', 'REFUNDED')),
    
    -- Pricing
    total_amount DECIMAL(10, 2) NOT NULL,      -- Tổng tiền
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,      -- Sau khi giảm giá
    deposit_amount DECIMAL(10, 2) NOT NULL,    -- Tiền đặt cọc
    
    -- Customer information
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    
    -- Pickup/delivery information
    pickup_time TIMESTAMPTZ NOT NULL,
    note TEXT,                                  -- Ghi chú chung cho đơn hàng
    
    -- Confirmation tracking
    confirmed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    
    -- Cancellation tracking
    canceled_reason TEXT,
    canceled_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    canceled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_cart_id ON orders(cart_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_pickup_time ON orders(pickup_time);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items (snapshot of cart_items at time of order)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    
    -- Snapshot data at time of order
    item_name VARCHAR(255) NOT NULL,
    item_image TEXT,                    -- hoặc có thể dùng JSONB cho nhiều ảnh
    note TEXT,                          -- Ghi chú cho món (ít đá, không hành...)
    
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL, -- Giá tại thời điểm đặt
    line_total DECIMAL(10, 2),          -- quantity * unit_price (computed/stored)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
    o.id,
    o.status,
    o.payment_status,
    o.customer_name,
    o.customer_phone,
    o.customer_email,
    o.pickup_time,
    o.final_amount,
    o.deposit_amount,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity,
    o.created_at,
    o.updated_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE orders IS 'Orders created from checkout - references cart_id';
COMMENT ON TABLE order_items IS 'Snapshot of items at time of order - preserves pricing and details';

COMMENT ON COLUMN orders.status IS 'Order status: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: UNPAID, DEPOSIT_PAID, PAID, REFUNDED';
COMMENT ON COLUMN orders.deposit_amount IS 'Deposit amount required at checkout';
COMMENT ON COLUMN order_items.unit_price IS 'Price at time of order - may differ from current menu price';

-- ========================================
-- END OF SCHEMA
-- ========================================
