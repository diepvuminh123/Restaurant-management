const Joi = require("joi");
// ĐĂNG KÝ
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username chỉ được chứa chữ và số",
    "string.min": "Username phải có ít nhất 3 ký tự",
    "string.max": "Username không được quá 30 ký tự",
    "any.required": "Username là bắt buộc",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),

  // fullName: Joi.string()
  //   .min(2)
  //   .max(100)
  //   .required()
  //   .messages({
  //     'string.min': 'Họ tên phải có ít nhất 2 ký tự',
  //     'string.max': 'Họ tên không được quá 100 ký tự',
  //     'any.required': 'Họ tên là bắt buộc'
  //   }),

  // phone: Joi.string()
  //   .pattern(/^[0-9]{10,11}$/)
  //   .allow('')
  //   .messages({
  //     'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
  //   }),

  role: Joi.string()
    .valid("customer", "employee", "admin")
    .default("customer")
    .messages({
      "any.only": "Role phải là customer, employee hoặc admin",
    }),
});
// ĐĂNG NHẬP
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email là bắt buộc",
  }),

  password: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
  }),
});
// Đầu vào yêu cầu gửi OTP
const sendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  OTPType: Joi.string().valid("signup", "reset").required().messages({
    "any.only": "OTPType phải là signup hoặc reset",
    "any.required": "OTPType là bắt buộc",
  }),
});

// Xác thực OTP
const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Mã OTP phải có 6 chữ số",
      "string.pattern.base": "Mã OTP chỉ chứa số",
      "any.required": "Mã OTP là bắt buộc",
    }),
});
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};
