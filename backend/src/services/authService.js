const User = require("../models/User");
const Mail = require("../models/Mail");
require("dotenv").config();
const { sendVerificationEmail } = require("../mailer");
const { generateOtp6 } = require("../utils/otp");

const otpExpiresMin = Number(process.env.OTP_EXPIRES_MIN || 10);

class AuthService {
  /**
   * Đăng ký user mới
   */
  static async register(userData) {
    const { username, email, password, fullName, phone, role } = userData;

    // Kiểm tra username đã tồn tại
    const usernameExists = await User.isUsernameExists(username);
    if (usernameExists) {
      throw new Error("Username đã tồn tại");
    }

    // Kiểm tra email đã tồn tại
    const emailExists = await User.isEmailExists(email);
    if (emailExists) {
      throw new Error("Email đã được sử dụng");
    }

    const newUser = await User.create({
      username,
      email,
      password,
      fullName,
      phone,
      role: role || "customer",
    });
    const code = generateOtp6();
    await Mail.createAuthMail({ user_id: newUser.user_id, code });
    await sendVerificationEmail({
      to: email,
      code: code,
      minutes: 10,
    });

    return newUser;
  }
  /**
   * Xác thực mã code
   */
  static async verifyOtp(userData) {
    const { code, user_id } = userData;
    const record = await Mail.getOtpDataByUserId(user_id);
    console.log("recordABC", record);
    if (!record || !record.code_hash) {
      throw new Error("K tìm thấy OTP");
    }
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      await Mail.clearOtpByUserId(user_id);
      throw new Error("Mã OTP đã hết hạn, vui lòng yêu cầu mã mới");
    }
    const isValidCode = await Mail.verifycode(code, record.code_hash);
    console.log("isValidCodeABC", isValidCode);

    if (!isValidCode) {
      console.log("isValidCode", isValidCode);
      throw new Error("Mã code không đúng");
    }
    if (record.otp_type === "signup") {
      await User.setUserVerified(user_id);
      await Mail.clearOtpByUserId(user_id);
      return {
        success: true,
        otp_type: "signup",
        user_id,
      };
    }

    if (record.otp_type === "reset") {
      await Mail.clearOtpByUserId(user_id);
      return {
        success: true,
        allow_reset: true,
        user_id: user_id,
        otp_type: "reset",
      };
    }
    await Mail.clearOtpByUserId(user_id);

    return {
      success: true,
      otp_type: record.otp_type,
      user_id,
    };
  }
  /**
   * Gửi Xác thực mã code
   */
  static async sendOtp(userData) {
    const { user_id, OTPType } = userData;
    const code = generateOtp6();
    const MailUser = await User.getEmailById(user_id);
    console.log("resendMailABC", MailUser);
    await sendVerificationEmail({
      to: MailUser.email,
      code: code,
      minutes: 10,
    });
    await Mail.upDateAuthMail({ user_id, code, OTPType });
    return;
  }

  /**
   * Đăng nhập
   */
  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const isValidPassword = await User.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }
    return user;
  }
  /**
   * Xem xacs thuc chua
   */
  static async checkAuth(userId) {
    const user = await User.checkAuth(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }
    return user.is_verified;
  }
}

module.exports = AuthService;
