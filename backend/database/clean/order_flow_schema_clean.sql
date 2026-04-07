CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(32) NOT NULL UNIQUE,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    cart_id INT NOT NULL UNIQUE REFERENCES carts(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
        CHECK (payment_status IN ('UNPAID', 'DEPOSIT_PAID', 'PAID', 'REFUNDED')),
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    pickup_time TIMESTAMPTZ NOT NULL,
    note TEXT,
    confirmed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    canceled_reason TEXT,
    canceled_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_cart_id ON orders(cart_id);
CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_pickup_time ON orders(pickup_time);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_image TEXT,
    note TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2),
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
    o.order_code,
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

COMMENT ON TABLE orders IS 'Orders created from checkout - references cart_id';
COMMENT ON TABLE order_items IS 'Snapshot of items at time of order - preserves pricing and details';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: UNPAID, DEPOSIT_PAID, PAID, REFUNDED';
COMMENT ON COLUMN orders.deposit_amount IS 'Deposit amount required at checkout';
COMMENT ON COLUMN order_items.unit_price IS 'Price at time of order - may differ from current menu price';
