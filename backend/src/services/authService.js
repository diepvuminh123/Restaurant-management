const User = require('../models/User');
const Mail = require('../models/Mail')
require('dotenv').config();
const { sendVerificationEmail } = require('../mailer');
const { generateOtp6 } = require('../utils/otp');

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
      throw new Error('Username đã tồn tại');
    }

    // Kiểm tra email đã tồn tại
    const emailExists = await User.isEmailExists(email);
    if (emailExists) {
      throw new Error('Email đã được sử dụng');
    }

    const newUser = await User.create({
      username,
      email,
      password,
      fullName,
      phone,
      role: role || 'customer' 
    });
    return newUser;
  }
  static async verifUser(userData){
    const {email,user_id } = userData;
    const code = generateOtp6();
    const verified= await Mail.createAuthMail({email,user_id,code})
    const isValidCode = await Mail.verifycode(code, verified.password_hash);
     if (!isValidCode) {
      throw new Error('Mã code không đúng');
    }
    return verified;
   
  }  

  /**
   * Đăng nhập
   */
  static async login(email, password) {

    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

   
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng');
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
      throw new Error('User không tồn tại');
    }
    return user;
  }
}

module.exports = AuthService;
