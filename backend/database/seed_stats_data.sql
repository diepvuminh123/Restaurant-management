-- ============================================================================
-- SEED DATA FOR STATISTICS AND REPORTING
-- ============================================================================
-- This script inserts dummy data to populate the Admin Dashboard with 
-- meaningful statistics (Revenue, Orders, Customers, Top Dishes, Trends).
-- ============================================================================

DO $$
DECLARE
    v_user_id_1 INT;
    v_user_id_2 INT;
    v_user_id_3 INT;
    v_menu_id_1 INT;
    v_menu_id_2 INT;
    v_menu_id_3 INT;
    v_menu_id_4 INT;
    v_cart_id INT;
    v_order_id INT;
BEGIN
    -- 1. TẠO NGƯỜI DÙNG MẪU (CUSTOMERS)
    -- Xóa bớt khách hàng cũ nếu muốn reset (Tùy chọn)
    -- DELETE FROM users WHERE email LIKE 'seed_test_%';

    INSERT INTO users (username, email, password_hash, full_name, phone, role, is_verified, created_at)
    VALUES 
    ('seed_cust_1', 'seed_test_1@example.com', '$2b$10$xyz', 'Nguyễn Văn A', '0912345671', 'customer', true, NOW() - INTERVAL '40 days'),
    ('seed_cust_2', 'seed_test_2@example.com', '$2b$10$xyz', 'Trần Thị B', '0912345672', 'customer', true, NOW() - INTERVAL '20 days'),
    ('seed_cust_3', 'seed_test_3@example.com', '$2b$10$xyz', 'Lê Văn C', '0912345673', 'customer', true, NOW() - INTERVAL '5 days')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING user_id INTO v_user_id_1; -- Lấy ID cuối hoặc gán thủ công bên dưới

    SELECT user_id INTO v_user_id_1 FROM users WHERE email = 'seed_test_1@example.com';
    SELECT user_id INTO v_user_id_2 FROM users WHERE email = 'seed_test_2@example.com';
    SELECT user_id INTO v_user_id_3 FROM users WHERE email = 'seed_test_3@example.com';

    -- 2. ĐẢM BẢO CÓ MÓN ĂN MẪU
    -- (Giả định đã chạy menu_schema.sql, nếu chưa có thì lấy ID từ các món có sẵn)
    SELECT id INTO v_menu_id_1 FROM menu_items WHERE name LIKE '%Phở Bò%' LIMIT 1;
    SELECT id INTO v_menu_id_2 FROM menu_items WHERE name LIKE '%Cơm Tấm%' LIMIT 1;
    SELECT id INTO v_menu_id_3 FROM menu_items WHERE name LIKE '%Bún Chả%' LIMIT 1;
    SELECT id INTO v_menu_id_4 FROM menu_items WHERE name LIKE '%Phở Gà%' LIMIT 1;

    -- Nếu không tìm thấy, lấy đại ID bất kỳ để tránh lỗi
    IF v_menu_id_1 IS NULL THEN SELECT id INTO v_menu_id_1 FROM menu_items LIMIT 1; END IF;
    IF v_menu_id_2 IS NULL THEN SELECT id INTO v_menu_id_2 FROM menu_items OFFSET 1 LIMIT 1; END IF;
    IF v_menu_id_3 IS NULL THEN SELECT id INTO v_menu_id_3 FROM menu_items OFFSET 2 LIMIT 1; END IF;
    IF v_menu_id_4 IS NULL THEN SELECT id INTO v_menu_id_4 FROM menu_items OFFSET 3 LIMIT 1; END IF;

    -- 3. TẠO CÁC ĐƠN HÀNG GIẢ LẬP TRONG 10 NGÀY QUA
    
    -- Đơn hàng 1: 8 ngày trước (COMPLETED)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_1, 'CHECKED_OUT', NOW() - INTERVAL '8 days') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-001', v_user_id_1, v_cart_id, 'COMPLETED', 'PAID', 150000, 150000, 75000, 'Nguyễn Văn A', '0912345671', 'test_customer1@example.com', NOW() - INTERVAL '8 days' + INTERVAL '2 hours', NOW() - INTERVAL '8 days')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_1, 'Phở Bò Đặc Biệt', 2, 75000, 150000);

    -- Đơn hàng 2: 6 ngày trước (COMPLETED)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_2, 'CHECKED_OUT', NOW() - INTERVAL '6 days') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-002', v_user_id_2, v_cart_id, 'COMPLETED', 'PAID', 65000, 65000, 32500, 'Trần Thị B', '0912345672', 'test_customer2@example.com', NOW() - INTERVAL '6 days' + INTERVAL '1 hours', NOW() - INTERVAL '6 days')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_2, 'Cơm Tấm Sườn', 1, 65000, 65000);

    -- Đơn hàng 3: 4 ngày trước (COMPLETED)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_3, 'CHECKED_OUT', NOW() - INTERVAL '4 days') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-003', v_user_id_3, v_cart_id, 'COMPLETED', 'PAID', 225000, 225000, 112500, 'Lê Văn C', '0912345673', 'test_customer3@example.com', NOW() - INTERVAL '4 days' + INTERVAL '3 hours', NOW() - INTERVAL '4 days')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_3, 'Bún Chả Hà Nội', 3, 75000, 225000);

    -- Đơn hàng 4: 2 ngày trước (READY)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_1, 'CHECKED_OUT', NOW() - INTERVAL '2 days') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-004', v_user_id_1, v_cart_id, 'READY', 'DEPOSIT_PAID', 85000, 85000, 42500, 'Nguyễn Văn A', '0912345671', 'test_customer1@example.com', NOW() - INTERVAL '2 days' + INTERVAL '1 hours', NOW() - INTERVAL '2 days')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_1, 'Phở Bò Đặc Biệt', 1, 85000, 85000);

    -- Đơn hàng 5: Hôm nay (PENDING)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_2, 'CHECKED_OUT', NOW() - INTERVAL '2 hours') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-005', v_user_id_2, v_cart_id, 'PENDING', 'UNPAID', 140000, 140000, 70000, 'Trần Thị B', '0912345672', 'test_customer2@example.com', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_4, 'Phở Gà', 2, 70000, 140000);

    -- Đơn hàng 6: Hôm nay (CONFIRMED)
    INSERT INTO carts (user_id, status, created_at) VALUES (v_user_id_3, 'CHECKED_OUT', NOW() - INTERVAL '5 hours') RETURNING id INTO v_cart_id;
    INSERT INTO orders (order_code, user_id, cart_id, status, payment_status, total_amount, final_amount, deposit_amount, customer_name, customer_phone, customer_email, pickup_time, created_at)
    VALUES ('ORD-SEED-006', v_user_id_3, v_cart_id, 'CONFIRMED', 'DEPOSIT_PAID', 130000, 130000, 65000, 'Lê Văn C', '0912345673', 'test_customer3@example.com', NOW() + INTERVAL '1 hours', NOW() - INTERVAL '5 hours')
    RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, line_total)
    VALUES (v_order_id, v_menu_id_2, 'Cơm Tấm Sườn', 2, 65000, 130000);

END $$;

-- 4. TẠO ĐẶT BÀN MẪU (RESERVATIONS)
INSERT INTO reservation (user_id, table_id, number_of_guests, reservation_state, reservation_time, note, created_at)
VALUES 
(NULL, 1, 4, 'CONFIRM', NOW() + INTERVAL '1 day', 'Tiệc sinh nhật', NOW() - INTERVAL '1 day'),
(NULL, 2, 2, 'CONFIRM', NOW() + INTERVAL '2 days', 'Hẹn hò', NOW() - INTERVAL '12 hours'),
(NULL, 3, 6, 'CONFIRM', NOW() + INTERVAL '5 hours', 'Họp mặt gia đình', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
