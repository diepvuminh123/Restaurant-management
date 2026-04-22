-- Seed sample data for restaurant_table
-- Idempotent: only inserts when restaurant_table is empty

INSERT INTO restaurant_table (capacity, table_status, position_x, position_y, restaurant_note)
SELECT seed.capacity, seed.table_status, seed.position_x, seed.position_y, seed.restaurant_note
FROM (
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
    (10, 'AVAILABLE', 6, 4, NULL)
) AS seed(capacity, table_status, position_x, position_y, restaurant_note)
WHERE NOT EXISTS (
  SELECT 1
  FROM restaurant_table
);
