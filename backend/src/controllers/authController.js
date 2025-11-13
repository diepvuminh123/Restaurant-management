const AuthService = require('../services/authService');

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
        message: 'Đăng ký thành công',
        data: newUser
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/auth/verifyMail
   * Xác thực mail
   */
  static async verifyMail(req, res) {
    try {
      const userData = req.body;
      await AuthService.verifUser(userData);
      res.status(201).json({
        success: true,
        message: 'xác thực thành công',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  /**
   * POST /api/auth/reVerifyMail
   * Gửi lại mail xác thực
   */
  static async reVerifyMail(req, res) {
    try {
      const userData = req.body;
       console.log("userDataABC", userData); 
      const verified = await AuthService.checkAuth(userData.user_id); // Kiểm tra xác thực chưa aj
      console.log("verified", verified); 
      if(verified){
        throw new Error("Tài khoản đã được xác thực");
      }
      await AuthService.reVerifUser(userData);
      res.status(201).json({
        success: true,
        message: 'Đã gửi lại xác thực thành công',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
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
        message: 'Đăng nhập thành công',
        data: {
          user: {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
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
            message: 'Không thể đăng xuất'
          });
        }

        res.clearCookie(process.env.SESSION_NAME || 'restaurant_session');
        res.json({
          success: true,
          message: 'Đăng xuất thành công'
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
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
            createdAt: user.created_at
          }
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
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
          role: req.session.userRole
        }
      });
    } else {
      res.json({
        success: true,
        isAuthenticated: false
      });
    }
  }
}

module.exports = AuthController;
