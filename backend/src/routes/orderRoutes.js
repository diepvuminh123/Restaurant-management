const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createOrderSchema } = require('../validations/orderValidation');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from active cart
 *     description: Create an order from current active cart and mark cart as CHECKED_OUT
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - customer_phone
 *               - customer_email
 *               - pickup_time
 *               - payment_method
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               customer_phone:
 *                 type: string
 *                 example: 0912345678
 *               customer_email:
 *                 type: string
 *                 example: customer@example.com
 *               pickup_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-03-21T18:30:00.000Z
 *               note:
 *                 type: string
 *                 example: Khong hanh
 *               payment_method:
 *                 type: string
 *                 enum: [zalopay, acb, vietcombank]
 *                 example: zalopay
 *               deposit_paid:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid payload or cart state
 *       409:
 *         description: Cart already checked out
 *       500:
 *         description: Server error
 */
router.post('/orders', optionalAuth, validate(createOrderSchema), OrderController.createOrder);

module.exports = router;
