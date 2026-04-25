require('dotenv').config();
const app = require('./app');
const takeawayAutomationService = require('./services/takeawayAutomationService');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  takeawayAutomationService.start();
});

// Graceful shutdown
function shutdown() {
  console.log('Đang tắt server an toàn...');
  takeawayAutomationService.stop();
  if (server) {
    server.close(() => {
      console.log('Đã đóng các kết nối.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown); // Nhận tín hiệu Ctrl + C
process.on('SIGTERM', shutdown); // Nhận tín hiệu kill (từ Docker, PM2)
