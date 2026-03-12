-- TẠO TABLE_STATUS_TYPE CHO TABLE_STATUS
CREATE TYPE RESTAURANT_TABLE_STATUS AS ENUM ('RESERVED', 'AVAILABLE', 'OCCUPIED')
       --Status : reserved: Bàn đã có người đặt
       --available: Bàn trống, khách có thể chọn
       --occupied: Bàn đang có khách || tạm thời ngưng phục vụ

-- TẠO TABLE
CREATE TABLE IF NOT EXISTS restaurant_table (
       table_id SERIAL PRIMARY KEY,
       capacity INT NOT NULL CHECK (capacity > 0),
       table_status RESTAURANT_TABLE_STATUS NOT NULL DEFAULT 'AVAILABLE', --Trạng thái của bàn

       position_x INT NOT NULL CHECK (position_x >= 0), --Vị trí của bàn trên map theo trục Ox
       position_y INT NOT NULL CHECK (position_y >= 0), --Vị trí của bàn trên map theo trục Oy
       restaurant_note VARCHAR(255) --Ghi chú từ phía nhà hàng
)



-- TẠO INDEX
CREATE INDEX dx_table_position ON restaurant_table (position_x, position_y)
CREATE INDEX idx_table_status ON restaurant_table(table_status)
CREATE INDEX idx_table_capacity ON restaurant_table(capacity)



-- VIEW: AVAILABLE AT REALTIME : Bàn đang trống theo thời gian thực (Tại chính thời điểm truy vấn)
-- TH1: Bàn ở trạng thái 'available' theo thời gian đang xét
-- TH2: Bàn có Reservation time >= Now() (Nhưng cần hiển thị khoảng thời gian từ now -> reservation)

CREATE VIEW available_table_now AS

WITH next_reservation AS (
    SELECT 
        table_id,
        MIN(reservation_time) AS next_reservation_time
    FROM reservation
    WHERE reservation_state = 'CONFIRM'
      AND reservation_time > NOW()
      AND reservation_time >= CURRENT_DATE
      AND reservation_time < CURRENT_DATE + INTERVAL '1 day'
    GROUP BY table_id
)

SELECT 
    t.table_id,
    t.capacity,
    nr.next_reservation_time,

    EXTRACT(EPOCH FROM (
        nr.next_reservation_time - NOW()
    )) / 60 AS minutes_until_next -- Tính khoảng thời gian từ now -> nearest_reservation_time

FROM restaurant_table t

LEFT JOIN next_reservation nr
ON t.table_id = nr.table_id

WHERE t.table_status != 'OCCUPIED';

-- VIEW: RESERVATION BOOKING IN DAY
CREATE VIEW reservation_in_day AS 
    SELECT
        t.table_id,
        t.capacity,
        r.reservation_id,
        r.reservation_time,
        r.reservation_state 
    FROM restaurant_table t 
    LEFT JOIN reservation r 
    ON t.table_id = r.table_id
    AND r.reservation_time >= CURRENT_DATE
    AND r.reservation_time < CURRENT_DATE + INTERVAL '1 day';
         


-- TRIGGER: CẬP NHẬT TRẠNG THÁI BÀN THEO TRẠNG THÁI ĐẶT BÀN
CREATE OR REPLACE FUNCTION update_table_status()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.reservation_state = 'ON_SERVING' THEN
        UPDATE restaurant_table
        SET table_status = 'OCCUPIED'
        WHERE table_id = NEW.table_id;

    ELSIF NEW.reservation_state IN ('CANCELED', 'COMPLETED') THEN
        UPDATE restaurant_table
        SET table_status = 'AVAILABLE'
        WHERE table_id = NEW.table_id;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- TRIGGER KÍCH HOẠT TRIGGER KHI CÓ SỰ THAY ĐỔI TRẠNG THÁI ĐẶT BÀN
CREATE TRIGGER trg_update_table_status
AFTER UPDATE ON reservation
FOR EACH ROW
WHEN (OLD.reservation_state IS DISTINCT FROM NEW.reservation_state)
EXECUTE FUNCTION update_table_status();
