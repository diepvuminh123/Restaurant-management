CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_cart_item UNIQUE(cart_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item_id ON cart_items(menu_item_id);

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE VIEW v_active_carts AS
SELECT 
    c.id,
    c.user_id,
    c.session_id,
    c.status,
    COUNT(ci.id) as item_count,
    SUM(ci.quantity) as total_quantity,
    SUM(ci.quantity * COALESCE(mi.sale_price, mi.price)) as cart_total,
    c.created_at,
    c.updated_at
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN menu_items mi ON ci.menu_item_id = mi.id
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.user_id, c.session_id, c.status, c.created_at, c.updated_at;

COMMENT ON TABLE carts IS 'Shopping cart - supports both logged-in users (user_id) and guests (session_id)';
COMMENT ON TABLE cart_items IS 'Items in cart - one row per unique menu item, quantity can be updated';
COMMENT ON COLUMN carts.session_id IS 'Session identifier for guest users (e.g., from cookies)';
COMMENT ON COLUMN cart_items.note IS 'Special instructions for the item (e.g., no onions, extra ice)';
