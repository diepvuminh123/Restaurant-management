-- Menu Sections Table
CREATE TABLE IF NOT EXISTS menu_sections (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories Table
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_section_id ON menu_categories(section_id);

-- Menu Items Table
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

-- Menu Item Categories ( Many - Many)
CREATE TABLE IF NOT EXISTS menu_item_categories (
    menu_item_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (menu_item_id, category_id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_item_categories_menu_item ON menu_item_categories(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_categories_category ON menu_item_categories(category_id);

-- Create trigger function for updated_at
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

-- Sample Data
INSERT INTO menu_sections (name, sort_order, is_active) VALUES
('Món Chính', 1, true),
('Đồ Uống', 2, true),
('Món Tráng Miệng', 3, true);

-- Insert Sample Data for Menu Categories
INSERT INTO menu_categories (name, section_id) VALUES
('Phở', 1),
('Cơm', 1),
('Bún', 1),
('Bánh Mì', 1),
('Nước Ngọt', 2),
('Trà Sữa', 2),
('Sinh Tố', 2),
('Chè', 3),
('Bánh Ngọt', 3);

-- Insert Sample Data for Menu Items
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available) VALUES
('Phở Bò Đặc Biệt', 'Phở bò truyền thống với nước dùng ninh xương.', 'Phở bò nấu với nước dùng ninh 12 tiếng, thịt bò tươi.', 85000, NULL , '["\/images\/pho-bo.jpg", "\/images\/pho-bo-2.jpg"]'::jsonb, 1, 4.9, 128, true, true),
('Cơm Tấm Sườn Bì Chả', 'Cơm tấm với sườn nướng, bì và chả hấp.', 'Cơm tấm truyền thống Sài Gòn với sườn nướng thơm ngon, bì giòn và chả hấp mềm.', 65000, NULL , '["\/images\/com-tam.jpg"]'::jsonb, 1, 4.8, 95, true, true),
('Phở Gà', 'Phở gà thanh đạm với nước dùng trong.', 'Phở gà nấu từ xương gà ta, thịt gà tươi, nước dùng thanh ngọt.', 70000, NULL, '["\/images\/pho-ga.jpg"]'::jsonb, 1, 4.7, 85, true, true),
('Bún Chả Hà Nội', 'Bún chả truyền thống Hà Nội.', 'Bún chả với thịt nướng thơm, chả viên và nước mắm chua ngọt đặc trưng.', 75000, NULL, '["\/images\/bun-cha.jpg"]'::jsonb, 1, 4.8, 112, true, true),
('Cơm Gà Xối Mỡ', 'Cơm gà Hải Nam thơm ngon.', 'Cơm gà nấu với nước gà, thịt gà luộc mềm, kèm nước chấm đặc biệt.', 60000, NULL, '["\/images\/com-ga.jpg"]'::jsonb, 1, 4.6, 78, false, true);

-- Insert Sample Data for Menu Item Categories (get the actual IDs from the inserts)
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Bò Đặc Biệt' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Tấm Sườn Bì Chả' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Gà' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Chả Hà Nội' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Gà Xối Mỡ' AND mc.name = 'Cơm';
