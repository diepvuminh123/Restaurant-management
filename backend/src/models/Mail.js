const pool = require("../config/database");
const bcrypt = require("bcrypt");
const { generateOtp6 } = require("../utils/otp");
const { create } = require("./User");
class Mail {
  static async createAuthMail(mailData) {
    const { user_id, code } = mailData;
    const expiresAt = new Date(Date.now() + otpExpiresMin * 60 * 1000);
    const codeHash = await bcrypt.hash(code, 10);
    const result = await pool.query(
      `INSERT INTO email_verifications (user_id, code_hash, expires_at)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id)
       DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, created_at = NOW()`,
      [user_id, codeHash, expiresAt]
    );
    return result.rows[0];
  }
  static async verifycode(code, hashedCode) {
    return await bcrypt.compare(code, hashedCode);
  }
}

module.exports = Mail;
