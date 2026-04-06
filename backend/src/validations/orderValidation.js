const Joi = require('joi');

const createOrderSchema = Joi.object({
  customer_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Tên khách hàng là bắt buộc',
    'string.min': 'Tên khách hàng phải có ít nhất 2 ký tự',
    'string.max': 'Tên khách hàng không được quá 100 ký tự',
    'any.required': 'Tên khách hàng là bắt buộc'
  }),

  customer_phone: Joi.string().trim().max(20).required().messages({
    'string.empty': 'Số điện thoại là bắt buộc',
    'string.max': 'Số điện thoại không được quá 20 ký tự',
    'any.required': 'Số điện thoại là bắt buộc'
  }),

  customer_email: Joi.string().trim().email().max(100).required().messages({
    'string.email': 'Email không hợp lệ',
    'string.max': 'Email không được quá 100 ký tự',
    'any.required': 'Email là bắt buộc'
  }),

  pickup_time: Joi.date().iso().required().messages({
    'date.base': 'pickup_time phải là ngày hợp lệ',
    'date.format': 'pickup_time phải theo định dạng ISO',
    'any.required': 'pickup_time là bắt buộc'
  }),

  note: Joi.string().trim().max(1000).allow('', null).optional().messages({
    'string.max': 'Ghi chú không được quá 1000 ký tự'
  }),

  payment_method: Joi.string()
    .valid('zalopay', 'acb', 'vietcombank')
    .required()
    .messages({
      'any.only': 'Phương thức thanh toán không hợp lệ',
      'any.required': 'payment_method là bắt buộc'
    })
});

const orderIdParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID đơn hàng phải là số',
    'number.integer': 'ID đơn hàng phải là số nguyên',
    'number.min': 'ID đơn hàng không hợp lệ',
    'any.required': 'ID đơn hàng là bắt buộc'
  })
});

const getOrdersForStaffQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'date phải có định dạng YYYY-MM-DD'
  }),
  status: Joi.string()
    .valid('ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED')
    .default('ALL')
    .messages({
      'any.only': 'status không hợp lệ'
    }),
  search: Joi.string().trim().max(100).allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const guestOrderLookupQuerySchema = Joi.object({
  order_code: Joi.string().trim().max(50).optional().messages({
    'string.max': 'Mã đơn hàng không được quá 50 ký tự'
  }),
  customer_phone: Joi.string().trim().max(20).optional().messages({
    'string.max': 'Số điện thoại không được quá 20 ký tự'
  }),
  customer_email: Joi.string().trim().email().max(100).optional().messages({
    'string.email': 'Email không hợp lệ',
    'string.max': 'Email không được quá 100 ký tự'
  }),
  limit: Joi.number().integer().min(1).max(20).default(10),
  offset: Joi.number().integer().min(0).default(0)
})
  // Khách chỉ cần nhập một trong 3 trường để tra cứu đơn mang về
  .or('order_code', 'customer_phone', 'customer_email')
  .messages({
    'object.missing': 'Cần cung cấp ít nhất một trong các trường: order_code, customer_phone hoặc customer_email'
  });

const myOrderHistoryQuerySchema = Joi.object({
  status: Joi.string()
    .valid('ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED')
    .default('ALL')
    .messages({
      'any.only': 'status không hợp lệ'
    }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(30).default(20)
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED')
    .required()
    .messages({
      'any.only': 'status không hợp lệ',
      'any.required': 'status là bắt buộc'
    })
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null).optional().messages({
    'string.max': 'Lý do hủy không được quá 500 ký tự'
  })
});

const updateOrderNoteSchema = Joi.object({
  note: Joi.string().trim().max(1000).allow('', null).required().messages({
    'any.required': 'note là bắt buộc',
    'string.max': 'Ghi chú không được quá 1000 ký tự'
  })
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema,
  getOrdersForStaffQuerySchema,
  guestOrderLookupQuerySchema,
  myOrderHistoryQuerySchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  updateOrderNoteSchema
};
