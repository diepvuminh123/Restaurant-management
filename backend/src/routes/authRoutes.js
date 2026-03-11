const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { requireAuth, optionalAuth  } = require('../middlewares/auth');
const { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema,resetPasswordSchema } = require('../validations/authValidation');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new account
 *     description: Create a new user account (customer, employee, or admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "user123"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [customer, employee, admin]
 *                 default: customer
 *                 example: "customer"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/verifyOtp:
 *   post:
 *     summary: Verify OTP code
 *     description: Verify the OTP code sent to user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verifyOtp', validate(verifyOtpSchema), AuthController.verifyOtp);

/**
 * @swagger
 * /api/auth/sendOtp:
 *   post:
 *     summary: Send OTP via email
 *     description: Send OTP code to user's email for signup or password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - OTPType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               OTPType:
 *                 type: string
 *                 enum: [signup, reset]
 *                 example: "signup"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email or type
 */
router.post('/sendOtp', validate(sendOtpSchema), AuthController.sendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and create session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/resetPassword:
 *   post:
 *     summary: Reset password
 *     description: Reset user password (after OTP verification)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 */
router.post('/resetPassword', validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: End user session and logout
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve information of the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', requireAuth, AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Check authentication status
 *     description: Check if user is currently authenticated
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/check', AuthController.checkAuth);

module.exports = router;
