const sseService = require('../services/sseService');

/**
 * Xử lý kết nối SSE cho đơn hàng
 */
exports.setupOrderStream = (req, res) => {

  // Không set CORS header thủ công ở đây — đã được xử lý bởi CORS middleware trong app.js
  res.setHeader('Content-Type', 'text/event-stream');
  // Không cache
  res.setHeader('Cache-Control', 'no-cache');
  // Cho phép kết nối lâu dài
  res.setHeader('Connection', 'keep-alive');
  // Tắt buffering trên Nginx/Render proxy để SSE hoạt động đúng
  res.setHeader('X-Accel-Buffering', 'no');
  // Đẩy response ra ngay lập tức
  res.flushHeaders();

  // Thông tin user từ session
  // Lưu ý: auth middleware lưu là req.session.userId và req.session.userRole (không phải req.session.user.id)
  const metadata = {
    userId: req.session?.userId || null,
    role: req.session?.userRole || null,
    sessionId: req.sessionID || null
  };

  console.log(`[SSE] New connection — userId: ${metadata.userId}, role: ${metadata.role}, sessionId: ${metadata.sessionId}`);

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
