const request = require('supertest');

// Mock session config — bypass PostgreSQL session store
jest.mock('../../src/config/session', () => ({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  name: 'test_session',
  cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));

// Mock database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

// Mock UserAdminService
jest.mock('../../src/services/userAdminService');
const UserAdminService = require('../../src/services/userAdminService');

// Mock AuthService (needed for login flow to set session)
jest.mock('../../src/services/authService');
const AuthService = require('../../src/services/authService');

const app = require('../../src/app');

// Helper: login as admin and return session cookies
async function loginAsAdmin() {
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

  return loginRes.headers['set-cookie'];
}

describe('User Admin API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // Auth Middleware Guards
  // ═══════════════════════════════════════════════════
  describe('Auth Guards (No Login / Wrong Role)', () => {
    it('GET /api/users should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Bạn cần đăng nhập để thực hiện chức năng này');
    });

    it('PATCH /api/users/:id/role should return 401 if not logged in', async () => {
      const res = await request(app)
        .patch('/api/users/1/role')
        .send({ role: 'employee' });
      expect(res.status).toBe(401);
    });

    it('PATCH /api/users/:id/lock should return 401 if not logged in', async () => {
      const res = await request(app)
        .patch('/api/users/1/lock')
        .send({ locked: true });
      expect(res.status).toBe(401);
    });

    it('GET /api/users should return 403 if user is not admin', async () => {
      // Login as customer (not admin)
      AuthService.login.mockResolvedValue({
        user_id: 2,
        username: 'customer1',
        email: 'cust@test.com',
        full_name: 'Customer',
        phone: '111',
        role: 'customer',
        is_verified: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'cust@test.com', password: 'password123' });
      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/users')
        .set('Cookie', cookies);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Bạn không có quyền truy cập chức năng này');
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/users (Admin)
  // ═══════════════════════════════════════════════════
  describe('GET /api/users', () => {
    it('should return 200 with user list for admin', async () => {
      const cookies = await loginAsAdmin();

      UserAdminService.getUsers.mockResolvedValue({
        items: [{ user_id: 1, username: 'admin' }],
        pagination: { total: 1 },
      });

      const res = await request(app)
        .get('/api/users')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('total', 1);
    });
  });

  // ═══════════════════════════════════════════════════
  // PATCH /api/users/:id/role
  // ═══════════════════════════════════════════════════
  describe('PATCH /api/users/:id/role', () => {
    it('should return 200 on successful role update', async () => {
      const cookies = await loginAsAdmin();

      UserAdminService.updateUserRole.mockResolvedValue({
        user_id: 2,
        role: 'employee',
      });

      const res = await request(app)
        .patch('/api/users/2/role')
        .set('Cookie', cookies)
        .send({ role: 'employee' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cập nhật vai trò thành công');
    });

    it('should forward service error with correct statusCode', async () => {
      const cookies = await loginAsAdmin();

      const err = new Error('Không thể thay đổi vai trò của chính mình');
      err.statusCode = 409;
      UserAdminService.updateUserRole.mockRejectedValue(err);

      const res = await request(app)
        .patch('/api/users/1/role')
        .set('Cookie', cookies)
        .send({ role: 'customer' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════
  // PATCH /api/users/:id/lock
  // ═══════════════════════════════════════════════════
  describe('PATCH /api/users/:id/lock', () => {
    it('should return 200 on lock success', async () => {
      const cookies = await loginAsAdmin();

      UserAdminService.updateUserLockState.mockResolvedValue({ user_id: 3, is_locked: true });

      const res = await request(app)
        .patch('/api/users/3/lock')
        .set('Cookie', cookies)
        .send({ locked: true, lockHours: 24 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đã khóa tài khoản');
    });

    it('should return unlock message when locked=false', async () => {
      const cookies = await loginAsAdmin();

      UserAdminService.updateUserLockState.mockResolvedValue({ user_id: 3, is_locked: false });

      const res = await request(app)
        .patch('/api/users/3/lock')
        .set('Cookie', cookies)
        .send({ locked: false });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã mở khóa tài khoản');
    });
  });
});
