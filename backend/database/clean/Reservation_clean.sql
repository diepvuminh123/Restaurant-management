CREATE TABLE IF NOT EXISTS reservation (
  reservation_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  table_id INT NOT NULL REFERENCES restaurant_table(table_id) ON DELETE CASCADE,
  number_of_guests INT NOT NULL CHECK (number_of_guests > 0),
  reservation_state VARCHAR(30) NOT NULL DEFAULT 'CONFIRM'
    CHECK (reservation_state IN ('CONFIRM', 'CANCELED', 'ON_SERVING', 'COMPLETED')),
  reservation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note VARCHAR(255),
  restaurant_note VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_reservation_table_time ON reservation(table_id, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservation_state ON reservation(reservation_state);

CREATE OR REPLACE VIEW available_table_now AS
WITH next_reservation AS (
  SELECT table_id, MIN(reservation_time) AS next_reservation_time
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
  EXTRACT(EPOCH FROM (nr.next_reservation_time - NOW())) / 60 AS minutes_until_next
FROM restaurant_table t
LEFT JOIN next_reservation nr ON t.table_id = nr.table_id
WHERE t.table_status != 'OCCUPIED';

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
