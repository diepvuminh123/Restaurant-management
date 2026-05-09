const express = require('express');
const router = express.Router();
const UserAdminController = require('../controllers/userAdminController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');
const validateParams = require('../middlewares/validateParams');
const {
  userIdParamSchema,
  getUsersQuerySchema,
  updateRoleSchema,
  updateLockStateSchema,
} = require('../validations/userAdminValidation');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users
 *     description: Admin/System admin retrieves users with filters and pagination.
 *     tags: [User Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, customer, employee, admin, system_admin]
 *           default: all
 *       - in: query
 *         name: locked
 *         schema:
 *           type: string
 *           enum: [all, "true", "false"]
 *           default: all
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
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid query
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.get(
  '/users',
  requireRole('admin', 'system_admin'),
  validateQuery(getUsersQuerySchema),
  UserAdminController.getUsers
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Admin/System admin updates a user's role.
 *     tags: [User Admin]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, employee, admin]
 *                 example: employee
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid payload or user ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/role',
  requireRole('admin', 'system_admin'),
  validateParams(userIdParamSchema),
  validate(updateRoleSchema),
  UserAdminController.updateRole
);

/**
 * @swagger
 * /api/users/{id}/lock:
 *   patch:
 *     summary: Lock or unlock user
 *     description: Admin/System admin updates a user's lock state.
 *     tags: [User Admin]
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
 *             required:
 *               - locked
 *             properties:
 *               locked:
 *                 type: boolean
 *                 example: true
 *               lockHours:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 720
 *                 description: Required when locked is true.
 *                 example: 24
 *     responses:
 *       200:
 *         description: User lock state updated successfully
 *       400:
 *         description: Invalid payload or user ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/lock',
  requireRole('admin', 'system_admin'),
  validateParams(userIdParamSchema),
  validate(updateLockStateSchema),
  UserAdminController.updateLockState
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Admin/System admin deletes a user account.
 *     tags: [User Admin]
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
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: User not found
 */
router.delete(
  '/users/:id',
  requireRole('admin', 'system_admin'),
  validateParams(userIdParamSchema),
  UserAdminController.deleteUser
);

module.exports = router;
