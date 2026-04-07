const Joi = require('joi');

const userIdParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID người dùng phải là số',
    'number.integer': 'ID người dùng phải là số nguyên',
    'number.min': 'ID người dùng không hợp lệ',
    'any.required': 'ID người dùng là bắt buộc',
  }),
});

const getUsersQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').max(100).optional(),
  role: Joi.string().valid('all', 'customer', 'employee', 'admin').default('all'),
  locked: Joi.string().valid('all', 'true', 'false').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('customer', 'employee', 'admin').required().messages({
    'any.only': 'Role phải là customer, employee hoặc admin',
    'any.required': 'Role là bắt buộc',
  }),
});

const updateLockStateSchema = Joi.object({
  locked: Joi.boolean().required().messages({
    'boolean.base': 'locked phải là true hoặc false',
    'any.required': 'locked là bắt buộc',
  }),
  lockHours: Joi.number().integer().min(1).max(720).when('locked', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'number.base': 'lockHours phải là số',
    'number.integer': 'lockHours phải là số nguyên',
    'number.min': 'lockHours tối thiểu là 1',
    'number.max': 'lockHours tối đa là 720',
    'any.required': 'lockHours là bắt buộc khi khóa tài khoản',
  }),
});

module.exports = {
  userIdParamSchema,
  getUsersQuerySchema,
  updateRoleSchema,
  updateLockStateSchema,
};