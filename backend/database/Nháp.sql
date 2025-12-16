-- Này kéo về từ DB nháp thôi nhé đừng dại mà chạy
-- Create USERS Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL,  -- customer | employee | admin
    is_verified BOOLEAN DEFAULT FALSE,
    fail_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create EMAIL_VERIFICATIONS Table
CREATE TABLE email_verifications (
    user_id INT PRIMARY KEY REFERENCES users(user_id),
    code_hash TEXT,
    expires_at TIMESTAMPTZ,
    otp_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create MENU Sections Table
CREATE TABLE menu_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    sort_order INT,
    is_active BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MENU Categories Table
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    section_id INT REFERENCES menu_sections(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MENU Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    description_short TEXT,
    description_full TEXT,
    price DECIMAL,
    sale_price DECIMAL,
    images JSON,
    prep_time INT DEFAULT 20,  -- Time for preparation
    notes TEXT DEFAULT '',
    is_new BOOLEAN DEFAULT FALSE,
    is_soldout BOOLEAN DEFAULT FALSE,
    section_id INT REFERENCES menu_sections(id),
    rating_avg DECIMAL,
    rating_count INT,
    is_popular BOOLEAN,
    available BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MENU Item Categories Table
CREATE TABLE menu_item_categories (
    menu_item_id INT REFERENCES menu_items(id),
    category_id INT REFERENCES menu_categories(id),
    PRIMARY KEY(menu_item_id, category_id)
);

-- Create CARTS Table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),  -- User owns the cart
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE / CHECKED_OUT / CANCELED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CART Items Table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(id),
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT DEFAULT 1,
    note TEXT,  -- Note for the item (e.g., no onions, extra ice)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_item UNIQUE(cart_id, menu_item_id)  -- One item per cart with adjustable quantity
);

-- Create ORDERS Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),  -- Who placed the order
    cart_id INT REFERENCES carts(id),  -- Cart from which the order came
    status VARCHAR(30) DEFAULT 'PENDING',  -- Order Status: PENDING, WAITING_DEPOSIT, DEPOSIT_PAID, CONFIRMED, COMPLETED, CANCELED
    total_amount DECIMAL,  -- Estimated total before discounts
    discount_amount DECIMAL DEFAULT 0,  -- Discount if any
    final_amount DECIMAL,  -- Final amount after discount
    deposit_amount DECIMAL,  -- Deposit amount (e.g., 50% of final_amount)
    payment_status VARCHAR(20) DEFAULT 'UNPAID',  -- Payment status: UNPAID, DEPOSIT_PAID, PAID, REFUNDED
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    pickup_time TIMESTAMP,  -- Expected pickup time
    note TEXT,  -- Special note for the order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ORDER Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT,
    unit_price DECIMAL,  -- Price at the time of the order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
