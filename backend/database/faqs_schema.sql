-- Bảng faqs
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hàm tự động cập nhật updated_at nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_faqs_updated_at'
    ) THEN
        CREATE TRIGGER update_faqs_updated_at
            BEFORE UPDATE ON faqs
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Chèn dữ liệu mẫu
INSERT INTO faqs (question, answer, is_active, sort_order) VALUES
('Nhà hàng mở cửa vào những khung giờ nào?', 'Chúng tôi phục vụ từ 10:00 sáng đến 22:00 tối mỗi ngày, kể cả Chủ Nhật và ngày Lễ.', true, 1),
('Tôi có thể đặt bàn trước bao lâu?', 'Bạn có thể đặt bàn trước từ 1 đến 30 ngày. Đặc biệt vào cuối tuần hoặc ngày lễ, chúng tôi khuyến khích bạn đặt trước ít nhất 3 ngày.', true, 2),
('Nhà hàng có chỗ đỗ xe ô tô không?', 'Có, nhà hàng có bãi đỗ xe rộng rãi dành cho cả ô tô và xe máy ngay trước cửa, hoàn toàn miễn phí và có bảo vệ 24/7.', true, 3),
('Nhà hàng có phục vụ món ăn chay/vegan không?', 'Chúng tôi có một thực đơn riêng biệt gồm các món chay và thuần chay thơm ngon, đảm bảo đầy đủ dinh dưỡng và hương vị.', true, 4),
('Tôi có thể thay đổi hoặc hủy bàn đã đặt được không?', 'Quý khách hoàn toàn có thể thay đổi hoặc hủy bàn miễn phí trước 2 tiếng so với giờ đặt. Vui lòng liên hệ qua hotline hoặc thao tác trực tiếp trên website.', true, 5)
ON CONFLICT DO NOTHING;
