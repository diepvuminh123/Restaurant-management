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