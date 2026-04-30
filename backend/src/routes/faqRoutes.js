const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public route: Lấy danh sách FAQ đang active
router.get('/', faqController.getActiveFaqs);

// Admin routes: Quản lý FAQ
router.get('/admin', requireAuth, requireRole('admin'), faqController.getAllFaqs);
router.post('/', requireAuth, requireRole('admin'), faqController.createFaq);
router.put('/order', requireAuth, requireRole('admin'), faqController.updateOrder);
router.put('/:id', requireAuth, requireRole('admin'), faqController.updateFaq);
router.delete('/:id', requireAuth, requireRole('admin'), faqController.deleteFaq);

module.exports = router;
