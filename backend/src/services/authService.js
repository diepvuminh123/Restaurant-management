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
  static async verifUser(userData) {
    const { code, user_id } = userData;
    const verified = await Mail.getOtpByUserId(user_id);
    const isValidCode = await Mail.verifycode(code, verified.code_hash);
    if (!isValidCode) {
       console.log("isValidCode", isValidCode);
      throw new Error("Mã code không đúng");
    }
    else {
      await User.setUserVerified(user_id);
      await Mail.deleteOtpByUserId(user_id);
    }
   
    return verified;
  }
  /**
   * Gửi lại Xác thực mã code 
   */
  static async reVerifUser(userData) {
    const {user_id} = userData;
    const code = generateOtp6();
    const resendMail = await User.getEmailById(user_id);
    console.log("resendMailABC", resendMail);
    await sendVerificationEmail({
      to: resendMail.email,
      code: code, 
      minutes: 10, 
    });
    await Mail.upDateAuthMail({ user_id, code });
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
  static async checkAuth(userId){
    const user = await User.checkAuth(userId);
    if(!user){
      throw new Error("User không tồn tại");
    }
    return user.is_verified;
  }
}

module.exports = AuthService;
