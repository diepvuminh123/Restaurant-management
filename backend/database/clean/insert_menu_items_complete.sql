-- =====================================================
-- INSERT 20 MENU ITEMS CHO SECTION "MÓN CHÍNH"
-- =====================================================
-- Lưu ý: Section "Món Chính" có ID = 1
-- Các category: Phở (1), Cơm (2), Bún (3), Bánh Mì (4)

INSERT INTO menu_items (name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available) VALUES

-- PHỞ (5 items)
('Phở Bò Nạm', 'Phở bò nạm mềm với nước dùng đặc biệt.', 'Phở bò nạm nấu từ xương ống, bò nạm luộc mềm, nước dùng ninh 12 tiếng từ xương và thịt.', 90000, 75000, '["\/images\/pho-bo-nam.jpg"]'::jsonb, 1, 4.8, 156, true, true),
('Phở Bò Tái', 'Phở bò tái tươi ngon với nước dùng trong.', 'Phở bò tái nấu tới 12 tiếng từ xương, thịt bò tái chất lượng cao, nước dùng thơm ngon.', 85000, 70000, '["\/images\/pho-bo-tai.jpg"]'::jsonb, 1, 4.9, 189, true, true),
('Phở Gà Xé', 'Phở gà xé mềm với nước dùng thanh.', 'Phở gà ta luộc và xé vụn, nước dùng gà thanh ngọt, kèm thang rau thơm.', 75000, NULL, '["\/images\/pho-ga-xe.jpg"]'::jsonb, 1, 4.7, 145, false, true),
('Phở Bò Viên', 'Phở bò viên đặc biệt, nước dùng chua cay.', 'Phở với bò viên tươi, nước dùng hơi chua cay, thêm tỏi muối cay nồn.', 80000, NULL, '["\/images\/pho-bo-vien.jpg"]'::jsonb, 1, 4.6, 112, false, true),
('Phở Hủ Tiếu Gà', 'Hủ tiếu gà với thang rau tươi.', 'Hủ tiếu nấu từ gà ta, nước dùng thanh, kèm các loại thang rau tươi, thơm ngon.', 70000, NULL, '["\/images\/hu-tieu-ga.jpg"]'::jsonb, 1, 4.5, 98, false, true),

-- CƠM (5 items)
('Cơm Tấm Sườn Nướng', 'Cơm tấm sườn nướng thơm lừng.', 'Cơm tấm ngon với sườn heo nướng vàng, thơm lừng, kèm trứng ốp, dưa chuối.', 68000, 55000, '["\/images\/com-tam-suon.jpg"]'::jsonb, 1, 4.8, 167, true, true),
('Cơm Gà Hải Nam Cơm Tím', 'Cơm gà Hải Nam, nấu bằng cơm tím.', 'Gà luộc mềm, cơm tím thơm, nước gà đậm đà, kèm xốt ớt đặc biệt.', 72000, 58000, '["\/images\/com-ga-tim.jpg"]'::jsonb, 1, 4.9, 203, true, true),
('Cơm Dương Châu', 'Cơm chiên dương châu với tôm thịt trứng.', 'Cơm chiên thơm với tôm, thịt, trứng, ngô, peas, cà chua, dùng với canh hoặc soup.', 65000, NULL, '["\/images\/com-duong-chau.jpg"]'::jsonb, 1, 4.7, 134, false, true),
('Cơm Sườn Bì Chả', 'Cơm sườn nướng, bì, chả hấp.', 'Cơm tấm với sườn nướng, bì giòn, chả hấp mềm, trứng, dưa chuối, kèm nước mắm.', 70000, NULL, '["\/images\/com-suon-bi-cha.jpg"]'::jsonb, 1, 4.8, 178, true, true),
('Cơm Chiên Tôm', 'Cơm chiên tôm với trứng và hành.', 'Cơm chiên ngon với tôm tươi, trứng gà, hành tím, mùi, kèm canh chua.', 62000, NULL, '["\/images\/com-chien-tom.jpg"]'::jsonb, 1, 4.6, 89, false, true),

-- BÚN (5 items)
('Bún Chả Hà Nội Đặc Biệt', 'Bún chả truyền thống, thịt nướng thơm.', 'Bún tươi, thịt nướng thơm, chả viên, nước mắm chua ngọt đặc trưng, kèm rau sống.', 75000, 65000, '["\/images\/bun-cha-hanoi.jpg"]'::jsonb, 1, 4.8, 156, true, true),
('Bún Thang Gà', 'Bún thang gà nóng với gà và cà chua.', 'Bún tươi, canh nước gà thơm, gà xé mềm, cà chua, trứng cút, hành hoa.', 68000, NULL, '["\/images\/bun-thang-ga.jpg"]'::jsonb, 1, 4.7, 123, false, true),
('Bún Cua', 'Bún cua ngon với cua biển tươi.', 'Bún tươi, canh nước cua đậm, cua biển tươi, trứng cua, hành hoa, thân cua.', 95000, 80000, '["\/images\/bun-cua.jpg"]'::jsonb, 1, 4.9, 145, true, true),
('Bún Mắm Tôm', 'Bún mắm tôm cay cay thơm ngon.', 'Bún tươi, nước mắm tôm đậm, tôm tươi, mồng tơi, dưa chuối, ớt cay.', 65000, NULL, '["\/images\/bun-mam-tom.jpg"]'::jsonb, 1, 4.5, 92, false, true),
('Bún Ốc', 'Bún ốc nóng hôi, nước dùng thơm.', 'Bún tươi, nước ốc đậm mùi, ốc nước sạch tươi, rau sống, ớt, hành.', 72000, NULL, '["\/images\/bun-oc.jpg"]'::jsonb, 1, 4.6, 107, false, true),

-- BÁNH MÌ (5 items)
('Bánh Mì Thịt Nướng', 'Bánh mì thịt nướng, chả, pâté.', 'Bánh mì ngoài giòn trong mềm, thịt nướng thơm, chả, pâté, dưa chuối, hành, ớt.', 50000, 40000, '["\/images\/banh-mi-thit.jpg"]'::jsonb, 1, 4.7, 198, true, true),
('Bánh Mì Đặc Biệt', 'Bánh mì đặc biệt với tôm, thịt, chả.', 'Bánh mì thơm với tôm, thịt, chả, pâté, trứng, dưa, hành, ớt, sốt đặc biệt.', 55000, 45000, '["\/images\/banh-mi-dac-biet.jpg"]'::jsonb, 1, 4.8, 212, true, true),
('Bánh Mì Chả Cua', 'Bánh mì chả cua tươi ngon.', 'Bánh mì giòn, chả cua tươi, pâté, dưa chuối, hành tím, ớt, sốt cà chua.', 52000, NULL, '["\/images\/banh-mi-cha-cua.jpg"]'::jsonb, 1, 4.6, 145, false, true),
('Bánh Mì Pâté', 'Bánh mì pâté, chả, rau sống.', 'Bánh mì ngoài giòn, pâté mịn, chả ngon, dưa chuối, hành hoa, ớt cay.', 48000, NULL, '["\/images\/banh-mi-pate.jpg"]'::jsonb, 1, 4.5, 121, false, true),
('Bánh Mì Xúc Xích', 'Bánh mì xúc xích nướng ngon.', 'Bánh mì thơm, xúc xích nướng, pâté, chả, dưa, hành, ớt, sốt mayonnaise.', 50000, NULL, '["\/images\/banh-mi-xuc-xich.jpg"]'::jsonb, 1, 4.6, 156, false, true);

-- =====================================================
-- LINK MENU ITEMS VỚI CATEGORIES
-- =====================================================

-- PHỞ
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Bò Nạm' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Bò Tái' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Gà Xé' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Bò Viên' AND mc.name = 'Phở';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Phở Hủ Tiếu Gà' AND mc.name = 'Phở';

-- CƠM
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Tấm Sườn Nướng' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Gà Hải Nam Cơm Tím' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Dương Châu' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Sườn Bì Chả' AND mc.name = 'Cơm';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Cơm Chiên Tôm' AND mc.name = 'Cơm';

-- BÚN
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Chả Hà Nội Đặc Biệt' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Thang Gà' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Cua' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Mắm Tôm' AND mc.name = 'Bún';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bún Ốc' AND mc.name = 'Bún';

-- BÁNH MÌ
INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Thịt Nướng' AND mc.name = 'Bánh Mì';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Đặc Biệt' AND mc.name = 'Bánh Mì';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Chả Cua' AND mc.name = 'Bánh Mì';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Pâté' AND mc.name = 'Bánh Mì';

INSERT INTO menu_item_categories (menu_item_id, category_id)
SELECT mi.id, mc.id FROM menu_items mi, menu_categories mc
WHERE mi.name = 'Bánh Mì Xúc Xích' AND mc.name = 'Bánh Mì';
