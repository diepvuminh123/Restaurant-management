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

router.get(
  '/users',
  requireRole('admin'),
  validateQuery(getUsersQuerySchema),
  UserAdminController.getUsers
);

router.patch(
  '/users/:id/role',
  requireRole('admin'),
  validateParams(userIdParamSchema),
  validate(updateRoleSchema),
  UserAdminController.updateRole
);

router.patch(
  '/users/:id/lock',
  requireRole('admin'),
  validateParams(userIdParamSchema),
  validate(updateLockStateSchema),
  UserAdminController.updateLockState
);

module.exports = router;