const pool = require('../config/database');

class Faq {
  static async getAllActive() {
    const result = await pool.query(
      'SELECT id, question, answer, sort_order FROM faqs WHERE is_active = true ORDER BY sort_order ASC, id DESC'
    );
    return result.rows;
  }

  static async getAll() {
    const result = await pool.query(
      'SELECT id, question, answer, is_active, sort_order, created_at, updated_at FROM faqs ORDER BY sort_order ASC, id DESC'
    );
    return result.rows;
  }

  static async create(data) {
    const { question, answer, is_active = true, sort_order = 0 } = data;
    const query = `
      INSERT INTO faqs (question, answer, is_active, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [question, answer, is_active, sort_order]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { question, answer, is_active, sort_order } = data;
    const updateFields = [];
    const updateParams = [];
    let idx = 1;

    if (question !== undefined) {
      updateFields.push(`question = $${idx++}`);
      updateParams.push(question);
    }
    if (answer !== undefined) {
      updateFields.push(`answer = $${idx++}`);
      updateParams.push(answer);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${idx++}`);
      updateParams.push(is_active);
    }
    if (sort_order !== undefined) {
      updateFields.push(`sort_order = $${idx++}`);
      updateParams.push(sort_order);
    }

    if (updateFields.length === 0) return null;

    const query = `
      UPDATE faqs 
      SET ${updateFields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    updateParams.push(id);

    const result = await pool.query(query, updateParams);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateOrder(items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query('UPDATE faqs SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Faq;
