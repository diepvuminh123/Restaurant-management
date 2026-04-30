-- ========================================
-- PROMOTION SYSTEM SCHEMA
-- ========================================

CREATE TABLE promotions (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50)  NOT NULL UNIQUE,   -- Mã in hoa, e.g. "WELCOME10"
    description     TEXT,
    discount_type   VARCHAR(20)  NOT NULL
        CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value  DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    min_order_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(12,2),              -- Chỉ có ý nghĩa với PERCENTAGE
    start_date      TIMESTAMPTZ  NOT NULL,
    end_date        TIMESTAMPTZ  NOT NULL,
    usage_limit     INT,                            -- NULL = không giới hạn
    used_count      INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_code      ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates     ON promotions(start_date, end_date);
