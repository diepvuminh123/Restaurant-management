const User = require("../models/User");
const Mail = require("../models/Mail");
require("dotenv").config();
const { sendVerificationEmail } = require("../mailer");
const { generateOtp6 } = require("../utils/otp");
const bcrypt = require("bcrypt");

const otpExpiresMin = Number(process.env.OTP_EXPIRES_MIN || 10);

class AuthService {
  static async getUserByEmail(email) {
    const user = await User.findByEmail(email);
    return user;
  }

  /**
   * Đăng ký user mới
   */
  static async register(userData) {
    const { username, email, password, role } = userData;

    const usernameExists = await User.isUsernameExists(username);
    if (usernameExists) {
      throw new Error("Username đã tồn tại");
    }

    const emailExists = await User.isEmailExists(email);
    if (emailExists) {
      throw new Error("Email đã được sử dụng");
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role: role || "customer",
    });
    const code = generateOtp6();
    await Mail.createAuthMail({
      user_id: newUser.user_id,
      code,
      otp_type: "signup",
    });
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
    const { code, email } = userData;

    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Email không tồn tại");
    }

    const user_id = user.user_id;
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
        email: email,
        user_id: user_id,
      };
    }

    if (record.otp_type === "reset") {
      await Mail.clearOtpByUserId(user_id);
      return {
        success: true,
        allow_reset: true,
        email: email,
        user_id: user_id,
        otp_type: "reset",
      };
    }
    await Mail.clearOtpByUserId(user_id);

    return {
      success: true,
      otp_type: record.otp_type,
      email: email,
      user_id: user_id,
    };
  }
  /**
   * Gửi Xác thực mã code
   */
  static async sendOtp(userData) {
    const { email, OTPType } = userData;

    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Email không tồn tại");
    }

    const user_id = user.user_id;
    const code = generateOtp6();
    console.log("resendMailABC", { email, user_id });
    await sendVerificationEmail({
      to: email,
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
    const is_verified = await User.checkIs_verified(user.user_id);
    console.log("is_verifiedABC",is_verified);
    if (is_verified.is_verified === false) {
      throw new Error("Bạn vui lòng xác thực tài khoản trước khi đăng nhập");
    }
    if (user.locked_until && new Date(user.locked_until) < new Date()) {
       await User.resetFailLoginAttempts(user.user_id);
    }
    // if( user.fail_login_attempts >=5 ) {
    //   // const lockDurationMinutes = 12 * 60; 
    //   const lockDurationMinutes = 50 * 1000;
    //   // const lockUntil = new Date(Date.now() + lockDurationMinutes * 60000);
    //   const lockUntil = new Date(Date.now() + lockDurationMinutes);
    //   await User.lockAccount(user.user_id,lockUntil);

    // }
    if( user.locked_until && new Date(user.locked_until) > new Date()) {
     
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new Error(`Tài khoản của bạn đã bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${minutesLeft} phút.`);
    }


    const isValidPassword = await User.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      if(user.fail_login_attempts >=5) {
        const lockDurationMinutes = 12 * 60 * 60 *  1000;
        const lockUntil = new Date(Date.now() + lockDurationMinutes);
      await User.lockAccount(lockUntil,user.user_id);
        throw new Error("Tài khoản của bạn đã bị khóa do đăng nhập sai nhiều lần.");
      }
      await User.incrementFailLoginAttempts(user.user_id);
      throw new Error("Email hoặc mật khẩu không đúng. Bạn còn " + (5 - (user.fail_login_attempts + 1)) + " lần thử nữa trước khi tài khoản bị khóa.");
    }
    await User.resetFailLoginAttempts(user.user_id);

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
  /**
   * Reset mật khẩu
   */
  static async resetPassword(userData) {
    const { newPassword, userId } = userData;
    console.log("userIdABC",userId);
    const user = await User.findById(userId);
    if (!userId) {
      throw new Error("User không tồn tại");
    }
    console.log("user.password_hash",user.password_hash);
    const isValidPassword = await User.verifyPassword(
      newPassword,
      user.password_hash
    );
    if (isValidPassword) {
      throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
    }

    await User.updatePassword(userId, newPassword);
  }
}

module.exports = AuthService;
