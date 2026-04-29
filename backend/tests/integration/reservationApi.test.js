const request = require('supertest');

jest.mock('../../src/config/session', () => ({
  secret: 'test-secret', resave: false, saveUninitialized: true,
  name: 'test_session', cookie: { maxAge: 86400000, httpOnly: false, secure: false },
}));
jest.mock('../../src/config/database', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('../../src/services/reservationService');
jest.mock('../../src/services/authService');
jest.mock('../../src/models/User');
jest.mock('../../src/reservationMailer', () => jest.fn().mockResolvedValue(true));

const ReservationService = require('../../src/services/reservationService');
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

describe('Reservation API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  // ═══ POST /api/reservations (optionalAuth) ═══
  describe('POST /api/reservations', () => {
    it('should return 201 on success', async () => {
      ReservationService.createReservation.mockResolvedValue({ reservation_id: 1 });
      const res = await request(app).post('/api/reservations')
        .send({ reservation_time: new Date(Date.now() + 86400000).toISOString(), number_of_guests: 2, table_id: 1 });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Đặt bàn thành công');
    });

    it('should return 400 if service throws', async () => {
      ReservationService.createReservation.mockRejectedValue(new Error('Bàn không khả dụng'));
      const res = await request(app).post('/api/reservations')
        .send({ reservation_time: new Date(Date.now() + 86400000).toISOString(), number_of_guests: 2, table_id: 1 });
      expect(res.status).toBe(400);
    });
  });

  // ═══ GET /api/reservations/history (requireAuth) ═══
  describe('GET /api/reservations/history', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/reservations/history');
      expect(res.status).toBe(401);
    });

    it('should return 200 for logged-in user', async () => {
      const cookies = await loginAs('customer');
      ReservationService.getReservationHistory.mockResolvedValue([]);
      const res = await request(app).get('/api/reservations/history').set('Cookie', cookies);
      expect(res.status).toBe(200);
    });
  });

  // ═══ DELETE /api/reservations/history/:id/cancel (requireAuth) ═══
  describe('DELETE /api/reservations/history/:id/cancel', () => {
    it('should return 401 if not logged in', async () => {
      const res = await request(app).delete('/api/reservations/history/1/cancel');
      expect(res.status).toBe(401);
    });

    it('should return 200 on success', async () => {
      const cookies = await loginAs('customer');
      ReservationService.cancelReservation.mockResolvedValue(true);
      const res = await request(app).delete('/api/reservations/history/1/cancel').set('Cookie', cookies);
      expect(res.status).toBe(200);
    });
  });

  // ═══ Staff routes (requireRole) ═══
  describe('Staff Reservation Routes', () => {
    it('GET /api/reservations/staff should return 401 if not logged in', async () => {
      const res = await request(app).get('/api/reservations/staff');
      expect(res.status).toBe(401);
    });

    it('GET /api/reservations/staff should return 403 for customer', async () => {
      const cookies = await loginAs('customer');
      const res = await request(app).get('/api/reservations/staff').set('Cookie', cookies);
      expect(res.status).toBe(403);
    });

    it('GET /api/reservations/staff should return 200 for employee', async () => {
      const cookies = await loginAs('employee');
      ReservationService.getReservationsForStaff.mockResolvedValue({ data: [], meta: {} });
      const res = await request(app).get('/api/reservations/staff').set('Cookie', cookies);
      expect(res.status).toBe(200);
    });

    it('POST /api/reservations/staff/createReservation should return 201', async () => {
      const cookies = await loginAs('employee');
      ReservationService.createReservationForStaff.mockResolvedValue({ reservation_id: 99 });
      const res = await request(app).post('/api/reservations/staff/createReservation').set('Cookie', cookies)
        .send({ reservation_time: new Date(Date.now() + 86400000).toISOString(), number_of_guests: 4, table_id: 2, customer_name: 'Khach Test', customer_phone: '0901234567' });
      expect(res.status).toBe(201);
    });

    it('PUT /api/reservations/staff/updateReservationStatus/:id should return 200', async () => {
      const cookies = await loginAs('employee');
      ReservationService.updateReservationStatusForStaff.mockResolvedValue({ id: 1 });
      const res = await request(app).put('/api/reservations/staff/updateReservationStatus/1').set('Cookie', cookies)
        .send({ reservation_state: 'ON_SERVING' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cập nhật trạng thái đặt bàn thành công');
    });
  });
});
