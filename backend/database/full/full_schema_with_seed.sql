-- Full schema clean build
-- Generated from backend/database/clean files

-- ===== BEGIN auth_schema_clean.sql =====
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'employee', 'admin', 'system_admin')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    fail_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS email_verifications (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    code_hash TEXT,
    expires_at TIMESTAMPTZ,
    otp_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- ===== END auth_schema_clean.sql =====

-- ===== BEGIN menu_schema_clean.sql =====
CREATE TABLE IF NOT EXISTS menu_sections (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_section_id ON menu_categories(section_id);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description_short TEXT,
    description_full TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) DEFAULT NULL,
    images JSONB,
    section_id INT NOT NULL,
    rating_avg DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON menu_items(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_popular ON menu_items(is_popular);

CREATE TABLE IF NOT EXISTS menu_item_categories (
    menu_item_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (menu_item_id, category_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_item_categories_menu_item ON menu_item_categories(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_categories_category ON menu_item_categories(category_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_sections_updated_at BEFORE UPDATE ON menu_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO menu_sections (name, sort_order, is_active) VALUES
('Món Chính', 1, true),
('ĐềEUống', 2, true),
('Món Tráng Miệng', 3, true);

INSERT INTO menu_categories (name, section_id) VALUES
('PhềE, 1),
('Cơm', 1),
('Bún', 1),
('Bánh Mì', 1),
('Nước Ngọt', 2),
('Trà Sữa', 2),
('Sinh TềE, 2),
('Chè', 3),
('Bánh Ngọt', 3);

INSERT INTO menu_items (name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available) VALUES
('PhềEBò Đặc Biệt', 'PhềEbò truyền thống với nước dùng ninh xương.', 'PhềEbò nấu với nước dùng ninh 12 tiếng, thịt bò tươi.', 85000, NULL, '["\/images\/pho-bo.jpg", "\/images\/pho-bo-2.jpg"]'::jsonb, 1, 4.9, 128, true, true),
('Cơm Tấm Sườn Bì Chả', 'Cơm tấm với sườn nướng, bì và chả hấp.', 'Cơm tấm truyền thống Sài Gòn với sườn nướng thơm ngon, bì giòn và chả hấp mềm.', 65000, NULL, '["\/images\/com-tam.jpg"]'::jsonb, 1, 4.8, 95, true, true),
('PhềEGà', 'PhềEgà thanh đạm với nước dùng trong.', 'PhềEgà nấu từ xương gà ta, thịt gà tươi, nước dùng thanh ngọt.', 70000, NULL, '["\/images\/pho-ga.jpg"]'::jsonb, 1, 4.7, 85, true, true),
('Bún Chả Hà Nội', 'Bún chả truyền thống Hà Nội.', 'Bún chả với thịt nướng thơm, chả viên và nước mắm chua ngọt đặc trưng.', 75000, NULL, '["\/images\/bun-cha.jpg"]'::jsonb, 1, 4.8, 112, true, true),
('Cơm Gà Xối Mỡ', 'Cơm gà Hải Nam thơm ngon.', 'Cơm gà nấu với nước gà, thịt gà luộc mềm, kèm nước chấm đặc biệt.', 60000, NULL, '["\/images\/com-ga.jpg"]'::jsonb, 1, 4.6, 78, false, true);

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'PhềEBò Đặc Biệt' AND mc.name = 'PhềE;

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Tấm Sườn Bì Chả' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'PhềEGà' AND mc.name = 'PhềE;

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Chả Hà Nội' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Gà Xối Mỡ' AND mc.name = 'Cơm';
-- ===== END menu_schema_clean.sql =====

-- ===== BEGIN reviews_schema_clean.sql =====
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_review_user_menu_item UNIQUE (user_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON reviews(menu_item_id);

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ===== END reviews_schema_clean.sql =====

-- ===== BEGIN Cart_clean.sql =====
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
-- ===== END Cart_clean.sql =====

-- ===== BEGIN order_flow_schema_clean.sql =====
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
-- ===== END order_flow_schema_clean.sql =====

-- ===== BEGIN restaurant_table_clean.sql =====
CREATE TABLE IF NOT EXISTS restaurant_table (
    table_id SERIAL PRIMARY KEY,
    capacity INT NOT NULL CHECK (capacity > 0),
    table_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (table_status IN ('RESERVED', 'AVAILABLE', 'OCCUPIED')),
    position_x INT NOT NULL CHECK (position_x >= 0),
    position_y INT NOT NULL CHECK (position_y >= 0),
    restaurant_note VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_table_position ON restaurant_table(position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_table_status ON restaurant_table(table_status);
CREATE INDEX IF NOT EXISTS idx_table_capacity ON restaurant_table(capacity);
-- ===== END restaurant_table_clean.sql =====

-- ===== BEGIN restaurant_info_clean.sql =====
CREATE TABLE IF NOT EXISTS restaurant_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slogan VARCHAR(255),
    logo_url TEXT,
    brand_image_url TEXT,
    address_line VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restaurant_info_updated_at ON restaurant_info;
CREATE TRIGGER trg_restaurant_info_updated_at
BEFORE UPDATE ON restaurant_info
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- ===== END restaurant_info_clean.sql =====

-- ===== BEGIN Reservation_clean.sql =====
CREATE TABLE IF NOT EXISTS reservation (
  reservation_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  table_id INT NOT NULL REFERENCES restaurant_table(table_id) ON DELETE CASCADE,
  number_of_guests INT NOT NULL CHECK (number_of_guests > 0),
  reservation_state VARCHAR(30) NOT NULL DEFAULT 'CONFIRM'
    CHECK (reservation_state IN ('CONFIRM', 'CANCELED', 'ON_SERVING', 'COMPLETED')),
  reservation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note VARCHAR(255),
  restaurant_note VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_reservation_table_time ON reservation(table_id, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservation_state ON reservation(reservation_state);

CREATE OR REPLACE VIEW available_table_now AS
WITH next_reservation AS (
  SELECT table_id, MIN(reservation_time) AS next_reservation_time
  FROM reservation
  WHERE reservation_state = 'CONFIRM'
    AND reservation_time > NOW()
    AND reservation_time >= CURRENT_DATE
    AND reservation_time < CURRENT_DATE + INTERVAL '1 day'
  GROUP BY table_id
)
SELECT
  t.table_id,
  t.capacity,
  nr.next_reservation_time,
  EXTRACT(EPOCH FROM (nr.next_reservation_time - NOW())) / 60 AS minutes_until_next
FROM restaurant_table t
LEFT JOIN next_reservation nr ON t.table_id = nr.table_id
WHERE t.table_status != 'OCCUPIED';

CREATE OR REPLACE VIEW reservation_in_day AS
SELECT
  t.table_id,
  t.capacity,
  r.reservation_id,
  r.reservation_time,
  r.reservation_state
FROM restaurant_table t
LEFT JOIN reservation r
  ON t.table_id = r.table_id
  AND r.reservation_time >= CURRENT_DATE
  AND r.reservation_time < CURRENT_DATE + INTERVAL '1 day';

DROP TRIGGER IF EXISTS trg_update_table_status ON reservation;
DROP FUNCTION IF EXISTS update_table_status();
-- ===== END Reservation_clean.sql =====

-- ===== BEGIN add_admin_action_logs_clean.sql =====
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('customer', 'employee', 'admin', 'system_admin'));

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  target_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_logs_actor ON admin_action_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target ON admin_action_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action ON admin_action_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at DESC);
-- ===== END add_admin_action_logs_clean.sql =====

