-- Insert thêm món ăn cho Section 1: Món Chính
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, image_cover, images, section_id, rating_avg, rating_count, is_popular, available) VALUES
('Mì Xào Hải Sản', 'Mì xào với tôm, mực, nghêu tươi ngon', 'Mì xào giòn với hải sản tươi sống, rau củ đầy đủ dinh dưỡng', 80000, NULL, '/images/mi-xao-hai-san.jpg', '["\/images\/mi-xao-hai-san.jpg"]'::jsonb, 1, 4.6, 67, false, true),
('Cơm Chiên Dương Châu', 'Cơm chiên với tôm, xúc xích, trứng', 'Cơm chiên Dương Châu với tôm, xúc xích, rau củ và trứng', 55000, NULL, '/images/com-chien-duong-chau.jpg', '["\/images\/com-chien-duong-chau.jpg"]'::jsonb, 1, 4.5, 89, true, true),
('Bánh Mì Pate', 'Bánh mì giòn với pate, thịt nguội', 'Bánh mì Sài Gòn truyền thống với pate, thịt nguội, rau thơm', 25000, 20000, '/images/banh-mi-pate.jpg', '["\/images\/banh-mi-pate.jpg"]'::jsonb, 1, 4.7, 156, true, true),
('Bún Bò Nam Bộ', 'Bún bò trộn với rau thơm, đậu phộng', 'Bún bò Nam Bộ với thịt bò xào, rau sống, đậu phộng rang', 65000, NULL, '/images/bun-bo-nam-bo.jpg', '["\/images\/bun-bo-nam-bo.jpg"]'::jsonb, 1, 4.8, 92, true, true),
('Hủ Tiếu Nam Vang', 'Hủ tiếu với tôm, thịt, gan', 'Hủ tiếu Nam Vang với nước dùng ngọt thanh, tôm tươi, thịt băm', 70000, NULL, '/images/hu-tieu-nam-vang.jpg', '["\/images\/hu-tieu-nam-vang.jpg"]'::jsonb, 1, 4.7, 78, false, true);

-- Insert thêm món ăn cho Section 2: Đồ Uống
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, image_cover, images, section_id, rating_avg, rating_count, is_popular, available) VALUES
('Trà Sữa Truyền Thống', 'Trà sữa pha theo công thức truyền thống', 'Trà sữa ngon với trân châu dai, đường đen thơm lừng', 35000, NULL, '/images/tra-sua-truyen-thong.jpg', '["\/images\/tra-sua-truyen-thong.jpg"]'::jsonb, 2, 4.8, 234, true, true),
('Cà Phê Sữa Đá', 'Cà phê phin truyền thống Việt Nam', 'Cà phê phin đậm đà với sữa đặc, đá mát lạnh', 25000, NULL, '/images/ca-phe-sua-da.jpg', '["\/images\/ca-phe-sua-da.jpg"]'::jsonb, 2, 4.9, 312, true, true),
('Sinh Tố Bơ', 'Sinh tố bơ sánh mịn, bổ dưỡng', 'Sinh tố bơ Đà Lạt thơm ngon, bổ dưỡng với sữa đặc', 40000, NULL, '/images/sinh-to-bo.jpg', '["\/images\/sinh-to-bo.jpg"]'::jsonb, 2, 4.7, 187, true, true),
('Nước Ép Cam Tươi', 'Nước cam vắt tươi 100%', 'Nước cam tươi giàu vitamin C, tốt cho sức khỏe', 35000, NULL, '/images/nuoc-ep-cam.jpg', '["\/images\/nuoc-ep-cam.jpg"]'::jsonb, 2, 4.6, 145, false, true),
('Trà Đào Cam Sả', 'Trà đào kết hợp cam sả thanh mát', 'Trà đào với cam tươi, sả thơm, đá mát lạnh giải nhiệt', 45000, 40000, '/images/tra-dao-cam-sa.jpg', '["\/images\/tra-dao-cam-sa.jpg"]'::jsonb, 2, 4.8, 201, true, true),
('Soda Chanh Dây', 'Soda chanh dây sảng khoái', 'Soda chanh dây chua ngọt, giải khát tuyệt vời', 30000, NULL, '/images/soda-chanh-day.jpg', '["\/images\/soda-chanh-day.jpg"]'::jsonb, 2, 4.5, 123, false, true),
('Trà Sữa Matcha', 'Trà sữa matcha Nhật Bản', 'Trà sữa matcha đắng nhẹ, thơm ngon độc đáo', 45000, NULL, '/images/tra-sua-matcha.jpg', '["\/images\/tra-sua-matcha.jpg"]'::jsonb, 2, 4.7, 167, false, true),
('Cà Phê Đen Đá', 'Cà phê đen nguyên chất', 'Cà phê phin đen đắng nhẹ, thức tỉnh tinh thần', 20000, NULL, '/images/ca-phe-den-da.jpg', '["\/images\/ca-phe-den-da.jpg"]'::jsonb, 2, 4.8, 276, true, true),
('Sinh Tố Dâu', 'Sinh tố dâu tươi ngon', 'Sinh tố dâu Đà Lạt tươi ngon, ngọt mát', 40000, 35000, '/images/sinh-to-dau.jpg', '["\/images\/sinh-to-dau.jpg"]'::jsonb, 2, 4.6, 134, false, true),
('Trà Chanh Leo', 'Trà chanh leo thanh mát', 'Trà chanh leo chua ngọt, giải nhiệt hiệu quả', 30000, NULL, '/images/tra-chanh-leo.jpg', '["\/images\/tra-chanh-leo.jpg"]'::jsonb, 2, 4.5, 98, false, true);

-- Insert thêm món ăn cho Section 3: Món Tráng Miệng
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, image_cover, images, section_id, rating_avg, rating_count, is_popular, available) VALUES
('Chè Khúc Bạch', 'Chè khúc bạch mát lạnh thanh mát', 'Chè khúc bạch với thạch dừa, long nhãn, nước đường', 30000, NULL, '/images/che-khuc-bach.jpg', '["\/images\/che-khuc-bach.jpg"]'::jsonb, 3, 4.7, 145, false, true),
('Bánh Flan Caramel', 'Bánh flan mềm mịn, caramel đắng nhẹ', 'Bánh flan trứng mềm mịn với caramel đắng ngọt hài hòa', 25000, NULL, '/images/banh-flan.jpg', '["\/images\/banh-flan.jpg"]'::jsonb, 3, 4.8, 198, true, true),
('Kem Tươi Trái Cây', 'Kem tươi với nhiều loại trái cây tươi', 'Kem tươi Ý kết hợp với dâu tây, xoài, kiwi tươi ngon', 45000, NULL, '/images/kem-tuoi-trai-cay.jpg', '["\/images\/kem-tuoi-trai-cay.jpg"]'::jsonb, 3, 4.9, 267, true, true),
('Sữa Chua Nếp Cẩm', 'Sữa chua kết hợp nếp cẩm bổ dưỡng', 'Sữa chua Đà Lạt với nếp cẩm, thơm ngon bổ dưỡng', 35000, 30000, '/images/sua-chua-nep-cam.jpg', '["\/images\/sua-chua-nep-cam.jpg"]'::jsonb, 3, 4.6, 156, false, true),
('Chè Thái Thập Cẩm', 'Chè Thái với nhiều loại thạch, trái cây', 'Chè Thái với thạch nhiều màu, trái cây tươi, nước cốt dừa', 40000, NULL, '/images/che-thai.jpg', '["\/images\/che-thai.jpg"]'::jsonb, 3, 4.7, 189, true, true),
('Bánh Tiramisu', 'Bánh Tiramisu Ý vị cà phê đậm đà', 'Bánh Tiramisu với mascarpone cheese, cà phê espresso', 55000, NULL, '/images/banh-tiramisu.jpg', '["\/images\/banh-tiramisu.jpg"]'::jsonb, 3, 4.8, 234, true, true),
('Chè Bưởi', 'Chè bưởi với múi bưởi tươi', 'Chè bưởi với múi bưởi tươi, nước cốt dừa thơm béo', 35000, NULL, '/images/che-buoi.jpg', '["\/images\/che-buoi.jpg"]'::jsonb, 3, 4.5, 112, false, true),
('Bánh Mousse Socola', 'Bánh mousse socola mịn màng tan chảy', 'Bánh mousse socola Bỉ cao cấp, tan chảy trong miệng', 60000, 55000, '/images/banh-mousse-socola.jpg', '["\/images\/banh-mousse-socola.jpg"]'::jsonb, 3, 4.9, 198, true, true),
('Chè Đậu Đỏ', 'Chè đậu đỏ nóng hoặc lạnh', 'Chè đậu đỏ nấu với nước cốt dừa, thơm ngon bổ dưỡng', 25000, NULL, '/images/che-dau-do.jpg', '["\/images\/che-dau-do.jpg"]'::jsonb, 3, 4.6, 134, false, true),
('Bánh Mousse Dâu', 'Bánh mousse dâu tươi ngon', 'Bánh mousse dâu tươi với lớp kem mịn màng', 55000, NULL, '/images/banh-mousse-dau.jpg', '["\/images\/banh-mousse-dau.jpg"]'::jsonb, 3, 4.7, 167, false, true);

-- Link món ăn với categories (Món Chính)
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Mì Xào Hải Sản' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Chiên Dương Châu' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Pate' AND mc.name = 'Bánh Mì';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Bò Nam Bộ' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Hủ Tiếu Nam Vang' AND mc.name = 'Bún';

-- Link món ăn với categories (Đồ Uống)
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Truyền Thống' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cà Phê Sữa Đá' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Bơ' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Nước Ép Cam Tươi' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Đào Cam Sả' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Soda Chanh Dây' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Matcha' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cà Phê Đen Đá' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Dâu' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Chanh Leo' AND mc.name = 'Trà Sữa';

-- Link món ăn với categories (Món Tráng Miệng)
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Khúc Bạch' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Flan Caramel' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Kem Tươi Trái Cây' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sữa Chua Nếp Cẩm' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Thái Thập Cẩm' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Tiramisu' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Bưởi' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mousse Socola' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Đậu Đỏ' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mousse Dâu' AND mc.name = 'Bánh Ngọt';
