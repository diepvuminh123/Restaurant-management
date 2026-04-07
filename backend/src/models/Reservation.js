const pool = require('../config/database');
require('dotenv').config();

class Reservation {
  static DEFAULT_SLOT_MINUTES = process.env.DEFAULT_SLOT_MINUTES || 120;

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
              -- Two reservations overlap if their start times are within slotMinutes.
              -- Use strict bounds so back-to-back slots (end == next start) are allowed.
              AND r.reservation_time >  ($1::timestamptz - ($3::int * INTERVAL '1 minute'))
              AND r.reservation_time <  ($1::timestamptz + ($3::int * INTERVAL '1 minute'))
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

  static async getReservationsByUserId(userId) {
    const result = await pool.query(
      `SELECT reservation_id, table_id, number_of_guests, reservation_state, reservation_time, note, created_at
       FROM reservation
       WHERE user_id = $1
       ORDER BY reservation_time DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create({ owner, tableId, reservationTime, numberOfGuests, note = null, restaurantNote = null }) {
    const result = await pool.query(
      `INSERT INTO reservation (user_id, session_id, table_id, number_of_guests, reservation_state, reservation_time, note, restaurant_note)
       VALUES ($1, $2, $3, $4, 'CONFIRM', $5, $6, $7)
       RETURNING *`,
      [owner?.userId ?? null, owner?.sessionId ?? null, tableId, numberOfGuests, reservationTime, note, restaurantNote]
    );
    return result.rows[0];
  }

  static async cancelReservation(userId, reservationId){
    const result = await pool.query(
      `UPDATE reservation
      SET reservation_state = 'CANCELED'
      WHERE user_id = $1
        AND reservation_id = $2
        AND reservation_time > NOW()
        AND reservation_state IN ('CONFIRM')
      RETURNING *`,
      [userId, reservationId]
    );

    return result.rows[0] || null;
  }
  static async listForStaff({ limit = 50, offset = 0, state = null, from = null, to = null } = {}) {
    const where = [];
    const values = [];
    let i = 1;

    if (state) {
      where.push(`reservation_state = $${i++}`);
      values.push(state);
    }

    if (from) {
      where.push(`reservation_time >= $${i++}::timestamptz`);
      values.push(from);
    }

    if (to) {
      where.push(`reservation_time <= $${i++}::timestamptz`);
      values.push(to);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    values.push(limit);
    const limitParam = `$${i++}`;
    values.push(offset);
    const offsetParam = `$${i++}`;

    const result = await pool.query(
      `SELECT reservation_id, user_id, table_id, number_of_guests, reservation_state, reservation_time, note, restaurant_note, created_at
       FROM reservation
       ${whereSql}
       ORDER BY reservation_time DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      values
    );

    return result.rows;
  }
  static async getReservationDetailForStaff(reservationId){
    const query = `SELECT
      reservation_id,
      user_id,
      session_id,
      table_id,
      number_of_guests,
      reservation_state,
      reservation_time,
      note,
      restaurant_note,
      created_at
    FROM reservation
    WHERE reservation_id = $1`;
    const result = await pool.query(query, [reservationId]);
    return result.rows[0] || null;
  }

}

module.exports = Reservation;
