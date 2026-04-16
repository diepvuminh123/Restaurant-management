const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const validateParams = require('../middlewares/validateParams');
const validateQuery = require('../middlewares/validateQuery');
const {
  reviewIdParamSchema,
  menuItemIdParamSchema,
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  getPublicReviewsQuerySchema,
  getReportedReviewsQuerySchema,
  getMenuItemReportSummaryQuerySchema,
  updateReviewVisibilitySchema,
} = require('../validations/reviewValidation');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create review
 *     description: Logged-in user creates one review for a menu item.
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               menu_item_id:
 *                 type: integer
 *                 example: 12
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Mon an rat ngon
 *     responses:
 *       201:
 *         description: Review created
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Menu item not found
 *       409:
 *         description: Already reviewed this item
 */
router.post('/reviews', requireAuth, validate(createReviewSchema), ReviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update own review
 *     description: Logged-in user updates their own review.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Review not found
 */
router.patch(
  '/reviews/:id',
  requireAuth,
  validateParams(reviewIdParamSchema),
  validate(updateReviewSchema),
  ReviewController.updateOwnReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete own review
 *     description: Logged-in user deletes their own review.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Review not found
 */
router.delete('/reviews/:id', requireAuth, validateParams(reviewIdParamSchema), ReviewController.deleteOwnReview);

/**
 * @swagger
 * /api/menus/{menuItemId}/reviews:
 *   get:
 *     summary: Get public reviews for menu item
 *     description: Public endpoint that returns only visible reviews.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: integer
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
 *           maximum: 50
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, highest, lowest]
 *     responses:
 *       200:
 *         description: List reviews success
 *       404:
 *         description: Menu item not found
 */
router.get(
  '/menus/:menuItemId/reviews',
  validateParams(menuItemIdParamSchema),
  validateQuery(getPublicReviewsQuerySchema),
  ReviewController.getPublicReviewsByMenuItem
);

/**
 * @swagger
 * /api/reviews/{id}/reports:
 *   post:
 *     summary: Report a review
 *     description: Logged-in user reports another user's review.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [spam, offensive, harassment, fake, irrelevant]
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Review not found
 *       409:
 *         description: Duplicate report or self-report
 */
router.post(
  '/reviews/:id/reports',
  requireAuth,
  validateParams(reviewIdParamSchema),
  validate(reportReviewSchema),
  ReviewController.reportReview
);

/**
 * @swagger
 * /api/admin/reviews/reported:
 *   get:
 *     summary: Get reported reviews
 *     description: Admin gets reviews that have at least one report.
 *     tags: [Admin Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: menu_item_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *           enum: [spam, offensive, harassment, fake, irrelevant]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, hidden, visible]
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Query success
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.get(
  '/admin/reviews/reported',
  requireRole('admin'),
  validateQuery(getReportedReviewsQuerySchema),
  ReviewController.getReportedReviewsForAdmin
);

/**
 * @swagger
 * /api/admin/reports/menu-items:
 *   get:
 *     summary: Get report summary by menu item
 *     description: Admin sees aggregated report metrics per menu item.
 *     tags: [Admin Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: menu_item_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *           enum: [spam, offensive, harassment, fake, irrelevant]
 *     responses:
 *       200:
 *         description: Query success
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.get(
  '/admin/reports/menu-items',
  requireRole('admin'),
  validateQuery(getMenuItemReportSummaryQuerySchema),
  ReviewController.getMenuItemReportSummary
);

/**
 * @swagger
 * /api/admin/reviews/{id}/visibility:
 *   patch:
 *     summary: Hide or unhide review
 *     description: Admin updates visibility status of a review.
 *     tags: [Admin Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_hidden
 *             properties:
 *               is_hidden:
 *                 type: boolean
 *                 example: true
 *               hidden_reason:
 *                 type: string
 *                 example: Contains harassment content
 *     responses:
 *       200:
 *         description: Visibility updated
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Review not found
 */
router.patch(
  '/admin/reviews/:id/visibility',
  requireRole('admin'),
  validateParams(reviewIdParamSchema),
  validate(updateReviewVisibilitySchema),
  ReviewController.updateReviewVisibilityForAdmin
);

module.exports = router;
