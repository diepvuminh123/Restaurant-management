const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotionController');
const { requireAuth, requireRole, optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');
const validateParams = require('../middlewares/validateParams');
const {
  createPromotionSchema,
  updatePromotionSchema,
  validatePromotionSchema,
  getPromotionsQuerySchema,
  promotionIdParamSchema
} = require('../validations/promotionValidation');

/**
 * @swagger
 * /api/promotions/validate:
 *   post:
 *     summary: Validate promotion code
 *     description: Validate a promotion code against the current cart total.
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - cart_total
 *             properties:
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: SUMMER10
 *               cart_total:
 *                 type: number
 *                 minimum: 0
 *                 example: 250000
 *     responses:
 *       200:
 *         description: Promotion code is valid
 *       400:
 *         description: Invalid request or promotion code
 *       404:
 *         description: Promotion not found
 */
router.post(
  '/promotions/validate',
  optionalAuth,
  validate(validatePromotionSchema),
  PromotionController.validatePromotion
);

/**
 * @swagger
 * /api/promotions/public:
 *   get:
 *     summary: List public promotions
 *     description: Retrieve public promotions with pagination and filters.
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Public promotions retrieved successfully
 *       400:
 *         description: Invalid query
 */
router.get(
  '/promotions/public',
  validateQuery(getPromotionsQuerySchema),
  PromotionController.listPublicPromotions
);


/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: List promotions
 *     description: Retrieve promotions for management with pagination and filters.
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Promotions retrieved successfully
 *       400:
 *         description: Invalid query
 */
router.get(
  '/promotions',
  validateQuery(getPromotionsQuerySchema),
  PromotionController.listPromotions
);

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create promotion
 *     description: Admin creates a new promotion code.
 *     tags: [Promotions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount_type
 *               - discount_value
 *               - start_date
 *               - end_date
 *             properties:
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: SUMMER10
 *               description:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 500
 *               discount_type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT]
 *                 example: PERCENTAGE
 *               discount_value:
 *                 type: number
 *                 example: 10
 *               min_order_value:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               max_discount_amount:
 *                 type: number
 *                 nullable: true
 *                 example: 50000
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               usage_limit:
 *                 type: integer
 *                 nullable: true
 *                 minimum: 1
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.post(
  '/promotions',
  requireRole('admin'),
  validate(createPromotionSchema),
  PromotionController.createPromotion
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     description: Admin retrieves a promotion by ID.
 *     tags: [Promotions]
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
 *         description: Promotion retrieved successfully
 *       400:
 *         description: Invalid promotion ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Promotion not found
 */
router.get(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  PromotionController.getPromotion
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion
 *     description: Admin updates an existing promotion.
 *     tags: [Promotions]
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
 *               description:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 500
 *               discount_type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT]
 *               discount_value:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *                 minimum: 0
 *               max_discount_amount:
 *                 type: number
 *                 nullable: true
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               usage_limit:
 *                 type: integer
 *                 nullable: true
 *                 minimum: 1
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *       400:
 *         description: Invalid payload or promotion ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Promotion not found
 */
router.put(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  validate(updatePromotionSchema),
  PromotionController.updatePromotion
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion
 *     description: Admin deletes a promotion by ID.
 *     tags: [Promotions]
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
 *         description: Promotion deleted successfully
 *       400:
 *         description: Invalid promotion ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Promotion not found
 */
router.delete(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  PromotionController.deletePromotion
);

module.exports = router;
