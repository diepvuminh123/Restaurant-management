const pool = require('../config/database');

class Review {
  static async getMenuItemById(menuItemId) {
    const result = await pool.query('SELECT id, name FROM menu_items WHERE id = $1', [menuItemId]);
    return result.rows[0] || null;
  }

  static async getReviewById(reviewId) {
    const result = await pool.query(
      `SELECT id, user_id, menu_item_id, rating, comment, is_hidden, hidden_reason, created_at, updated_at
       FROM reviews
       WHERE id = $1`,
      [reviewId]
    );
    return result.rows[0] || null;
  }

  static async recalculateMenuRating(menuItemId, client = pool) {
    const statsResult = await client.query(
      `SELECT
         COALESCE(AVG(rating), 0)::numeric(3,2) AS rating_avg,
         COUNT(*)::int AS rating_count
       FROM reviews
       WHERE menu_item_id = $1 AND is_hidden = FALSE`,
      [menuItemId]
    );

    const stats = statsResult.rows[0];
    await client.query(
      `UPDATE menu_items
       SET rating_avg = $1,
           rating_count = $2
       WHERE id = $3`,
      [stats.rating_avg, stats.rating_count, menuItemId]
    );
  }

  static async createReview(userId, payload) {
    const { menu_item_id, rating, comment } = payload;

    await pool.query('BEGIN');
    try {
      const insertResult = await pool.query(
        `INSERT INTO reviews (user_id, menu_item_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, menu_item_id, rating, comment, is_hidden, hidden_reason, created_at, updated_at`,
        [userId, menu_item_id, rating, comment || null]
      );

      await Review.recalculateMenuRating(menu_item_id, pool);
      await pool.query('COMMIT');
      return insertResult.rows[0];
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async updateOwnReview(reviewId, userId, payload) {
    await pool.query('BEGIN');
    try {
      const existingResult = await pool.query(
        `SELECT id, menu_item_id
         FROM reviews
         WHERE id = $1 AND user_id = $2`,
        [reviewId, userId]
      );

      if (existingResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return null;
      }

      const fields = [];
      const values = [];
      let idx = 1;

      if (payload.rating !== undefined) {
        fields.push(`rating = $${idx++}`);
        values.push(payload.rating);
      }

      if (payload.comment !== undefined) {
        fields.push(`comment = $${idx++}`);
        values.push(payload.comment || null);
      }

      if (!fields.length) {
        await pool.query('ROLLBACK');
        return null;
      }

      values.push(reviewId, userId);

      const updateResult = await pool.query(
        `UPDATE reviews
         SET ${fields.join(', ')}
         WHERE id = $${idx++} AND user_id = $${idx}
         RETURNING id, user_id, menu_item_id, rating, comment, is_hidden, hidden_reason, created_at, updated_at`,
        values
      );

      const updated = updateResult.rows[0];
      await Review.recalculateMenuRating(updated.menu_item_id, pool);
      await pool.query('COMMIT');
      return updated;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async deleteOwnReview(reviewId, userId) {
    await pool.query('BEGIN');
    try {
      const deleteResult = await pool.query(
        `DELETE FROM reviews
         WHERE id = $1 AND user_id = $2
         RETURNING id, menu_item_id`,
        [reviewId, userId]
      );

      if (deleteResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return null;
      }

      const deleted = deleteResult.rows[0];
      await Review.recalculateMenuRating(deleted.menu_item_id, pool);
      await pool.query('COMMIT');
      return deleted;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async getPublicReviewsByMenuItem(menuItemId, query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const sortMap = {
      newest: 'r.created_at DESC',
      highest: 'r.rating DESC, r.created_at DESC',
      lowest: 'r.rating ASC, r.created_at DESC',
    };

    const sortExpr = sortMap[query.sort] || sortMap.newest;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM reviews r
       WHERE r.menu_item_id = $1 AND r.is_hidden = FALSE`,
      [menuItemId]
    );

    const listResult = await pool.query(
      `SELECT
         r.id,
         r.user_id,
         r.menu_item_id,
         r.rating,
         r.comment,
         r.created_at,
         r.updated_at,
         u.username,
         u.full_name
       FROM reviews r
       INNER JOIN users u ON u.user_id = r.user_id
       WHERE r.menu_item_id = $1 AND r.is_hidden = FALSE
       ORDER BY ${sortExpr}
       LIMIT $2 OFFSET $3`,
      [menuItemId, limit, offset]
    );

    return {
      items: listResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.total || 0,
        total_pages: Math.ceil((countResult.rows[0]?.total || 0) / limit) || 1,
      },
    };
  }

  static async createReviewReport(reviewId, reporterId, payload) {
    const { reason, note } = payload;
    const result = await pool.query(
      `INSERT INTO review_reports (review_id, reporter_id, reason, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, review_id, reporter_id, reason, note, created_at, updated_at`,
      [reviewId, reporterId, reason, note || null]
    );

    return result.rows[0];
  }

  static async getReportedReviewsForAdmin(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const conditions = ['EXISTS (SELECT 1 FROM review_reports rr_exist WHERE rr_exist.review_id = r.id)'];
    const params = [];

    if (query.menu_item_id !== undefined) {
      params.push(Number(query.menu_item_id));
      conditions.push(`r.menu_item_id = $${params.length}`);
    }

    if (query.status === 'hidden') {
      conditions.push('r.is_hidden = TRUE');
    } else if (query.status === 'visible') {
      conditions.push('r.is_hidden = FALSE');
    }

    if (query.reason) {
      params.push(query.reason);
      conditions.push(
        `EXISTS (
          SELECT 1 FROM review_reports rr_reason
          WHERE rr_reason.review_id = r.id AND rr_reason.reason = $${params.length}
        )`
      );
    }

    if (query.from_date) {
      params.push(query.from_date);
      conditions.push(`EXISTS (
        SELECT 1 FROM review_reports rr_from
        WHERE rr_from.review_id = r.id AND rr_from.created_at >= $${params.length}
      )`);
    }

    if (query.to_date) {
      params.push(query.to_date);
      conditions.push(`EXISTS (
        SELECT 1 FROM review_reports rr_to
        WHERE rr_to.review_id = r.id AND rr_to.created_at <= $${params.length}
      )`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM reviews r
       ${whereClause}`,
      params
    );

    const listParams = [...params, limit, offset];
    const listResult = await pool.query(
      `SELECT
         r.id,
         r.user_id,
         r.menu_item_id,
         r.rating,
         r.comment,
         r.is_hidden,
         r.hidden_reason,
         r.created_at,
         r.updated_at,
         u.username,
         u.full_name,
         mi.name AS menu_item_name,
         report_stats.report_count,
         report_stats.latest_report_at,
         report_stats.reasons
       FROM reviews r
       INNER JOIN users u ON u.user_id = r.user_id
       INNER JOIN menu_items mi ON mi.id = r.menu_item_id
       INNER JOIN LATERAL (
         SELECT
           COUNT(*)::int AS report_count,
           MAX(rr.created_at) AS latest_report_at,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT rr.reason), NULL) AS reasons
         FROM review_reports rr
         WHERE rr.review_id = r.id
       ) report_stats ON TRUE
       ${whereClause}
       ORDER BY report_stats.latest_report_at DESC NULLS LAST, r.id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return {
      items: listResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.total || 0,
        total_pages: Math.ceil((countResult.rows[0]?.total || 0) / limit) || 1,
      },
    };
  }

  static async getMenuItemReportSummary(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (query.menu_item_id !== undefined) {
      params.push(Number(query.menu_item_id));
      conditions.push(`mi.id = $${params.length}`);
    }

    if (query.reason) {
      params.push(query.reason);
      conditions.push(`rr.reason = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM (
         SELECT mi.id
         FROM review_reports rr
         INNER JOIN reviews r ON r.id = rr.review_id
         INNER JOIN menu_items mi ON mi.id = r.menu_item_id
         ${whereClause}
         GROUP BY mi.id
       ) sub`,
      params
    );

    const listParams = [...params, limit, offset];
    const listResult = await pool.query(
      `SELECT
         mi.id AS menu_item_id,
         mi.name AS menu_item_name,
         COUNT(rr.id)::int AS total_reports,
         COUNT(DISTINCT rr.review_id)::int AS total_reported_reviews,
         COUNT(DISTINCT CASE WHEN r.is_hidden THEN r.id ELSE NULL END)::int AS hidden_review_count,
         MAX(rr.created_at) AS latest_report_at
       FROM review_reports rr
       INNER JOIN reviews r ON r.id = rr.review_id
       INNER JOIN menu_items mi ON mi.id = r.menu_item_id
       ${whereClause}
       GROUP BY mi.id, mi.name
       ORDER BY latest_report_at DESC NULLS LAST, mi.id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return {
      items: listResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.total || 0,
        total_pages: Math.ceil((countResult.rows[0]?.total || 0) / limit) || 1,
      },
    };
  }

  static async updateReviewVisibilityForAdmin(reviewId, payload) {
    await pool.query('BEGIN');
    try {
      const updateResult = await pool.query(
        `UPDATE reviews
         SET is_hidden = $1,
             hidden_reason = $2
         WHERE id = $3
         RETURNING id, user_id, menu_item_id, rating, comment, is_hidden, hidden_reason, created_at, updated_at`,
        [payload.is_hidden, payload.hidden_reason || null, reviewId]
      );

      if (updateResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return null;
      }

      const updated = updateResult.rows[0];
      await Review.recalculateMenuRating(updated.menu_item_id, pool);
      await pool.query('COMMIT');
      return updated;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = Review;
