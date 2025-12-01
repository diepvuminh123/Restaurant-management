const Joi = require("joi");

// TẠO MÓN ĂN MỚI
const createMenuItem = Joi.object({
  name: Joi.string().required().min(1).max(200).messages({
    "string.empty": "Tên món ăn là bắt buộc",
    "string.min": "Tên món ăn phải có ít nhất 1 ký tự",
    "string.max": "Tên món ăn không được quá 200 ký tự",
    "any.required": "Tên món ăn là bắt buộc",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Giá phải là số",
    "number.positive": "Giá phải lớn hơn 0",
    "any.required": "Giá là bắt buộc",
  }),
  sale_price: Joi.number().positive().allow(null).optional().messages({
    "number.base": "Giá khuyến mãi phải là số",
    "number.positive": "Giá khuyến mãi phải lớn hơn 0",
  }),
  description: Joi.string().allow("").optional().messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  description_short: Joi.string().allow("").optional().messages({
    "string.base": "Mô tả ngắn phải là chuỗi",
  }),
  category_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    "array.base": "Danh sách danh mục phải là mảng",
    "number.base": "ID danh mục phải là số",
    "number.integer": "ID danh mục phải là số nguyên",
    "number.positive": "ID danh mục phải là số dương",
  }),
  image: Joi.string().allow("").optional().messages({
    "string.base": "Hình ảnh phải là chuỗi",
  }),
  images: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Danh sách ảnh phải là mảng",
    "string.base": "Đường dẫn ảnh phải là chuỗi",
  }),
  section_id: Joi.number().integer().positive().optional().messages({
    "number.base": "ID phần menu phải là số",
    "number.integer": "ID phần menu phải là số nguyên",
    "number.positive": "ID phần menu phải là số dương",
  }),
  available: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái có sẵn phải là boolean",
  }),
  is_popular: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái phổ biến phải là boolean",
  }),
  is_new: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái món mới phải là boolean",
  }),
  is_soldout: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái hết món phải là boolean",
  }),
  prep_time: Joi.number().integer().positive().optional().messages({
    "number.base": "Thời gian chuẩn bị phải là số",
    "number.integer": "Thời gian chuẩn bị phải là số nguyên",
    "number.positive": "Thời gian chuẩn bị phải là số dương",
  }),
  notes: Joi.string().allow("", null).optional().messages({
    "string.base": "Ghi chú phải là chuỗi",
  }),
});

// CẬP NHẬT MÓN ĂN
const updateMenuItem = Joi.object({
  name: Joi.string().min(1).max(200).optional().messages({
    "string.min": "Tên món ăn phải có ít nhất 1 ký tự",
    "string.max": "Tên món ăn không được quá 200 ký tự",
  }),
  price: Joi.number().positive().optional().messages({
    "number.base": "Giá phải là số",
    "number.positive": "Giá phải lớn hơn 0",
  }),
  sale_price: Joi.number().positive().allow(null).optional().messages({
    "number.base": "Giá khuyến mãi phải là số",
    "number.positive": "Giá khuyến mãi phải lớn hơn 0",
  }),
  description: Joi.string().allow("").optional().messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  description_short: Joi.string().allow("").optional().messages({
    "string.base": "Mô tả ngắn phải là chuỗi",
  }),
  category_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    "array.base": "Danh sách danh mục phải là mảng",
    "number.base": "ID danh mục phải là số",
    "number.integer": "ID danh mục phải là số nguyên",
    "number.positive": "ID danh mục phải là số dương",
  }),
  image: Joi.string().allow("").optional().messages({
    "string.base": "Hình ảnh phải là chuỗi",
  }),
  images: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Danh sách ảnh phải là mảng",
    "string.base": "Đường dẫn ảnh phải là chuỗi",
  }),
  section_id: Joi.number().integer().positive().optional().messages({
    "number.base": "ID phần menu phải là số",
    "number.integer": "ID phần menu phải là số nguyên",
    "number.positive": "ID phần menu phải là số dương",
  }),
  available: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái có sẵn phải là boolean",
  }),
  is_popular: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái phổ biến phải là boolean",
  }),
  is_new: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái món mới phải là boolean",
  }),
  is_soldout: Joi.boolean().optional().messages({
    "boolean.base": "Trạng thái hết món phải là boolean",
  }),
  prep_time: Joi.number().integer().positive().optional().messages({
    "number.base": "Thời gian chuẩn bị phải là số",
    "number.integer": "Thời gian chuẩn bị phải là số nguyên",
    "number.positive": "Thời gian chuẩn bị phải là số dương",
  }),
  notes: Joi.string().allow("", null).optional().messages({
    "string.base": "Ghi chú phải là chuỗi",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

// CẬP NHẬT TRẠNG THÁI CÒN HÀNG
const updateAvailability = Joi.object({
  available: Joi.boolean().required().messages({
    "boolean.base": "Trạng thái còn hàng phải là boolean",
    "any.required": "Trạng thái còn hàng là bắt buộc",
  }),
});

// CẬP NHẬT SECTION
const updateSection = Joi.object({
  section_name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Tên phần menu phải có ít nhất 1 ký tự",
    "string.max": "Tên phần menu không được quá 100 ký tự",
  }),
  description: Joi.string().allow("", null).optional().messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  display_order: Joi.number().integer().optional().messages({
    "number.base": "Thứ tự hiển thị phải là số",
    "number.integer": "Thứ tự hiển thị phải là số nguyên",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

// CẬP NHẬT CATEGORY
const updateCategory = Joi.object({
  category_name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Tên danh mục phải có ít nhất 1 ký tự",
    "string.max": "Tên danh mục không được quá 100 ký tự",
  }),
  description: Joi.string().allow("", null).optional().messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  section_id: Joi.number().integer().positive().optional().messages({
    "number.base": "ID phần menu phải là số",
    "number.integer": "ID phần menu phải là số nguyên",
    "number.positive": "ID phần menu phải là số dương",
  }),
  display_order: Joi.number().integer().optional().messages({
    "number.base": "Thứ tự hiển thị phải là số",
    "number.integer": "Thứ tự hiển thị phải là số nguyên",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải có ít nhất một trường để cập nhật",
  });

module.exports = {
  createMenuItem,
  updateMenuItem,
  updateAvailability,
  updateSection,
  updateCategory,
};
