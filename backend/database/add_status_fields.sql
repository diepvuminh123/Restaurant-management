-- Migration: Thêm is_new và is_soldout vào menu_items table
-- Chạy file này nếu chưa có các trường is_new, is_soldout trong database

-- Thêm cột is_new (mặc định false)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- Thêm cột is_soldout (mặc định false)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_soldout BOOLEAN DEFAULT false;

-- Kiểm tra các cột đã tồn tại
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name IN ('is_new', 'is_soldout');
