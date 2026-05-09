const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public route: Lấy danh sách FAQ đang active
/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get active FAQs
 *     description: Retrieve FAQs visible to public users.
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Active FAQs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', faqController.getActiveFaqs);

// Admin routes: Quản lý FAQ
/**
 * @swagger
 * /api/faqs/admin:
 *   get:
 *     summary: Get all FAQs for admin
 *     description: Admin retrieves all FAQs including inactive items.
 *     tags: [FAQ]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: FAQs retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       500:
 *         description: Server error
 */
router.get('/admin', requireAuth, requireRole('admin'), faqController.getAllFaqs);
/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create FAQ
 *     description: Admin creates a new FAQ item.
 *     tags: [FAQ]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *                 example: What are your opening hours?
 *               answer:
 *                 type: string
 *                 example: We are open daily from 8:00 to 22:00.
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               sort_order:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *       400:
 *         description: Question and answer are required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       500:
 *         description: Server error
 */
router.post('/', requireAuth, requireRole('admin'), faqController.createFaq);
/**
 * @swagger
 * /api/faqs/order:
 *   put:
 *     summary: Update FAQ order
 *     description: Admin updates FAQ sort order in bulk.
 *     tags: [FAQ]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - sort_order
 *                   properties:
 *                     id:
 *                       type: integer
 *                     sort_order:
 *                       type: integer
 *                 example:
 *                   - id: 1
 *                     sort_order: 1
 *                   - id: 2
 *                     sort_order: 2
 *     responses:
 *       200:
 *         description: FAQ order updated successfully
 *       400:
 *         description: Items array is required
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       500:
 *         description: Server error
 */
router.put('/order', requireAuth, requireRole('admin'), faqController.updateOrder);
/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Update FAQ
 *     description: Admin updates an FAQ item.
 *     tags: [FAQ]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.put('/:id', requireAuth, requireRole('admin'), faqController.updateFaq);
/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Delete FAQ
 *     description: Admin deletes an FAQ item.
 *     tags: [FAQ]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', requireAuth, requireRole('admin'), faqController.deleteFaq);

module.exports = router;
