const pool = require('../config/database');

class Reservation {
  static DEFAULT_SLOT_MINUTES = 120;

  static async getTablesWithAvailability(reservationTime, numOfGuests, slotMinutes = Reservation.DEFAULT_SLOT_MINUTES) {
    const result = await pool.query(
      `SELECT
        t.table_id,
        t.capacity,
        t.table_status,
        t.position_x,
        t.position_y,
        t.restaurant_note,
        CASE
          WHEN t.table_status = 'OCCUPIED' THEN 'OCCUPIED'
          WHEN t.capacity < $2 THEN 'CAPACITY'
          WHEN EXISTS (
            SELECT 1
            FROM reservation r
            WHERE r.table_id = t.table_id
              AND r.reservation_state IN ('CONFIRM', 'ON_SERVING')
              AND r.reservation_time BETWEEN ($1::timestamptz - ($3::int * INTERVAL '1 minute'))
                                      AND ($1::timestamptz + ($3::int * INTERVAL '1 minute'))
          ) THEN 'TIME_CONFLICT'
          ELSE NULL
        END AS disabled_reason
      FROM restaurant_table t
      ORDER BY t.table_id ASC`,
      [reservationTime, numOfGuests, slotMinutes]
    );

    return result.rows.map((row) => ({
      ...row,
      selectable: row.disabled_reason === null,
    }));
  }

  static async getReservationById(reservationId) {
    const result = await pool.query(`SELECT * FROM reservation WHERE reservation_id = $1`, [reservationId]);
    return result.rows[0] || null;
  }

  static async create({ owner, tableId, reservationTime, numberOfGuests, note = null }) {
    const result = await pool.query(
      `INSERT INTO reservation (user_id, session_id, table_id, number_of_guests, reservation_state, reservation_time, note)
       VALUES ($1, $2, $3, $4, 'CONFIRM', $5, $6)
       RETURNING *`,
      [owner.userId, owner.sessionId, tableId, numberOfGuests, reservationTime, note]
    );
    return result.rows[0];
  }
}

module.exports = Reservation;
