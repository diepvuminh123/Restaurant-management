const request = require('supertest');

jest.mock('../../src/config/session', () => ({
  secret: 'test-secret', resave: false, saveUninitialized: true,
  name: 'test_session', cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));
jest.mock('../../src/config/database', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('../../src/services/restaurantInfoService');
jest.mock('../../src/services/authService');

const RestaurantInfoService = require('../../src/services/restaurantInfoService');
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

describe('Restaurant Info API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══ GET /api/restaurant-info (public) ═══
  describe('GET /api/restaurant-info', () => {
    it('should return 200 with info', async () => {
      RestaurantInfoService.getRestaurantInfo.mockResolvedValue({ id: 1, name: 'Nhà hàng ABC' });
      const res = await request(app).get('/api/restaurant-info');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Nhà hàng ABC');
    });
  });

  // ═══ POST /api/restaurant-info (admin only) ═══
  describe('POST /api/restaurant-info', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).post('/api/restaurant-info').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });

    it('should return 403 if customer', async () => {
      const cookies = await loginAs('customer');
      const res = await request(app).post('/api/restaurant-info').set('Cookie', cookies).send({ name: 'Test' });
      expect(res.status).toBe(403);
    });

    it('should return 201 for admin', async () => {
      const cookies = await loginAs('admin');
      RestaurantInfoService.createRestaurantInfo.mockResolvedValue({ id: 1 });
      const res = await request(app).post('/api/restaurant-info').set('Cookie', cookies)
        .send({ name: 'Nhà hàng', address_line: '123 Nguyen Trai', opening_time: '08:00', closing_time: '22:00' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tao thong tin nha hang thanh cong');
    });

    it('should forward 409 if info already exists', async () => {
      const cookies = await loginAs('admin');
      const err = new Error('Restaurant info da ton tai'); err.statusCode = 409;
      RestaurantInfoService.createRestaurantInfo.mockRejectedValue(err);
      const res = await request(app).post('/api/restaurant-info').set('Cookie', cookies)
        .send({ name: 'X', address_line: '456 Le Loi', opening_time: '08:00', closing_time: '22:00' });
      expect(res.status).toBe(409);
    });
  });

  // ═══ PUT /api/restaurant-info/:id (admin only) ═══
  describe('PUT /api/restaurant-info/:id', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).put('/api/restaurant-info/1').send({ name: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('should return 200 for admin', async () => {
      const cookies = await loginAs('admin');
      RestaurantInfoService.updateRestaurantInfo.mockResolvedValue({ id: 1 });
      const res = await request(app).put('/api/restaurant-info/1').set('Cookie', cookies)
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cap nhat thong tin nha hang thanh cong');
    });
  });
});
