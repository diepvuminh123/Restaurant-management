const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  addItemSchema,
  updateItemSchema,
  migrateCartSchema
} = require('../validations/cartValidation');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current cart
 *     description: Retrieve the active cart for the current user or guest session
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cart', optionalAuth, CartController.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     description: Add a menu item to the cart or update quantity if already exists
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menu_item_id
 *             properties:
 *               menu_item_id:
 *                 type: integer
 *                 example: 10
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 default: 1
 *                 example: 2
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Không hành"
 *     responses:
 *       200:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã thêm món vào giỏ hàng"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
router.post('/cart/items', optionalAuth, validate(addItemSchema), CartController.addItem);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   put:
 *     summary: Update cart item
 *     description: Update quantity or note of a cart item
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 3
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Ít đá"
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put('/cart/items/:id', optionalAuth, validate(updateItemSchema), CartController.updateItem);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Delete a specific item from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete('/cart/items/:id', optionalAuth, CartController.removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
router.delete('/cart', optionalAuth, CartController.clearCart);

/**
 * @swagger
 * /api/cart/migrate:
 *   post:
 *     summary: Migrate guest cart to user
 *     description: Transfer guest cart to logged-in user account
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guest_session_id
 *             properties:
 *               guest_session_id:
 *                 type: string
 *                 example: "sess_abc123"
 *     responses:
 *       200:
 *         description: Cart migrated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/cart/migrate', validate(migrateCartSchema), CartController.migrateCart);

/**
 * @swagger
 * /api/cart/validate:
 *   get:
 *     summary: Validate cart
 *     description: Check if cart items are still available and prices haven't changed
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: object
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       500:
 *         description: Server error
 */
router.get('/cart/validate', optionalAuth, CartController.validateCart);

module.exports = router;
