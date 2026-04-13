const Joi = require("joi");

const baseRestaurantInfoSchema = {
  name: Joi.string().max(150).optional().messages({
    "string.base": "name phai la chuoi",
    "string.max": "name khong duoc vuot qua 150 ky tu",
  }),
  slogan: Joi.string().max(255).allow("", null).optional().messages({
    "string.base": "slogan phai la chuoi",
    "string.max": "slogan khong duoc vuot qua 255 ky tu",
  }),
  logo_url: Joi.string().allow("", null).optional().messages({
    "string.base": "logo_url phai la chuoi",
  }),
  brand_image_url: Joi.string().allow("", null).optional().messages({
    "string.base": "brand_image_url phai la chuoi",
  }),
  address_line: Joi.string().max(255).optional().messages({
    "string.base": "address_line phai la chuoi",
    "string.max": "address_line khong duoc vuot qua 255 ky tu",
  }),
  contact_phone: Joi.string().max(20).allow("", null).optional().messages({
    "string.base": "contact_phone phai la chuoi",
    "string.max": "contact_phone khong duoc vuot qua 20 ky tu",
  }),
  contact_email: Joi.string().email().max(100).allow("", null).optional().messages({
    "string.base": "contact_email phai la chuoi",
    "string.email": "contact_email khong dung dinh dang",
    "string.max": "contact_email khong duoc vuot qua 100 ky tu",
  }),
  opening_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .optional()
    .messages({
      "string.pattern.base": "opening_time phai co dinh dang HH:mm hoac HH:mm:ss",
    }),
  closing_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .optional()
    .messages({
      "string.pattern.base": "closing_time phai co dinh dang HH:mm hoac HH:mm:ss",
    }),
};

const createRestaurantInfo = Joi.object({
  ...baseRestaurantInfoSchema,
  name: Joi.string().max(150).required().messages({
    "string.base": "name phai la chuoi",
    "string.max": "name khong duoc vuot qua 150 ky tu",
    "any.required": "name la bat buoc",
  }),
  address_line: Joi.string().max(255).required().messages({
    "string.base": "address_line phai la chuoi",
    "string.max": "address_line khong duoc vuot qua 255 ky tu",
    "any.required": "address_line la bat buoc",
  }),
  opening_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .required()
    .messages({
      "string.pattern.base": "opening_time phai co dinh dang HH:mm hoac HH:mm:ss",
      "any.required": "opening_time la bat buoc",
    }),
  closing_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .required()
    .messages({
      "string.pattern.base": "closing_time phai co dinh dang HH:mm hoac HH:mm:ss",
      "any.required": "closing_time la bat buoc",
    }),
});

const updateRestaurantInfo = Joi.object(baseRestaurantInfoSchema)
  .min(1)
  .messages({
    "object.min": "Phai co it nhat mot truong de cap nhat"
  });

const restaurantInfoIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id phai la so",
    "number.integer": "id phai la so nguyen",
    "number.positive": "id phai la so duong",
    "any.required": "id la bat buoc",
  }),
});

module.exports = {
  createRestaurantInfo,
  updateRestaurantInfo,
  restaurantInfoIdParamSchema,
};
