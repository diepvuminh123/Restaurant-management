const AuthService = require("../services/authService");

class AuthController {
  /**
   * POST /api/auth/register
   * Đăng ký tài khoản mới
   */
  static async register(req, res) {
    try {
      const userData = req.body;
      const newUser = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: newUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/auth/verifyOtp
   * Xác thực mail
   */
  static async verifyOtp(req, res) {
    try {
      const { email, code } = req.body;
      const otpResult = await AuthService.verifyOtp({ email, code });
      if (otpResult.otp_type === "reset" && otpResult.allow_reset) {
        req.session.resetUserId = otpResult.user_id;
        req.session.resetEmail = otpResult.email;
      }

      res.status(200).json({
        success: true,
        message: "Xác thực thành công",
        ...otpResult,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  /**
   * POST /api/auth/sendOtp
   * Gửi mã xác thực
   */
  static async sendOtp(req, res) {
    try {
      const { email, OTPType } = req.body;
      console.log("userDataABC", { email, OTPType });

      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Email không tồn tại trong hệ thống",
        });
      }

      if (OTPType === "signup" && user.is_verified) {
        return res.status(400).json({
          success: false,
          message: "Tài khoản đã được xác thực",
        });
      }

      await AuthService.sendOtp({ email, OTPType });

      res.status(200).json({
        success: true,
        message: "Đã gửi mã xác thực vào email",
        data: {
          email: email,
          expiresIn: "10 phút",
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Đăng nhập
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);

      // Lưu thông tin vào session
      req.session.userId = user.user_id;
      req.session.username = user.username;
      req.session.userRole = user.role;

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          user: {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
  /**
   * POST /api/auth/resetPassword
   * Reset lại mật khẩu
   */
  static async resetPassword(req, res) {
    try {
      const userData = {
        ...req.body,
        userId: req.session.resetUserId,
      };

      console.log("userDataABC", userData);
      await AuthService.resetPassword(userData);

      delete req.session.resetUserId;
      delete req.session.resetEmail;
      
      res.status(201).json({
        success: true,
        message: "Đặt lại mk thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  /**
   * POST /api/auth/logout
   * Đăng xuất
   */
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Không thể đăng xuất",
          });
        }

        res.clearCookie(process.env.SESSION_NAME || "restaurant_session");
        res.json({
          success: true,
          message: "Đăng xuất thành công",
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/auth/me
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(req, res) {
    try {
      const userId = req.session.userId;
      const user = await AuthService.getCurrentUser(userId);

      res.json({
        success: true,
        data: {
          user: {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            role: user.role,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/auth/check
   * Kiểm tra trạng thái đăng nhập
   */
  static checkAuth(req, res) {
    if (req.session && req.session.userId) {
      res.json({
        success: true,
        isAuthenticated: true,
        data: {
          userId: req.session.userId,
          username: req.session.username,
          role: req.session.userRole,
        },
      });
    } else {
      res.json({
        success: true,
        isAuthenticated: false,
      });
    }
  }
}

module.exports = AuthController;
