const pool = require('../config/database');

class RestaurantTable {
  static async getAll({ status = null } = {}) {
    const values = [];
    let whereSql = '';

    if (status) {
      values.push(String(status).toUpperCase());
      whereSql = 'WHERE table_status = $1';
    }

    const result = await pool.query(
      `SELECT table_id, capacity, table_status, position_x, position_y, restaurant_note
       FROM restaurant_table
       ${whereSql}
       ORDER BY position_y ASC, position_x ASC, table_id ASC`,
      values
    );

    return result.rows;
  }

  static async getById(tableId) {
    const result = await pool.query(
      `SELECT table_id, capacity, table_status, position_x, position_y, restaurant_note
       FROM restaurant_table
       WHERE table_id = $1`,
      [tableId]
    );

    return result.rows[0] || null;
  }

  static async getByPosition(positionX, positionY, { excludeTableId = null } = {}) {
    const values = [positionX, positionY];
    let whereSql = 'WHERE position_x = $1 AND position_y = $2';

    if (excludeTableId) {
      values.push(excludeTableId);
      whereSql += ' AND table_id != $3';
    }

    const result = await pool.query(
      `SELECT table_id, capacity, table_status, position_x, position_y, restaurant_note
       FROM restaurant_table
       ${whereSql}
       LIMIT 1`,
      values
    );

    return result.rows[0] || null;
  }

  static async create({ capacity, table_status, position_x, position_y, restaurant_note = null }) {
    const result = await pool.query(
      `INSERT INTO restaurant_table (capacity, table_status, position_x, position_y, restaurant_note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING table_id, capacity, table_status, position_x, position_y, restaurant_note`,
      [capacity, table_status, position_x, position_y, restaurant_note]
    );

    return result.rows[0] || null;
  }

  static async update(tableId, { capacity, table_status, position_x, position_y, restaurant_note = null }) {
    const result = await pool.query(
      `UPDATE restaurant_table
       SET capacity = $2,
           table_status = $3,
           position_x = $4,
           position_y = $5,
           restaurant_note = $6
       WHERE table_id = $1
       RETURNING table_id, capacity, table_status, position_x, position_y, restaurant_note`,
      [tableId, capacity, table_status, position_x, position_y, restaurant_note]
    );

    return result.rows[0] || null;
  }

  static async delete(tableId) {
    const result = await pool.query(
      `DELETE FROM restaurant_table
       WHERE table_id = $1
       RETURNING table_id, capacity, table_status, position_x, position_y, restaurant_note`,
      [tableId]
    );

    return result.rows[0] || null;
  }
}

module.exports = RestaurantTable;