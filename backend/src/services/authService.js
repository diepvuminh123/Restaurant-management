const User = require('../models/User');

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

    // Tạo user mới
    const newUser = await User.create({
      username,
      email,
      password,
      fullName,
      phone,
      role: role || 'customer' // Mặc định là customer
    });

    return newUser;
  }

  /**
   * Đăng nhập
   */
  static async login(username, password) {
    // Tìm user theo username
    const user = await User.findByUsername(username);
    if (!user) {
      throw new Error('Username1 hoặc mật khẩu không đúng');
    }

    // Xác thực mật khẩu
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Username2 hoặc mật khẩu không đúng');
    }

    // Trả về user (không bao gồm password)
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
