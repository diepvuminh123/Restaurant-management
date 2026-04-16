const Joi = require('joi');

const reviewIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const menuItemIdParamSchema = Joi.object({
  menuItemId: Joi.number().integer().positive().required(),
});

const createReviewSchema = Joi.object({
  menu_item_id: Joi.number().integer().positive().required().messages({
    'number.base': 'menu_item_id phải là số',
    'number.integer': 'menu_item_id phải là số nguyên',
    'number.positive': 'menu_item_id phải là số dương',
    'any.required': 'menu_item_id là bắt buộc',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'rating phải là số',
    'number.integer': 'rating phải là số nguyên',
    'number.min': 'rating tối thiểu là 1',
    'number.max': 'rating tối đa là 5',
    'any.required': 'rating là bắt buộc',
  }),
  comment: Joi.string().allow('', null).max(1000).optional().messages({
    'string.base': 'comment phải là chuỗi',
    'string.max': 'comment không được quá 1000 ký tự',
  }),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'rating phải là số',
    'number.integer': 'rating phải là số nguyên',
    'number.min': 'rating tối thiểu là 1',
    'number.max': 'rating tối đa là 5',
  }),
  comment: Joi.string().allow('', null).max(1000).optional().messages({
    'string.base': 'comment phải là chuỗi',
    'string.max': 'comment không được quá 1000 ký tự',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Phải có ít nhất một trường để cập nhật',
  });

const reportReviewSchema = Joi.object({
  reason: Joi.string().valid('spam', 'offensive', 'harassment', 'fake', 'irrelevant').required().messages({
    'any.only': 'reason không hợp lệ',
    'any.required': 'reason là bắt buộc',
  }),
  note: Joi.string().allow('', null).max(2000).optional().messages({
    'string.base': 'note phải là chuỗi',
    'string.max': 'note không được quá 2000 ký tự',
  }),
});

const getPublicReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('newest', 'highest', 'lowest').default('newest'),
});

const getReportedReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  menu_item_id: Joi.number().integer().positive().optional(),
  reason: Joi.string().valid('spam', 'offensive', 'harassment', 'fake', 'irrelevant').optional(),
  status: Joi.string().valid('all', 'hidden', 'visible').default('all'),
  from_date: Joi.date().iso().optional(),
  to_date: Joi.date().iso().optional(),
});

const getMenuItemReportSummaryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  menu_item_id: Joi.number().integer().positive().optional(),
  reason: Joi.string().valid('spam', 'offensive', 'harassment', 'fake', 'irrelevant').optional(),
});

const updateReviewVisibilitySchema = Joi.object({
  is_hidden: Joi.boolean().required().messages({
    'boolean.base': 'is_hidden phải là boolean',
    'any.required': 'is_hidden là bắt buộc',
  }),
  hidden_reason: Joi.string().allow('', null).max(1000).optional().messages({
    'string.base': 'hidden_reason phải là chuỗi',
    'string.max': 'hidden_reason không được quá 1000 ký tự',
  }),
});

module.exports = {
  reviewIdParamSchema,
  menuItemIdParamSchema,
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  getPublicReviewsQuerySchema,
  getReportedReviewsQuerySchema,
  getMenuItemReportSummaryQuerySchema,
  updateReviewVisibilitySchema,
};
