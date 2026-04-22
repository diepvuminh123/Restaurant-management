INSERT INTO menu_categories (name, section_id)
SELECT 'Phở', id FROM menu_sections WHERE name = 'Món Chính'
UNION ALL
SELECT 'Cơm', id FROM menu_sections WHERE name = 'Món Chính'
UNION ALL
SELECT 'Bún', id FROM menu_sections WHERE name = 'Món Chính'
UNION ALL
SELECT 'Bánh Mì', id FROM menu_sections WHERE name = 'Món Chính'
UNION ALL
SELECT 'Nước Ngọt', id FROM menu_sections WHERE name = 'Đồ Uống'
UNION ALL
SELECT 'Trà Sữa', id FROM menu_sections WHERE name = 'Đồ Uống'
UNION ALL
SELECT 'Sinh Tố', id FROM menu_sections WHERE name = 'Đồ Uống'
UNION ALL
SELECT 'Chè', id FROM menu_sections WHERE name = 'Món Tráng Miệng'
UNION ALL
SELECT 'Bánh Ngọt', id FROM menu_sections WHERE name = 'Món Tráng Miệng';

INSERT INTO menu_items
(name, description_short, description_full, price, sale_price, images, section_id, rating_avg, rating_count, is_popular, available)

SELECT 
'Phở Bò Đặc Biệt',
'Phở bò truyền thống với nước dùng ninh xương.',
'Phở bò nấu với nước dùng ninh 12 tiếng, thịt bò tươi.',
85000,
NULL,
'["/images/pho-bo.jpg", "/images/pho-bo-2.jpg"]'::jsonb,
id,
4.9,
128,
true,
true
FROM menu_sections WHERE name = 'Món Chính'

UNION ALL

SELECT 
'Cơm Tấm Sườn Bì Chả',
'Cơm tấm với sườn nướng, bì và chả hấp.',
'Cơm tấm truyền thống Sài Gòn với sườn nướng thơm ngon, bì giòn và chả hấp mềm.',
65000,
NULL,
'["/images/com-tam.jpg"]'::jsonb,
id,
4.8,
95,
true,
true
FROM menu_sections WHERE name = 'Món Chính'

UNION ALL

SELECT 
'Phở Gà',
'Phở gà thanh đạm với nước dùng trong.',
'Phở gà nấu từ xương gà ta, thịt gà tươi, nước dùng thanh ngọt.',
70000,
NULL,
'["/images/pho-ga.jpg"]'::jsonb,
id,
4.7,
85,
true,
true
FROM menu_sections WHERE name = 'Món Chính'

UNION ALL

SELECT 
'Bún Chả Hà Nội',
'Bún chả truyền thống Hà Nội.',
'Bún chả với thịt nướng thơm, chả viên và nước mắm chua ngọt đặc trưng.',
75000,
NULL,
'["/images/bun-cha.jpg"]'::jsonb,
id,
4.8,
112,
true,
true
FROM menu_sections WHERE name = 'Món Chính'

UNION ALL

SELECT 
'Cơm Gà Xối Mỡ',
'Cơm gà Hải Nam thơm ngon.',
'Cơm gà nấu với nước gà, thịt gà luộc mềm, kèm nước chấm đặc biệt.',
60000,
NULL,
'["/images/com-ga.jpg"]'::jsonb,
id,
4.6,
78,
false,
true
FROM menu_sections WHERE name = 'Món Chính';