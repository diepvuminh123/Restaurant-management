const Joi = require('joi');

/**
 * Validation cho thêm món vào giỏ hàng
 * POST /api/cart/items
 * Body: { menu_item_id, quantity, note }
 */
const addItemSchema = Joi.object({
  menu_item_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'menu_item_id phải là số',
    'number.integer': 'menu_item_id phải là số nguyên',
    'number.min': 'menu_item_id phải là số dương',
    'any.required': 'menu_item_id là bắt buộc'
  }),
  
  quantity: Joi.number().integer().min(1).max(99).default(1).messages({
    'number.base': 'Số lượng phải là số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải từ 1 đến 99',
    'number.max': 'Số lượng phải từ 1 đến 99'
  }),
  
  note: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Ghi chú không được quá 500 ký tự'
  })
});

/**
 * Validation cho cập nhật món trong giỏ hàng
 * PUT /api/cart/items/:id
 * Body: { quantity, note }
 */
const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).optional().messages({
    'number.base': 'Số lượng phải là số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải từ 1 đến 99',
    'number.max': 'Số lượng phải từ 1 đến 99'
  }),
  
  note: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Ghi chú không được quá 500 ký tự'
  })
});

/**
 * Validation cho migrate cart
 * POST /api/cart/migrate
 * Body: { guest_session_id }
 */
const migrateCartSchema = Joi.object({
  guest_session_id: Joi.string().required().messages({
    'string.base': 'guest_session_id phải là chuỗi',
    'any.required': 'guest_session_id là bắt buộc'
  })
});

module.exports = {
  addItemSchema,
  updateItemSchema,
  migrateCartSchema
};
