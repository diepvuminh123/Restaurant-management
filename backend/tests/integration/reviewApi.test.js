const request = require('supertest');

jest.mock('../../src/config/session', () => ({
  secret: 'test-secret', resave: false, saveUninitialized: true,
  name: 'test_session', cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));
jest.mock('../../src/config/database', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('../../src/services/reviewService');
jest.mock('../../src/services/authService');

const ReviewService = require('../../src/services/reviewService');
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

describe('Review API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══ POST /api/reviews (requireAuth) ═══
  describe('POST /api/reviews', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).post('/api/reviews').send({ menu_item_id: 1, rating: 5 });
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const cookies = await loginAs('customer');
      const res = await request(app).post('/api/reviews').set('Cookie', cookies).send({});
      expect(res.status).toBe(400);
    });

    it('should return 201 on success', async () => {
      const cookies = await loginAs('customer');
      ReviewService.createReview.mockResolvedValue({ id: 1, rating: 5 });
      const res = await request(app).post('/api/reviews').set('Cookie', cookies)
        .send({ menu_item_id: 1, rating: 5, comment: 'Ngon' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tạo review thành công');
    });
  });

  // ═══ PATCH /api/reviews/:id (requireAuth) ═══
  describe('PATCH /api/reviews/:id', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).patch('/api/reviews/1').send({ rating: 4 });
      expect(res.status).toBe(401);
    });

    it('should return 200 on success', async () => {
      const cookies = await loginAs('customer');
      ReviewService.updateOwnReview.mockResolvedValue({ id: 1, rating: 4 });
      const res = await request(app).patch('/api/reviews/1').set('Cookie', cookies).send({ rating: 4 });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật review thành công');
    });
  });

  // ═══ DELETE /api/reviews/:id (requireAuth) ═══
  describe('DELETE /api/reviews/:id', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).delete('/api/reviews/1');
      expect(res.status).toBe(401);
    });

    it('should return 200 on success', async () => {
      const cookies = await loginAs('customer');
      ReviewService.deleteOwnReview.mockResolvedValue(true);
      const res = await request(app).delete('/api/reviews/1').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Xóa review thành công');
    });
  });

  // ═══ GET /api/menus/:menuItemId/reviews (public) ═══
  describe('GET /api/menus/:menuItemId/reviews', () => {
    it('should return 200 with reviews', async () => {
      ReviewService.getPublicReviewsByMenuItem.mockResolvedValue({
        items: [{ id: 1, rating: 5 }], menu_item: { id: 1 }, pagination: { total: 1 },
      });
      const res = await request(app).get('/api/menus/1/reviews');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ═══ POST /api/reviews/:id/reports (requireAuth) ═══
  describe('POST /api/reviews/:id/reports', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).post('/api/reviews/1/reports').send({ reason: 'spam' });
      expect(res.status).toBe(401);
    });

    it('should return 201 on success', async () => {
      const cookies = await loginAs('customer');
      ReviewService.reportReview.mockResolvedValue(true);
      const res = await request(app).post('/api/reviews/1/reports').set('Cookie', cookies)
        .send({ reason: 'spam' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Report review thành công');
    });
  });

  // ═══ Admin routes ═══
  describe('Admin Review Routes', () => {
    it('GET /api/admin/reviews/reported should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/admin/reviews/reported');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/reviews/reported should return 403 for customer', async () => {
      const cookies = await loginAs('customer');
      const res = await request(app).get('/api/admin/reviews/reported').set('Cookie', cookies);
      expect(res.status).toBe(403);
    });

    it('GET /api/admin/reviews/reported should return 200 for admin', async () => {
      const cookies = await loginAs('admin');
      ReviewService.getReportedReviewsForAdmin.mockResolvedValue({ items: [], pagination: {} });
      const res = await request(app).get('/api/admin/reviews/reported').set('Cookie', cookies);
      expect(res.status).toBe(200);
    });

    it('PATCH /api/admin/reviews/:id/visibility should return 200', async () => {
      const cookies = await loginAs('admin');
      ReviewService.updateReviewVisibilityForAdmin.mockResolvedValue({ id: 1, is_hidden: true });
      const res = await request(app).patch('/api/admin/reviews/1/visibility').set('Cookie', cookies)
        .send({ is_hidden: true, hidden_reason: 'Spam' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Đã ẩn review');
    });
  });
});
