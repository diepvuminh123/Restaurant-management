const pool = require("../config/database");
const bcrypt = require("bcrypt");
const { generateOtp6 } = require("../utils/otp");
const { create } = require("./User");

class Mail {
  // 
  static async createAuthMail(mailData) {
    const { user_id, code, otp_type } = mailData;
    const otpExpiresMin = 10;
    const expiresAt = new Date(Date.now() + otpExpiresMin * 60 * 1000);
    const codeHash = await bcrypt.hash(code, 10);
    const result = await pool.query(
      `INSERT INTO email_verifications (user_id, code_hash, expires_at, otp_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, otp_type = EXCLUDED.otp_type, created_at = NOW()
      RETURNING *`,
       [user_id, codeHash, expiresAt, otp_type]
    );
    return result.rows[0];
  }

  static async upDateAuthMail(mailData) {
    const { user_id, code, OTPType } = mailData;
    const otp_type = OTPType; // Lỡ dại :)))
    const otpExpiresMin = 10;
    const expiresAt = new Date(Date.now() + otpExpiresMin * 60 * 1000);
    const codeHash = await bcrypt.hash(code, 10);
    const result = await pool.query(
      `UPDATE email_verifications SET code_hash = $2, expires_at = $3, otp_type = $4, created_at = NOW()
       WHERE user_id = $1
      RETURNING *`,
       [user_id, codeHash, expiresAt, otp_type]
    );
    return result.rows[0];
  }


  static async getOtpDataByUserId(user_id) {
    const result = await pool.query(
      'SELECT code_hash, expires_at, otp_type FROM email_verifications WHERE user_id = $1',
      [user_id]
    );
    return result.rows[0];
  }
  static async verifycode(code, hashedCode) {
    return await bcrypt.compare(code, hashedCode);
  }
  static async clearOtpByUserId(user_id) {
  await pool.query(
    `
    UPDATE email_verifications 
    SET code_hash = NULL,
        expires_at = NULL
    WHERE user_id = $1
    `,
    [user_id]
  );
}

}

module.exports = Mail;
