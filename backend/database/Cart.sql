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