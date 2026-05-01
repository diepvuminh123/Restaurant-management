const express = require('express');
const router = express.Router();
const sseController = require('../controllers/sseController');

/**
 * Endpoint đăng ký nhận luồng sự kiện thời gian thực
 */
router.get('/stream', sseController.setupOrderStream);

module.exports = router;
