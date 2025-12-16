
BEGIN;

CREATE DATABASE restaurant_db;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'employee', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    fail_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Tạo index cho các cột thường xuyên tìm kiếm
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);


CREATE TABLE IF NOT EXISTS email_verifications (
  user_id        BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  code_hash      TEXT,
  expires_at     TIMESTAMPTZ,
  otp_type       VARCHAR(20) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
  ON email_verifications (expires_at);
COMMIT;
