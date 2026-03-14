-- RESERVATION: trạng thái đặt bàn được quản lý bằng CHECK constraint (không dùng ENUM để script có thể chạy lại)

CREATE TABLE IF NOT EXISTS reservation (
  reservation_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- TRƯỜNG HỢP ĐẶT BÀN MÀ KHÔNG ĐĂNG NHẬP VÔ HỆ THỐNG
  table_id INT NOT NULL REFERENCES restaurant_table(table_id) ON DELETE CASCADE,
  number_of_guests INT NOT NULL CHECK (number_of_guests > 0),
  reservation_state  VARCHAR(30) NOT NULL DEFAULT 'CONFIRM' 
    CHECK (reservation_state IN ('CONFIRM', 'CANCELED', 'ON_SERVING', 'COMPLETED')),
    --CONFIRM: Đặt bàn đã được xác nhận
    --CANCELED: Đặt bàn đã bị hủy bởi khách hoặc nhà hàng
    --ON_SERVING: Bàn đang được phục vụ (Khách đã đến và đang dùng bữa)
    --COMPLETED: Bàn đã hoàn thành (Khách đã dùng bữa xong và rời đi)
  reservation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note VARCHAR(255), -- Khách ghi chú khi đặt bàn 
  restaurant_note VARCHAR(255) -- Ghi chú từ phía nhà hàng (nếu có)
);



--TẠO INDEX
CREATE INDEX IF NOT EXISTS idx_reservation_table_time ON reservation(table_id, reservation_time); -- Thống kê đặt bàn theo giờ
CREATE INDEX IF NOT EXISTS idx_reservation_state ON reservation(reservation_state); --Thống kê bàn theo từng trạng thái theo thời gian thực 


-- VIEW: AVAILABLE AT REALTIME : Bàn đang trống theo thời gian thực (Tại chính thời điểm truy vấn)
-- TH1: Bàn ở trạng thái 'available' theo thời gian đang xét
-- TH2: Bàn có Reservation time >= Now() (Nhưng cần hiển thị khoảng thời gian từ now -> reservation)

CREATE OR REPLACE VIEW available_table_now AS

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
CREATE OR REPLACE VIEW reservation_in_day AS 
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


DROP TRIGGER IF EXISTS trg_update_table_status ON reservation;
DROP FUNCTION IF EXISTS update_table_status();
