-- Seed sample data for restaurant_table
-- Idempotent: only inserts when restaurant_table is empty

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM restaurant_table LIMIT 1) THEN
    INSERT INTO restaurant_table (capacity, table_status, position_x, position_y, restaurant_note)
    VALUES
      (2, 'AVAILABLE', 0, 0, NULL),
      (2, 'AVAILABLE', 2, 0, NULL),
      (4, 'AVAILABLE', 4, 0, NULL),
      (4, 'AVAILABLE', 6, 0, NULL),
      (4, 'AVAILABLE', 0, 2, NULL),
      (4, 'AVAILABLE', 2, 2, NULL),
      (6, 'AVAILABLE', 4, 2, NULL),
      (6, 'AVAILABLE', 6, 2, NULL),
      (8, 'AVAILABLE', 0, 4, NULL),
      (8, 'AVAILABLE', 2, 4, NULL),
      (10, 'AVAILABLE', 4, 4, NULL),
      (10, 'AVAILABLE', 6, 4, NULL);
  END IF;
END $$;
