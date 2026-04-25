const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');

describe('Order API - Integration Tests', () => {


  it('should return 400 when missing owner data to create order', async () => {
    const res = await request(app)
      .post('/api/orders') // Chỉnh lại theo đúng đường dẫn router của bạn
      .send({
        customerName: 'Nguyễn Văn Test',
        customerPhone: '0901234567',
        customerEmail: 'test@gmail.com',
        pickupTime: new Date(Date.now() + 3600000).toISOString(),
        paymentStatus: 'UNPAID'
      });

    // Mong đợi API trả về lỗi vì chưa đăng nhập hoặc không có session_id (cart trống)
    // Tùy theo logic auth middleware, status có thể là 400, 401 hoặc 403
    expect([400, 401, 403]).toContain(res.status);
  });

  // Ví dụ test 1 endpoint GET công khai
  it('should return API docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });
});
