const pool = require('../config/database');

class AdminActionLog {
  static async create({ actorUserId = null, targetUserId = null, action, oldValue = null, newValue = null }) {
    const result = await pool.query(
      `INSERT INTO admin_action_logs (actor_user_id, target_user_id, action, old_value, new_value)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
       RETURNING id, actor_user_id, target_user_id, action, old_value, new_value, created_at`,
      [
        actorUserId,
        targetUserId,
        action,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
      ]
    );

    return result.rows[0];
  }
}

module.exports = AdminActionLog;