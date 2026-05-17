const express = require('express');

const TableController = require('../controllers/tableController');
const { requireRole } = require('../middlewares/auth');
const validateBody = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');
const {
  getTableMapForAdminQuerySchema,
  tableMapBodySchema,
} = require('../validations/reservationValidation');

const router = express.Router();

/**
 * @swagger
 * /api/admin/tables:
 *   get:
 *     summary: Get admin table map
 *     description: Admin or system admin retrieves the restaurant table map with optional status filtering.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, RESERVED, OCCUPIED]
 *         example: AVAILABLE
 *     responses:
 *       200:
 *         description: Table map returned successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.get(
  '/admin/tables',
  requireRole('admin', 'system_admin'),
  validateQuery(getTableMapForAdminQuerySchema),
  TableController.getTableMapForAdmin
);

/**
 * @swagger
 * /api/admin/tables:
 *   post:
 *     summary: Create a restaurant table
 *     description: Admin or system admin creates a new table for the restaurant map.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capacity
 *               - table_status
 *               - position_x
 *               - position_y
 *             properties:
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 4
 *               table_status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, OCCUPIED]
 *                 example: AVAILABLE
 *               position_x:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               position_y:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               restaurant_note:
 *                 type: string
 *                 nullable: true
 *                 example: Gan cua so
 *     responses:
 *       201:
 *         description: Table created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       409:
 *         description: Another table is already using the requested position
 */
router.post(
  '/admin/tables',
  requireRole('admin', 'system_admin'),
  validateBody(tableMapBodySchema),
  TableController.createTableForAdmin
);

/**
 * @swagger
 * /api/admin/tables/{id}:
 *   put:
 *     summary: Update a restaurant table
 *     description: Admin or system admin updates capacity, status, position, or internal note for a table.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capacity
 *               - table_status
 *               - position_x
 *               - position_y
 *             properties:
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 6
 *               table_status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, OCCUPIED]
 *                 example: RESERVED
 *               position_x:
 *                 type: integer
 *                 minimum: 0
 *                 example: 3
 *               position_y:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               restaurant_note:
 *                 type: string
 *                 nullable: true
 *                 example: Ban danh cho nhom dong nguoi
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       400:
 *         description: Invalid request body or table ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Table not found
 *       409:
 *         description: Another table is already using the requested position
 */
router.put(
  '/admin/tables/:id',
  requireRole('admin', 'system_admin'),
  validateBody(tableMapBodySchema),
  TableController.updateTableForAdmin
);

/**
 * @swagger
 * /api/admin/tables/{id}:
 *   delete:
 *     summary: Delete a restaurant table
 *     description: Admin or system admin deletes a table when it has no active reservations.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       400:
 *         description: Invalid table ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Table not found
 *       409:
 *         description: Table cannot be deleted because it still has active reservations
 */
router.delete(
  '/admin/tables/:id',
  requireRole('admin', 'system_admin'),
  TableController.deleteTableForAdmin
);

module.exports = router;