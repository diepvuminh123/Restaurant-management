
-- TẠO TABLE
CREATE TABLE IF NOT EXISTS restaurant_table (
       table_id SERIAL PRIMARY KEY,
       capacity INT NOT NULL CHECK (capacity > 0),
       table_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
              CHECK (table_status IN ('RESERVED', 'AVAILABLE', 'OCCUPIED')), 
              --Trạng thái của bàn
              --Status : reserved: Bàn đã có người đặt
              --available: Bàn trống, khách có thể chọn
              --occupied: Bàn đang có khách || tạm thời ngưng phục vụ

       position_x INT NOT NULL CHECK (position_x >= 0), --Vị trí của bàn trên map theo trục Ox
       position_y INT NOT NULL CHECK (position_y >= 0), --Vị trí của bàn trên map theo trục Oy
       restaurant_note VARCHAR(255) --Ghi chú từ phía nhà hàng
);



-- TẠO INDEX
CREATE INDEX IF NOT EXISTS idx_table_position ON restaurant_table (position_x, position_y);
CREATE INDEX IF NOT EXISTS idx_table_status ON restaurant_table(table_status);
CREATE INDEX IF NOT EXISTS idx_table_capacity ON restaurant_table(capacity);
