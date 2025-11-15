const pool = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async findById(userId) {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );
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
    const result = await pool.query("SELECT email FROM users WHERE user_id = $1", [
      user_id,
    ]);
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
    const result = await pool.query("SELECT is_verified FROM users WHERE user_id = $1", [
      userId,
    ]);
    return result.rows[0];
  }
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2",
      [hashedPassword, userId]
    );
  }
}
module.exports = User;
