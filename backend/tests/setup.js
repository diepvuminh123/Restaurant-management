const pool = require('../src/config/database');

// Đóng kết nối database sau khi chạy xong toàn bộ test
// Nếu không có dòng này, Jest sẽ bị treo (hang) sau khi chạy xong
afterAll(async () => {
  if (pool && typeof pool.end === 'function') {
    await pool.end();
  }
});
