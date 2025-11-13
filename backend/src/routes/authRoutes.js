const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { requireAuth, optionalAuth  } = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validations/authValidation');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới (customer, employee, admin)
 * @access  Public
 */
router.post('/register', validate(registerSchema), AuthController.register);
/**
 * @route   POST /api/auth/verifyEmail
 * @desc    Sau khi đăng ký tài khoản
 * @access  Private
 */

router.post('/verifyEmail', optionalAuth, AuthController.verifyMail);
/**
 * @route   POST /api/auth/reVerifyEmail
 * @desc    Gửi lại mail xác thực
 * @access  Private
 */

router.post('/reVerifyEmail', optionalAuth, AuthController.reVerifyMail);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập (tất cả các role)
 * @access  Public
 */

router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', requireAuth, AuthController.getCurrentUser);

/**
 * @route   GET /api/auth/check
 * @desc    Kiểm tra trạng thái đăng nhập
 * @access  Public
 */
router.get('/check', AuthController.checkAuth);

module.exports = router;
