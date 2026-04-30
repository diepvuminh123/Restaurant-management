const pool = require('../config/database');

class Promotion {
  static async getAll({ page = 1, limit = 10, search = '', isActive = null }) {
    const where = [];
    const values = [];
    let idx = 1;

    if (search) {
      where.push(`code ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }

    if (isActive !== null) {
      where.push(`is_active = $${idx++}`);
      values.push(isActive === 'true' || isActive === true);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM promotions ${whereClause}`,
      values
    );
    const total = countResult.rows[0]?.total || 0;

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    values.push(safeLimit, offset);

    const result = await pool.query(
      `SELECT * FROM promotions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return {
      items: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        total_pages: Math.max(1, Math.ceil(total / safeLimit))
      }
    };
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM promotions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByCode(code) {
    const result = await pool.query('SELECT * FROM promotions WHERE UPPER(code) = UPPER($1)', [code]);
    return result.rows[0] || null;
  }

  static async create(data) {
    const {
      code, description, discount_type, discount_value, min_order_value, max_discount_amount,
      start_date, end_date, usage_limit, is_active
    } = data;

    const result = await pool.query(
      `INSERT INTO promotions (
        code, description, discount_type, discount_value, min_order_value, max_discount_amount,
        start_date, end_date, usage_limit, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        code.toUpperCase(), description, discount_type, discount_value, min_order_value || 0, max_discount_amount || null,
        start_date, end_date, usage_limit || null, is_active !== undefined ? is_active : true
      ]
    );

    return result.rows[0];
  }

  static async update(id, data) {
    const {
      description, discount_type, discount_value, min_order_value, max_discount_amount,
      start_date, end_date, usage_limit, is_active
    } = data;

    const result = await pool.query(
      `UPDATE promotions
       SET description = COALESCE($1, description),
           discount_type = COALESCE($2, discount_type),
           discount_value = COALESCE($3, discount_value),
           min_order_value = COALESCE($4, min_order_value),
           max_discount_amount = $5,
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           usage_limit = $8,
           is_active = COALESCE($9, is_active),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        description, discount_type, discount_value, min_order_value, max_discount_amount,
        start_date, end_date, usage_limit, is_active, id
      ]
    );

    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM promotions WHERE id = $1 AND used_count = 0 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  static calculateDiscount(promotion, totalAmount) {
    const orderTotal = Number(totalAmount);
    let discountAmount = 0;

    if (promotion.discount_type === 'PERCENTAGE') {
      discountAmount = orderTotal * (Number(promotion.discount_value) / 100);
      if (promotion.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(promotion.max_discount_amount));
      }
    } else if (promotion.discount_type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(promotion.discount_value), orderTotal);
    }

    return Math.round(discountAmount * 100) / 100;
  }
}

module.exports = Promotion;
