-- Thêm cột prep_time (mặc định 20)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS prep_time INT DEFAULT 20;

-- Thêm cột notes (mặc định '')
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
