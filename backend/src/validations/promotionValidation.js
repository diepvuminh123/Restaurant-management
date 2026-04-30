const Joi = require('joi');

const createPromotionSchema = Joi.object({
  code: Joi.string().trim().max(50).uppercase().required().messages({
    'string.empty': 'Mã khuyến mãi là bắt buộc',
    'string.max': 'Mã khuyến mãi tối đa 50 ký tự',
    'any.required': 'Mã khuyến mãi là bắt buộc'
  }),
  description: Joi.string().trim().max(500).allow('', null).optional(),
  discount_type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').required().messages({
    'any.only': 'Loại giảm giá không hợp lệ',
    'any.required': 'Loại giảm giá là bắt buộc'
  }),
  discount_value: Joi.number().positive().required().messages({
    'number.positive': 'Giá trị giảm phải lớn hơn 0',
    'any.required': 'Giá trị giảm là bắt buộc'
  }),
  min_order_value: Joi.number().min(0).default(0),
  max_discount_amount: Joi.number().positive().allow(null).optional(),
  start_date: Joi.date().iso().required().messages({
    'date.format': 'Ngày bắt đầu không hợp lệ',
    'any.required': 'Ngày bắt đầu là bắt buộc'
  }),
  end_date: Joi.date().iso().required().messages({
    'date.format': 'Ngày kết thúc không hợp lệ',
    'any.required': 'Ngày kết thúc là bắt buộc'
  }),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
  is_active: Joi.boolean().default(true)
});

const updatePromotionSchema = Joi.object({
  description: Joi.string().trim().max(500).allow('', null).optional(),
  discount_type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').optional(),
  discount_value: Joi.number().positive().optional(),
  min_order_value: Joi.number().min(0).optional(),
  max_discount_amount: Joi.number().positive().allow(null).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  usage_limit: Joi.number().integer().min(1).allow(null).optional(),
  is_active: Joi.boolean().optional()
});

const validatePromotionSchema = Joi.object({
  code: Joi.string().trim().max(50).uppercase().required().messages({
    'string.empty': 'Vui lòng nhập mã khuyến mãi',
    'any.required': 'Vui lòng nhập mã khuyến mãi'
  }),
  cart_total: Joi.number().min(0).required().messages({
    'number.min': 'Giá trị giỏ hàng không hợp lệ',
    'any.required': 'Giá trị giỏ hàng là bắt buộc'
  })
});

const getPromotionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow('').optional(),
  isActive: Joi.boolean().allow(null).optional()
});

const promotionIdParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

module.exports = {
  createPromotionSchema,
  updatePromotionSchema,
  validatePromotionSchema,
  getPromotionsQuerySchema,
  promotionIdParamSchema
};
