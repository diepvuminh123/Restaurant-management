const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');
const validateParams = require('../middlewares/validateParams');
const {
	createOrderSchema,
	orderIdParamSchema,
	getOrdersForStaffQuerySchema,
	guestOrderLookupQuerySchema,
	myOrderHistoryQuerySchema,
	updateOrderStatusSchema,
	cancelOrderSchema,
	updateOrderNoteSchema
} = require('../validations/orderValidation');

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

router.get(
	'/orders/lookup',
	validateQuery(guestOrderLookupQuerySchema),
	OrderController.lookupOrdersForGuest
);

router.get(
	'/orders/my',
	requireAuth,
	validateQuery(myOrderHistoryQuerySchema),
	OrderController.getOrdersForUser
);

router.get(
	'/orders',
	requireRole('admin', 'employee'),
	validateQuery(getOrdersForStaffQuerySchema),
	OrderController.getOrdersForStaff
);

router.get(
	'/orders/:id',
	requireRole('admin', 'employee'),
	validateParams(orderIdParamSchema),
	OrderController.getOrderDetailForStaff
);

router.patch(
	'/orders/:id/status',
	requireRole('admin', 'employee'),
	validateParams(orderIdParamSchema),
	validate(updateOrderStatusSchema),
	OrderController.updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{id}/deposit-confirm:
 *   patch:
 *     summary: Confirm order deposit
 *     description: Employee/Admin confirms that customer has paid the deposit
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Deposit confirmed successfully
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Order not found
 *       409:
 *         description: Invalid payment/order state for confirming deposit
 */
router.patch(
	'/orders/:id/deposit-confirm',
	requireRole('admin', 'employee'),
	validateParams(orderIdParamSchema),
	OrderController.confirmDeposit
);

router.patch(
	'/orders/:id/cancel',
	requireRole('admin', 'employee'),
	validateParams(orderIdParamSchema),
	validate(cancelOrderSchema),
	OrderController.cancelOrder
);

router.patch(
	'/orders/:id/note',
	requireRole('admin', 'employee'),
	validateParams(orderIdParamSchema),
	validate(updateOrderNoteSchema),
	OrderController.updateOrderNote
);

module.exports = router;
