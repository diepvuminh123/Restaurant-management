const request = require('supertest');

// Mock session config BEFORE loading app - bypass PostgreSQL session store
jest.mock('../../src/config/session', () => ({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  name: 'test_session',
  cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));

// Mock database pool to prevent real DB connections
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

// Mock AuthService — we only test Controller behavior, not business logic
jest.mock('../../src/services/authService');
const AuthService = require('../../src/services/authService');

const app = require('../../src/app');

describe('Auth API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // POST /api/auth/register
  // ═══════════════════════════════════════════════════
  describe('POST /api/auth/register', () => {
    it('should return 400 if validation fails (missing fields)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab' }); // too short, missing email/password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Dữ liệu không hợp lệ');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 201 on successful registration', async () => {
      AuthService.register.mockResolvedValue({
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đăng ký thành công');
      expect(res.body.data).toHaveProperty('username', 'testuser');
    });

    it('should return 400 if service throws (e.g. username exists)', async () => {
      AuthService.register.mockRejectedValue(new Error('Username đã tồn tại'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username đã tồn tại');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/auth/login
  // ═══════════════════════════════════════════════════
  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and set session cookie on success', async () => {
      AuthService.login.mockResolvedValue({
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '0123456789',
        role: 'customer',
        is_verified: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đăng nhập thành công');
      expect(res.body.data.user).toHaveProperty('userId', 1);
      expect(res.body.data.user).toHaveProperty('role', 'customer');
      // Session cookie should be set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 if credentials are invalid', async () => {
      AuthService.login.mockRejectedValue(new Error('Sai mật khẩu'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Sai mật khẩu');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/auth/verifyOtp
  // ═══════════════════════════════════════════════════
  describe('POST /api/auth/verifyOtp', () => {
    it('should return 400 if OTP code format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/verifyOtp')
        .send({ email: 'test@example.com', code: 'abcdef' }); // not numeric

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 on successful OTP verification', async () => {
      AuthService.verifyOtp.mockResolvedValue({
        otp_type: 'signup',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/auth/verifyOtp')
        .send({ email: 'test@example.com', code: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Xác thực thành công');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/auth/sendOtp
  // ═══════════════════════════════════════════════════
  describe('POST /api/auth/sendOtp', () => {
    it('should return 400 if OTPType is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/sendOtp')
        .send({ email: 'test@example.com', OTPType: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should return 404 if email not found', async () => {
      AuthService.getUserByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/sendOtp')
        .send({ email: 'notfound@example.com', OTPType: 'signup' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Email không tồn tại trong hệ thống');
    });

    it('should return 200 on success', async () => {
      AuthService.getUserByEmail.mockResolvedValue({ email: 'test@example.com', is_verified: false });
      AuthService.sendOtp.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/sendOtp')
        .send({ email: 'test@example.com', OTPType: 'signup' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/auth/resetPassword
  // ═══════════════════════════════════════════════════
  describe('POST /api/auth/resetPassword', () => {
    it('should return 400 if newPassword is missing', async () => {
      const res = await request(app)
        .post('/api/auth/resetPassword')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 201 on success', async () => {
      AuthService.resetPassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/resetPassword')
        .send({ newPassword: 'newpass123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════
  // Protected routes (require login)
  // ═══════════════════════════════════════════════════
  describe('Protected Auth Routes', () => {
    it('POST /api/auth/logout should return 401 if not logged in', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Bạn cần đăng nhập để thực hiện chức năng này');
    });

    it('GET /api/auth/me should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/changePassword should return 401 if not logged in', async () => {
      const res = await request(app)
        .post('/api/auth/changePassword')
        .send({ currentPassword: 'old', newPassword: 'newpass123' });
      expect(res.status).toBe(401);
    });

    it('PUT /api/auth/profile should return 401 if not logged in', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ username: 'newname' });
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/auth/check (public)
  // ═══════════════════════════════════════════════════
  describe('GET /api/auth/check', () => {
    it('should return isAuthenticated: false when not logged in', async () => {
      const res = await request(app).get('/api/auth/check');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isAuthenticated).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════
  // Full Login -> Protected route flow
  // ═══════════════════════════════════════════════════
  describe('Authenticated Flow (Login -> Me -> Logout)', () => {
    it('should access protected route after login', async () => {
      // Step 1: Login
      AuthService.login.mockResolvedValue({
        user_id: 1,
        username: 'admin',
        email: 'admin@test.com',
        full_name: 'Admin',
        phone: '000',
        role: 'admin',
        is_verified: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      expect(loginRes.status).toBe(200);
      const cookies = loginRes.headers['set-cookie'];

      // Step 2: Access /me with session cookie
      AuthService.getCurrentUser = jest.fn().mockResolvedValue({
        user_id: 1,
        username: 'admin',
        email: 'admin@test.com',
        full_name: 'Admin',
        phone: '000',
        role: 'admin',
        created_at: new Date(),
      });

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user).toHaveProperty('userId', 1);

      // Step 3: Logout with session cookie
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Đăng xuất thành công');
    });
  });

  // ═══════════════════════════════════════════════════
  // 404 Handler
  // ═══════════════════════════════════════════════════
  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/auth/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('API endpoint không tồn tại');
    });
  });
});
