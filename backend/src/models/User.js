const pool = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async findById(userId) {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }
  static async getEmailById(user_id) {
    const result = await pool.query(
      "SELECT email FROM users WHERE user_id = $1",
      [user_id]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { username, email, password, fullName, phone, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, phone, role) 
   VALUES ($1, $2, $3, $4, $5, $6) 
   RETURNING user_id, username, email, full_name, phone, role, created_at`,
      [username, email, hashedPassword, fullName, phone, role || "customer"]
    );

    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async isUsernameExists(username) {
    const result = await pool.query(
      "SELECT user_id FROM users WHERE username = $1",
      [username]
    );
    return result.rows.length > 0;
  }

  static async isEmailExists(email) {
    const result = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    return result.rows.length > 0;
  }
  static async setUserVerified(userId) {
    await pool.query("UPDATE users SET is_verified = TRUE WHERE user_id = $1", [
      userId,
    ]);
  }
  static async checkAuth(userId) {
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  }
  static async checkIs_verified(userID) {
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE user_id = $1",
      [userID]
    );
    return result.rows[0];
  }
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [
      hashedPassword,
      userId,
    ]);
  }
  static async incrementFailLoginAttempts(userId) {
    await pool.query(
      "UPDATE users SET fail_login_attempts = fail_login_attempts + 1 WHERE user_id = $1",
      [userId]
    );
  }
  static async resetFailLoginAttempts(userId) {
    await pool.query("UPDATE users SET fail_login_attempts = 0, locked_until = NULL WHERE user_id = $1", [userId])
  }
  static async lockAccount(lockUntil, userId ) {

    
    await pool.query(
      "UPDATE users SET locked_until = $1 WHERE user_id = $2",
      [lockUntil, userId]
    );
  }

  static async updateProfile(userId, profileData) {
    const { username, fullName, phone } = profileData;

    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           full_name = COALESCE($2, full_name),
           phone = COALESCE($3, phone)
       WHERE user_id = $4
       RETURNING user_id, username, email, full_name, phone, role, created_at`,
      [username, fullName, phone, userId]
    );

    return result.rows[0];
  }

  static async getUsersForAdmin(filters = {}) {
    const {
      search = '',
      role = 'all',
      verified = 'all',
      locked = 'all',
      page = 1,
      limit = 10,
    } = filters;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      params.push(keyword);
      const idx = params.length;
      conditions.push(`(
        username ILIKE $${idx}
        OR email ILIKE $${idx}
        OR COALESCE(full_name, '') ILIKE $${idx}
        OR COALESCE(phone, '') ILIKE $${idx}
      )`);
    }

    if (role !== 'all') {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    if (verified !== 'all') {
      params.push(verified === 'true');
      conditions.push(`is_verified = $${params.length}`);
    }

    if (locked === 'true') {
      conditions.push('locked_until IS NOT NULL AND locked_until > NOW()');
    }

    if (locked === 'false') {
      conditions.push('(locked_until IS NULL OR locked_until <= NOW())');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Number(limit);
    const safePage = Number(page);
    const offset = (safePage - 1) * safeLimit;

    const listParams = [...params, safeLimit, offset];
    const result = await pool.query(
      `SELECT
        user_id,
        username,
        email,
        full_name,
        phone,
        role,
        is_verified,
        fail_login_attempts,
        locked_until,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM users
       ${whereClause}`,
      params
    );

    return {
      rows: result.rows,
      total: countResult.rows[0]?.total || 0,
    };
  }

  static async countAdmins() {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM users
       WHERE role = 'admin'`
    );

    return result.rows[0]?.total || 0;
  }

  static async updateUserRole(userId, role) {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE user_id = $2
       RETURNING user_id, username, email, full_name, phone, role, is_verified, fail_login_attempts, locked_until, created_at`,
      [role, userId]
    );

    return result.rows[0];
  }

  static async updateUserLockState(userId, locked, lockHours = 24) {
    if (locked) {
      const lockUntil = new Date(Date.now() + Number(lockHours) * 60 * 60 * 1000);
      const result = await pool.query(
        `UPDATE users
         SET locked_until = $1,
             fail_login_attempts = 5
         WHERE user_id = $2
         RETURNING user_id, username, email, full_name, phone, role, is_verified, fail_login_attempts, locked_until, created_at`,
        [lockUntil, userId]
      );

      return result.rows[0];
    }

    const result = await pool.query(
      `UPDATE users
       SET locked_until = NULL,
           fail_login_attempts = 0
       WHERE user_id = $1
       RETURNING user_id, username, email, full_name, phone, role, is_verified, fail_login_attempts, locked_until, created_at`,
      [userId]
    );

    return result.rows[0];
  }
  
}
module.exports = User;
