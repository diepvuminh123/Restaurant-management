const sseService = require('../services/sseService');

/**
 * Xử lý kết nối SSE cho đơn hàng
 */
exports.setupOrderStream = (req, res) => {
  // Thiết lập headers cho SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true'
  });

  // Thông tin user từ session
  const metadata = {
    userId: req.session?.user?.id || null,
    role: req.session?.user?.role || null,
    sessionId: req.sessionID || null
  };

  // Thêm client vào service
  const clientId = sseService.addClient(res, metadata);

  // Gửi sự kiện chào mừng
  res.write(`data: ${JSON.stringify({ message: 'Connected to order stream' })}\n\n`);

  // Cơ chế heartbeat giữ kết nối (mỗi 30s)
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Xử lý khi ngắt kết nối
  req.on('close', () => {
    clearInterval(heartbeat);
    sseService.removeClient(clientId);
    res.end();
  });
};
