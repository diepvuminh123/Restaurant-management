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

// Mock CartService
jest.mock('../../src/services/cartService');
const CartService = require('../../src/services/cartService');

// Mock AuthService (needed for login helper)
jest.mock('../../src/services/authService');
const AuthService = require('../../src/services/authService');

const app = require('../../src/app');

// Helper: login and return cookies
async function loginAsUser() {
  AuthService.login.mockResolvedValue({
    user_id: 1, username: 'user1', email: 'user@test.com',
    full_name: 'User', phone: '000', role: 'customer', is_verified: true,
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'pass123' });
  return res.headers['set-cookie'];
}

describe('Cart API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // GET /api/cart (optionalAuth — both guest and user)
  // ═══════════════════════════════════════════════════
  describe('GET /api/cart', () => {
    it('should return 200 with cart for guest (no login)', async () => {
      CartService.getCurrentCart.mockResolvedValue({ items: [], total_amount: 0 });

      const res = await request(app).get('/api/cart');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });

    it('should return 200 with cart for logged-in user', async () => {
      const cookies = await loginAsUser();
      CartService.getCurrentCart.mockResolvedValue({ items: [{ id: 1 }], total_amount: 50000 });

      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should return 500 if service throws', async () => {
      CartService.getCurrentCart.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/cart');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Lỗi khi lấy giỏ hàng');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/cart/items
  // ═══════════════════════════════════════════════════
  describe('POST /api/cart/items', () => {
    it('should return 400 if menu_item_id is missing', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
    });

    it('should return 200 on success', async () => {
      CartService.addItemToCart.mockResolvedValue({ items: [{ id: 1 }], total_amount: 50000 });

      const res = await request(app)
        .post('/api/cart/items')
        .send({ menu_item_id: 10, quantity: 2, note: 'Không hành' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã thêm món vào giỏ hàng');
    });
  });

  // ═══════════════════════════════════════════════════
  // PUT /api/cart/items/:id
  // ═══════════════════════════════════════════════════
  describe('PUT /api/cart/items/:id', () => {
    it('should return 200 on success', async () => {
      CartService.updateCartItem.mockResolvedValue({ items: [] });

      const res = await request(app)
        .put('/api/cart/items/1')
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã cập nhật giỏ hàng');
    });

    it('should return 500 if service throws', async () => {
      CartService.updateCartItem.mockRejectedValue(new Error('Item not found'));

      const res = await request(app)
        .put('/api/cart/items/1')
        .send({ quantity: 3 });

      expect(res.status).toBe(500);
    });
  });

  // ═══════════════════════════════════════════════════
  // DELETE /api/cart/items/:id
  // ═══════════════════════════════════════════════════
  describe('DELETE /api/cart/items/:id', () => {
    it('should return 200 on success', async () => {
      CartService.removeItemFromCart.mockResolvedValue({ items: [] });

      const res = await request(app).delete('/api/cart/items/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã xóa món khỏi giỏ hàng');
    });
  });

  // ═══════════════════════════════════════════════════
  // DELETE /api/cart (Clear all)
  // ═══════════════════════════════════════════════════
  describe('DELETE /api/cart', () => {
    it('should return 200 on success', async () => {
      CartService.clearCart.mockResolvedValue({ items: [] });

      const res = await request(app).delete('/api/cart');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã xóa toàn bộ giỏ hàng');
    });
  });

  // ═══════════════════════════════════════════════════
  // POST /api/cart/migrate
  // ═══════════════════════════════════════════════════
  describe('POST /api/cart/migrate', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app)
        .post('/api/cart/migrate')
        .send({ guest_session_id: 'abc' });

      // Controller checks req.session.userId manually
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Bạn cần đăng nhập để thực hiện chức năng này');
    });

    it('should return 200 on success when logged in', async () => {
      const cookies = await loginAsUser();
      CartService.migrateGuestCart.mockResolvedValue({ items: [] });

      const res = await request(app)
        .post('/api/cart/migrate')
        .set('Cookie', cookies)
        .send({ guest_session_id: 'old_session_123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã chuyển giỏ hàng sang tài khoản');
    });
  });

  // ═══════════════════════════════════════════════════
  // GET /api/cart/validate
  // ═══════════════════════════════════════════════════
  describe('GET /api/cart/validate', () => {
    it('should return 200 with validation result', async () => {
      CartService.validateCart.mockResolvedValue({ valid: true });

      const res = await request(app).get('/api/cart/validate');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('valid', true);
    });
  });
});
