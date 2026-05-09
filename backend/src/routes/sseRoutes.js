const express = require('express');
const router = express.Router();
const sseController = require('../controllers/sseController');

/**
 * Endpoint đăng ký nhận luồng sự kiện thời gian thực
 */
/**
 * @swagger
 * /api/orders/stream:
 *   get:
 *     summary: Subscribe to order event stream
 *     description: Open a Server-Sent Events connection for real-time order updates.
 *     tags: [SSE]
 *     responses:
 *       200:
 *         description: SSE stream connected
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"message\":\"Connected to order stream\"}\n\n"
 *       500:
 *         description: Server error
 */
router.get('/stream', sseController.setupOrderStream);

module.exports = router;
