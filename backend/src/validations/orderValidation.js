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

module.exports = {
  createOrderSchema
};
