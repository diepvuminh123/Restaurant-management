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
  updateOrderNoteSchema,
} = require('../validations/orderValidation');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from active cart
 *     description: Create an order from current active cart and mark cart as CHECKED_OUT.
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

/**
 * @swagger
 * /api/orders/lookup:
 *   get:
 *     summary: Guest lookup takeaway orders
 *     description: Lookup order history by one of order_code, customer_phone or customer_email.
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: order_code
 *         schema:
 *           type: string
 *         description: Order code (highest priority if provided)
 *       - in: query
 *         name: customer_phone
 *         schema:
 *           type: string
 *         description: Customer phone
 *       - in: query
 *         name: customer_email
 *         schema:
 *           type: string
 *         description: Customer email
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *     responses:
 *       200:
 *         description: Lookup success
 *       400:
 *         description: Invalid query
 */
router.get(
  '/orders/lookup',
  validateQuery(guestOrderLookupQuerySchema),
  OrderController.lookupOrdersForGuest
);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current user's takeaway orders
 *     description: Returns paginated takeaway orders for logged-in user.
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *     responses:
 *       200:
 *         description: Query success
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/orders/my',
  requireAuth,
  validateQuery(myOrderHistoryQuerySchema),
  OrderController.getOrdersForUser
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get takeaway orders for staff
 *     description: Admin/Employee retrieves paginated takeaway orders with filters.
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: 2026-04-14
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Query success
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
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
 *     description: Employee/Admin confirms that customer has paid the deposit.
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

/**
 * @swagger
 * /api/orders/my/{id}/cancel:
 *   patch:
 *     summary: User cancels own takeaway order
 *     description: Logged-in user can cancel own order if it is not completed.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Khach thay doi lich nhan mon
 *     responses:
 *       200:
 *         description: Canceled successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Order not found or not owned by user
 *       409:
 *         description: Order already completed
 */
router.patch(
  '/orders/my/:id/cancel',
  requireAuth,
  validateParams(orderIdParamSchema),
  validate(cancelOrderSchema),
  OrderController.cancelOrderForUser
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Staff/Admin cancels takeaway order
 *     description: Employee/Admin cancels any takeaway order for operational handling.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Het nguyen lieu
 *     responses:
 *       200:
 *         description: Canceled successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Order not found
 */
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
