-- TẠO TABLE_STATUS_TYPE CHO TABLE_STATUS
CREATE TYPE RESTAURANT_TABLE_STATUS AS ENUM ('RESERVED', 'AVAILABLE', 'OCCUPIED')
       --Status : reserved: Bàn đã có người đặt
       --available: Bàn trống, khách có thể chọn
       --occupied: Bàn đang có khách || tạm thời ngưng phục vụ

-- TẠO TABLE
CREATE TABLE IF NOT EXISTS restaurant_table {
       table_id SERIAL PRIMARY KEY,
       capacity INT NOT NULL CHECK (capacity > 0),
       table_status RESTAURANT_TABLE_STATUS NOT NULL DEFAULT 'AVAILABLE', --Trạng thái của bàn

       position_x INT NOT NULL CHECK (position_x >= 0) --Vị trí của bàn trên map theo trục Ox
       position_y INT NOT NULL CHECK (position_y >= 0) --Vị trí của bàn trên map theo trục Oy
       restaurant_note VARCHAR(255) --Ghi chú từ phía nhà hàng
}



-- TẠO INDEX
CREATE INDEX idx_table_status ON restaurant_table(table_status)
CREATE INDEX idx_table_capacity ON restaurant_table(capacity)

