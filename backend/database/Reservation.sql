-- TẠO RESERVATION_STATE_TYPE CHO RESERVATION_STATE
CREATE TYPE RESERVATION_STATUS_TYPE AS ENUM ('CONFIRM', 'CANCELED', 'ON SERVING', 'COMPLETED')
  -- CONFIRM: kHÁCH ĐÃ ĐẶT BÀN NHƯNG CHƯA ĐẾN/ CHƯA TỚI GIỜ PHỤC VỤ.
  -- CANCELED: KHÁCH HỦY ĐẶT BÀN
  -- ON SERVING: KHÁCH ĐÃ ĐẾN VÀ ĐANG ĐƯỢC PHỤC VỤ
  -- COMPLETED: KHÁCH ĐÃ ĂN XONG

-- TẠO TABLE 
CREATE TABLE IF NOT EXISTS reservation (
  reservation_id SERIAL PRIMARY KEY NOT NULL,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL, -- TRƯỜNG HỢP ĐẶT BÀN MÀ KHÔNG ĐĂNG NHẬP VÔ HỆ THỐNG
  table_id SERIAL NOT NULL REFERENCES restaurant_table(table_id) ON DELETE CASCADE,
  number_of_guests INT NOT NULL CHECK (number_of_guests <= 0)
  reservation_state RESTAURANT_TABLE_STATUS NOT NULL DEFAULT 'CONFIRM'
  
  reservation_time TIMPESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note VARCHAR(255) -- Khách ghi chú khi đặt bàn 
  restaurant_note VARCHAR(255) REFERENCES restaurant_table(restaurant_note) -- Ghi chú từ phía nhà hàng (nếu có)
)



--TẠO INDEX
CREATE INDEX idx_reservation_time ON reservation(reservation_time) -- Thống kê đặt bàn theo giờ
CREATE INDEX idx_reservation_state ON reservation(reservation_state) --Thống kê bàn theo từng trạng thái theo thời gian thực 
