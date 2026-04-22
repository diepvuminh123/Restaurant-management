-- =====================================================
-- INSERT 20 THỨC UỐNG VÀ 20 MÓN TRÁNG MIỆNG
-- =====================================================

-- THỨC UỐNG (20 items) - Section ID: 2
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available, prep_time, notes, is_new, is_soldout) VALUES
-- NƯỚC NGỌT (5 items)
('Coca Cola', 'Nước giải khát Coca Cola lạnh mát.', 'Coca Cola đá lạnh, thơm ngon, là nước uống yêu thích của nhiều khách hàng.', 20000, NULL, '["\/images\/coca-cola.jpg"]'::jsonb, 2, 4.5, 234, true, true, 2, NULL, false, false),
('Sprite', 'Nước Sprite tươi mát, vị chanh tự nhiên.', 'Sprite đá lạnh, vị chanh thanh mát, giải khát hoàn hảo.', 20000, NULL, '["\/images\/sprite.jpg"]'::jsonb, 2, 4.4, 198, false, true, 2, NULL, false, false),
('Fanta Cam', 'Nước Fanta cam ngọt, chứa đầy vitamin.', 'Fanta cam đác lạnh, vị cam tự nhiên, chứa vitamin C.', 20000, NULL, '["\/images\/fanta-cam.jpg"]'::jsonb, 2, 4.3, 145, false, true, 2, NULL, false, false),
('Nước Chanh Tươi', 'Nước chanh tươi vắt, không đường.', 'Nước chanh vắt tươi từ chanh ta thật, lạnh đá, giải khát tự nhiên.', 25000, NULL, '["\/images\/nuoc-chanh.jpg"]'::jsonb, 2, 4.6, 167, true, true, 3, NULL, true, false),
('Nước Cam Tươi', 'Nước cam vắt tươi 100% không đường.', 'Nước cam vắt từ cam tươi, không pha nước, giàu vitamin C.', 35000, 30000, '["\/images\/nuoc-cam-tuoi.jpg"]'::jsonb, 2, 4.7, 189, true, true, 5, NULL, false, false),

-- TRÀ SỮA (5 items)
('Trà Sữa Truyền Thống', 'Trà sữa cổ điển với trà đen và sữa đặc.', 'Trà sữa được pha từ trà đen đậm, sữa đặc, nước tăm, đá lạnh, vị ngon lịch sử.', 40000, 35000, '["\/images\/tra-sua-truyen-thong.jpg"]'::jsonb, 2, 4.8, 256, true, true, 8, 'Thêm pearl', false, false),
('Trà Sữa Matcha', 'Trà sữa Matcha xanh tươi mới.', 'Trà Matcha xanh nguyên chất, pha sữa tươi, bột trà Nhật đặc sắc.', 45000, 40000, '["\/images\/tra-sua-matcha.jpg"]'::jsonb, 2, 4.9, 178, true, true, 8, NULL, true, false),
('Trà Sữa Taro', 'Trà sữa taro tím đẹp mắt, thơm ngon.', 'Trà sữa khoai tím tươi, vị mềm mịn, pha sữa tươi, hương thơm đặc biệt.', 42000, NULL, '["\/images\/tra-sua-taro.jpg"]'::jsonb, 2, 4.7, 142, false, true, 8, NULL, false, false),
('Trà Sữa Dâu', 'Trà sữa dâu tây ngọt ngon.', 'Trà sữa kết hợp với nước dâu tây tươi, sữa tươi, vị dâu tinh tế.', 42000, NULL, '["\/images\/tra-sua-dau.jpg"]'::jsonb, 2, 4.6, 128, false, true, 8, NULL, true, false),
('Trà Sữa Cam', 'Trà sữa cam, vị chua chua ngọt ngọt.', 'Trà sữa pha với vị cam tươi, sữa đặc, cân bằng vị chua ngọt hoàn hảo.', 41000, NULL, '["\/images\/tra-sua-cam.jpg"]'::jsonb, 2, 4.5, 115, false, true, 8, NULL, false, false),

-- SINH TỐ (5 items)
('Sinh Tố Dâu', 'Sinh tố dâu tây tươi, đầy chất dinh dưỡng.', 'Sinh tố dâu tây xay mịn, kèm mật ong, sữa tươi, đá lạnh.', 38000, NULL, '["\/images\/sinh-to-dau.jpg"]'::jsonb, 2, 4.7, 156, true, true, 6, 'Mật ong thêm', false, false),
('Sinh Tố Chuối', 'Sinh tố chuối mềm mịn, bổ sung năng lượng.', 'Sinh tố chuối chín vàng, pha sữa tươi, mật ong, giàu kali.', 35000, NULL, '["\/images\/sinh-to-chuoi.jpg"]'::jsonb, 2, 4.6, 134, false, true, 5, NULL, false, false),
('Sinh Tố Xoài', 'Sinh tố xoài vàng thơm ngon, vị ngọt tự nhiên.', 'Sinh tố xoài chín ngọt, pha sữa tươi, mật ong, vị mềm mịn.', 38000, NULL, '["\/images\/sinh-to-xoai.jpg"]'::jsonb, 2, 4.8, 167, true, true, 6, NULL, false, false),
('Sinh Tố Ổi', 'Sinh tố ổi đỏ tươi, giàu vitamin C.', 'Sinh tố ổi đỏ xây mịn, pha sữa tươi, mật ong, bổ dưỡng.', 36000, NULL, '["\/images\/sinh-to-oi.jpg"]'::jsonb, 2, 4.5, 121, false, true, 5, NULL, true, false),
('Sinh Tố Dừa Dâu', 'Sinh tố dừa dâu, vị truyền thống Á Đông.', 'Sinh tố kết hợp dâu tây, sữa dừa, dừa tươi, vị lạ miệng thơm ngon.', 40000, NULL, '["\/images\/sinh-to-dua-dau.jpg"]'::jsonb, 2, 4.6, 109, false, true, 7, NULL, true, false),

-- CHÈ (5 items)
('Chè Ba Màu', 'Chè ba màu truyền thống Việt Nam.', 'Chè ba màu với đậu xanh, đậu đỏ, nước đường, kèm lạp xưởng, da dâu.', 30000, NULL, '["\/images\/che-ba-mau.jpg"]'::jsonb, 2, 4.7, 189, true, true, 10, NULL, false, false),
('Chè Đậu Xanh', 'Chè đậu xanh lạnh mát, bổ dưỡng.', 'Chè đậu xanh nấu mềm mịn, nước đường mát, kèm lạp xưởng giòn.', 28000, NULL, '["\/images\/che-dau-xanh.jpg"]'::jsonb, 2, 4.6, 145, false, true, 12, NULL, false, false),
('Chè Khoai Môn', 'Chè khoai môn tím, vị bùi ngọt.', 'Chè khoai môn tím nấu mềm, nước đường cân bằng, thơm ngon.', 30000, NULL, '["\/images\/che-khoai-mon.jpg"]'::jsonb, 2, 4.5, 128, false, true, 12, NULL, false, false),
('Chè Bắp', 'Chè bắp vàng ngô, vị ngọt tự nhiên.', 'Chè bắp nấu mềm, nước đường, kèm lạp xưởng, vị bùi bùi ngon.', 28000, NULL, '["\/images\/che-bap.jpg"]'::jsonb, 2, 4.4, 98, false, true, 11, NULL, false, false),
('Chè Dâu Đen', 'Chè dâu đen tươi, giàu chất chống oxy hóa.', 'Chè dâu đen xay mịn, nước đường, kèm da dâu, bổ dưỡng tuyệt vời.', 32000, NULL, '["\/images\/che-dau-den.jpg"]'::jsonb, 2, 4.6, 112, false, true, 10, NULL, false, false);

-- MÓN TRÁNG MIỆNG (20 items) - Section ID: 3
INSERT INTO menu_items (name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available, prep_time, notes, is_new, is_soldout) VALUES
-- BÁNH NGỌT (10 items)
('Bánh Chocolate', 'Bánh chocolate đen mềm, vị đắng nhẹ.', 'Bánh chocolate làm từ cacao nguyên chất, mịn mềm, phủ chocolate đen bóng.', 45000, 40000, '["\/images\/banh-chocolate.jpg"]'::jsonb, 3, 4.8, 234, true, true, 0, NULL, false, false),
('Bánh Carrot Cake', 'Bánh cà rốt mềm, kem cheese ngon.', 'Bánh cà rốt chứng mềm, phủ kem cheese tươi, trang trí hạt dẻ.', 48000, 42000, '["\/images\/banh-carrot.jpg"]'::jsonb, 3, 4.7, 167, true, true, 0, NULL, false, false),
('Bánh Phô Mai', 'Bánh phô mai New York cổ điển.', 'Bánh phô mai làm từ cream cheese Mỹ, vị creamy, đảo được khoảng 24h.', 52000, 45000, '["\/images\/banh-pho-mai.jpg"]'::jsonb, 3, 4.9, 289, true, true, 0, 'Cần tủ lạnh', false, false),
('Bánh Tiramisu', 'Bánh Tiramisu Ý cổ điển, vị cà phê.', 'Bánh tiramisu với mascarpone, ngam trong cà phê đen, phủ bột ca cao.', 50000, NULL, '["\/images\/banh-tiramisu.jpg"]'::jsonb, 3, 4.8, 178, true, true, 0, NULL, false, false),
('Bánh Matcha', 'Bánh Matcha xanh, vị trà tinh tế.', 'Bánh Matcha Nhật Bản, vị trà xanh tinh tế, mềm mịn, thơm ngon.', 48000, NULL, '["\/images\/banh-matcha.jpg"]'::jsonb, 3, 4.6, 145, false, true, 0, NULL, true, false),
('Bánh Dâu Tây', 'Bánh dâu tây tươi, kem béo.', 'Bánh sponge mềm, cream tươi, dâu tây tươi, vị ngọt tự nhiên.', 50000, 45000, '["\/images\/banh-dau-tay.jpg"]'::jsonb, 3, 4.7, 198, true, true, 0, NULL, false, false),
('Bánh Nước Cốt Dừa', 'Bánh với nước cốt dừa, mộc mạc ngon.', 'Bánh sponge chứng nước cốt dừa, vị dừa thơm, kem tươi nhẹ.', 45000, NULL, '["\/images\/banh-nuoc-cot-dua.jpg"]'::jsonb, 3, 4.5, 134, false, true, 0, NULL, false, false),
('Bánh Chanh', 'Bánh chanh tươi sảng khoái, vị chua ngọt.', 'Bánh sponge chanh tươi, vị chua nhẹ ngọt cân bằng, frosting chanh.', 46000, NULL, '["\/images\/banh-chanh.jpg"]'::jsonb, 3, 4.6, 121, false, true, 0, NULL, true, false),
('Bánh Red Velvet', 'Bánh Red Velvet đỏ sang trọng.', 'Bánh đỏ mịn mềm, kem cheese phủ trắng sang trọng, vị nhẹ đặc biệt.', 50000, NULL, '["\/images\/banh-red-velvet.jpg"]'::jsonb, 3, 4.7, 156, false, true, 0, NULL, false, false),
('Bánh Trà Sữa', 'Bánh Trà sữa, vị trà đặc trưng.', 'Bánh kết hợp vị trà sữa yêu thích, sponge mềm, kem trà sữa béo.', 48000, NULL, '["\/images\/banh-tra-sua.jpg"]'::jsonb, 3, 4.5, 143, false, true, 0, NULL, false, false),

-- TRÁNG MIỆNG KHÁC (10 items)
('Choco Chip Cookies', 'Bánh quy socola giòn ngon.', 'Bánh quy bơ giòn với chocolate chip, vị khoai và chocolate hài hòa.', 35000, NULL, '["\/images\/cookies-chocolate.jpg"]'::jsonb, 3, 4.6, 167, true, true, 0, NULL, false, false),
('Macarons Pháp', 'Macarons Pháp đẹp mắt, vị tinh tế.', 'Macarons làm từ lòng trắng trứng, vị đậm, nhân nhiều loại: dâu, pistachio, matcha.', 55000, 50000, '["\/images\/macarons.jpg"]'::jsonb, 3, 4.8, 203, true, true, 0, NULL, false, false),
('Éclair Chocolate', 'Éclairs bánh su kem phủ chocolate.', 'Bánh su kem nhân vanilla, phủ ganache chocolate đen, vị Pháp cổ điển.', 42000, NULL, '["\/images\/eclair.jpg"]'::jsonb, 3, 4.7, 178, false, true, 0, NULL, false, false),
('Flan Caramel', 'Flan caramel truyền thống, béo ngon.', 'Flan trứng nấu mềm, phủ sốt caramel ngọt, hương vanilla thơm ngon.', 38000, NULL, '["\/images\/flan-caramel.jpg"]'::jsonb, 3, 4.6, 145, true, true, 0, NULL, false, false),
('Mousse Sôcôla', 'Mousse sôcôla nhẹ mềm, vị cacao.', 'Mousse sôcôla Belgium, mịn mềm, béo ngon, vị cacao đậm đà.', 40000, NULL, '["\/images\/mousse-socola.jpg"]'::jsonb, 3, 4.8, 134, true, true, 0, NULL, false, false),
('Panna Cotta', 'Panna Cotta Ý, vị nước hoa thanh thoát.', 'Panna Cotta kem tươi với hương vanilla, vị thanh thoát, phủ berry.', 42000, NULL, '["\/images\/panna-cotta.jpg"]'::jsonb, 3, 4.7, 121, false, true, 0, NULL, false, false),
('Crème Brûlée', 'Crème Brûlée vàng giòn, béo ngon.', 'Crème brûlée trứng kem, nước caramel giòn, phá nhìu khi ăn.', 45000, NULL, '["\/images\/creme-brulee.jpg"]'::jsonb, 3, 4.9, 167, true, true, 0, NULL, false, false),
('Bánh Mille Feuille', 'Bánh mille feuille lớp bánh ngàn tầng.', 'Bánh puff pastry lớp mỏng, kem pastry cream, vị giòn nhẹ sang.', 48000, NULL, '["\/images\/mille-feuille.jpg"]'::jsonb, 3, 4.6, 128, false, true, 0, NULL, false, false),
('Brownie Walnut', 'Bánh brownie chocolate đậm, kèm quả óc chó.', 'Brownie chocolate Bỉ đậm, kèm óc chó, giòn ngoài mềm trong.', 38000, NULL, '["\/images\/brownie-walnut.jpg"]'::jsonb, 3, 4.7, 145, false, true, 0, NULL, false, true),
('Pudding Trà Matcha', 'Pudding Matcha xanh, vị trà tinh tế.', 'Pudding Matcha Nhật, vị trà xanh nhẹ nhàng, bên trên kèm kem whipped.', 40000, NULL, '["\/images\/pudding-matcha.jpg"]'::jsonb, 3, 4.5, 112, false, true, 0, NULL, true, false);

-- =====================================================
-- LINK MENU ITEMS VỚI CATEGORIES
-- =====================================================

-- NƯỚC NGỌT
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Coca Cola' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sprite' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Fanta Cam' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Nước Chanh Tươi' AND mc.name = 'Nước Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Nước Cam Tươi' AND mc.name = 'Nước Ngọt';

-- TRÀ SỮA
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Truyền Thống' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Matcha' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Taro' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Dâu' AND mc.name = 'Trà Sữa';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Trà Sữa Cam' AND mc.name = 'Trà Sữa';

-- SINH TỐ
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Dâu' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Chuối' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Xoài' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Ổi' AND mc.name = 'Sinh Tố';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Sinh Tố Dừa Dâu' AND mc.name = 'Sinh Tố';

-- CHÈ
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Ba Màu' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Đậu Xanh' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Khoai Môn' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Bắp' AND mc.name = 'Chè';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Chè Dâu Đen' AND mc.name = 'Chè';

-- BÁNH NGỌT
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Chocolate' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Carrot Cake' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Phô Mai' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Tiramisu' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Matcha' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Dâu Tây' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Nước Cốt Dừa' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Chanh' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Red Velvet' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Trà Sữa' AND mc.name = 'Bánh Ngọt';

-- TRÁNG MIỆNG KHÁC
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Choco Chip Cookies' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Macarons Pháp' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Éclair Chocolate' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Flan Caramel' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Mousse Sôcôla' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Panna Cotta' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Crème Brûlée' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mille Feuille' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Brownie Walnut' AND mc.name = 'Bánh Ngọt';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Pudding Trà Matcha' AND mc.name = 'Bánh Ngọt';
