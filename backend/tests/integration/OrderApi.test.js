const request = require('supertest');

jest.mock('../../src/config/session', () => ({
  secret: 'test-secret', resave: false, saveUninitialized: true,
  name: 'test_session', cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));
jest.mock('../../src/config/database', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('../../src/services/orderService');
jest.mock('../../src/services/authService');

const OrderService = require('../../src/services/orderService');
const AuthService = require('../../src/services/authService');
const app = require('../../src/app');

async function loginAs(role) {
  AuthService.login.mockResolvedValue({
    user_id: 1, username: role, email: `${role}@test.com`,
    full_name: role, phone: '000', role, is_verified: true,
  });
  const res = await request(app).post('/api/auth/login').send({ email: `${role}@test.com`, password: 'p' });
  return res.headers['set-cookie'];
}

describe('Order API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  // ═══ POST /api/orders (optionalAuth) ═══
  describe('POST /api/orders', () => {
    it('should return 403 if admin tries to create order', async () => {
      const cookies = await loginAs('admin');
      const res = await request(app).post('/api/orders').set('Cookie', cookies)
        .send({ customer_name: 'Admin User', customer_phone: '0123456789', customer_email: 'a@a.com', pickup_time: new Date(Date.now() + 3600000).toISOString(), payment_method: 'zalopay' });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Tài khoản admin không được phép tạo đơn mang đi');
    });

    it('should return 400 if validation fails (missing fields)', async () => {
      const res = await request(app).post('/api/orders').send({});
      expect(res.status).toBe(400);
    });

    it('should return 201 on success', async () => {
      OrderService.createOrder.mockResolvedValue({ id: 1 });
      const res = await request(app).post('/api/orders')
        .send({ customer_name: 'Nguyen Van Test', customer_phone: '0123456789', customer_email: 'a@a.com', pickup_time: new Date(Date.now() + 3600000).toISOString(), payment_method: 'zalopay' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Đặt món thành công');
    });
  });

  // ═══ GET /api/orders (staff only) ═══
  describe('GET /api/orders (staff)', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return 403 if not admin/employee', async () => {
      const cookies = await loginAs('customer');
      const res = await request(app).get('/api/orders').set('Cookie', cookies);
      expect(res.status).toBe(403);
    });

    it('should return 200 for employee', async () => {
      const cookies = await loginAs('employee');
      OrderService.getOrdersForStaff.mockResolvedValue({ items: [], pagination: {} });
      const res = await request(app).get('/api/orders').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══ GET /api/orders/my (requireAuth) ═══
  describe('GET /api/orders/my', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/orders/my');
      expect(res.status).toBe(401);
    });

    it('should return 200 for logged-in user', async () => {
      const cookies = await loginAs('customer');
      OrderService.getOrdersForUser.mockResolvedValue({ items: [], pagination: {} });
      const res = await request(app).get('/api/orders/my').set('Cookie', cookies);
      expect(res.status).toBe(200);
    });
  });

  // ═══ PATCH /api/orders/:id/status (staff) ═══
  describe('PATCH /api/orders/:id/status', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).patch('/api/orders/1/status').send({ status: 'READY' });
      expect(res.status).toBe(401);
    });

    it('should return 200 for employee', async () => {
      const cookies = await loginAs('employee');
      OrderService.updateOrderStatus.mockResolvedValue({ id: 1, status: 'READY' });
      const res = await request(app).patch('/api/orders/1/status').set('Cookie', cookies).send({ status: 'READY' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật trạng thái đơn hàng thành công');
    });
  });

  // ═══ PATCH /api/orders/:id/deposit-confirm (staff) ═══
  describe('PATCH /api/orders/:id/deposit-confirm', () => {
    it('should return 200 on success', async () => {
      const cookies = await loginAs('employee');
      OrderService.confirmDeposit.mockResolvedValue({ id: 1 });
      const res = await request(app).patch('/api/orders/1/deposit-confirm').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã xác nhận đơn hàng đã cọc');
    });
  });

  // ═══ PATCH /api/orders/:id/cancel (staff) ═══
  describe('PATCH /api/orders/:id/cancel (staff)', () => {
    it('should return 200 on success', async () => {
      const cookies = await loginAs('employee');
      OrderService.cancelOrder.mockResolvedValue({ id: 1 });
      const res = await request(app).patch('/api/orders/1/cancel').set('Cookie', cookies).send({ reason: 'Hết hàng' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã hủy đơn hàng');
    });
  });

  // ═══ PATCH /api/orders/my/:id/cancel (user) ═══
  describe('PATCH /api/orders/my/:id/cancel (user)', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).patch('/api/orders/my/1/cancel');
      expect(res.status).toBe(401);
    });

    it('should return 200 for logged-in user', async () => {
      const cookies = await loginAs('customer');
      OrderService.cancelOrderForUser.mockResolvedValue({ id: 1 });
      const res = await request(app).patch('/api/orders/my/1/cancel').set('Cookie', cookies).send({ reason: 'Đổi ý' });
      expect(res.status).toBe(200);
    });
  });

  // ═══ PATCH /api/orders/:id/note (staff) ═══
  describe('PATCH /api/orders/:id/note', () => {
    it('should return 200 on success', async () => {
      const cookies = await loginAs('employee');
      OrderService.updateOrderNote.mockResolvedValue({ id: 1 });
      const res = await request(app).patch('/api/orders/1/note').set('Cookie', cookies).send({ note: 'Thêm ớt' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật ghi chú thành công');
    });
  });

  // ═══ GET /api/orders/lookup (public) ═══
  describe('GET /api/orders/lookup', () => {
    it('should return 200 with results', async () => {
      OrderService.lookupOrdersForGuest.mockResolvedValue({ items: [], pagination: {} });
      const res = await request(app).get('/api/orders/lookup?order_code=ABC');
      expect(res.status).toBe(200);
    });
  });
});
