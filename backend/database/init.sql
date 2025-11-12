-- Active: 1762708863974@@127.0.0.1@5432@postgres
BEGIN;

CREATE DATABASE restaurant_db;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'employee', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ROLLBACK; -- Khi Lỗi mới chạy lệnh này để tránh tạo database trùng lặp


-- Tạo index cho các cột thường xuyên tìm kiếm
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Thêm admin mặc định (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('admin', 'admin@restaurant.com', '$2b$10$8YqN8O5mXK5y5Z5qQmZqLeZmZqLeZmZqLeZmZqLeZmZqLeZmZqL', 'Administrator', '0123456789', 'admin');

-- Thêm nhân viên mẫu (password: employee123)
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('employee1', 'employee1@restaurant.com', '$2b$10$8YqN8O5mXK5y5Z5qQmZqLeZmZqLeZmZqLeZmZqLeZmZqLeZmZqL', 'Nguyễn Văn A', '0987654321', 'employee');

-- Thêm khách hàng mẫu (password: customer123)
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('customer1', 'customer1@example.com', '$2b$10$8YqN8O5mXK5y5Z5qQmZqLeZmZqLeZmZqLeZmZqLeZmZqLeZmZqL', 'Trần Thị B', '0912345678', 'customer');
CREATE TABLE IF NOT EXISTS email_verifications (
  user_id        BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  code_hash      TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
  ON email_verifications (expires_at);
COMMIT;
