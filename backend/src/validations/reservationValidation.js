const Joi = require('joi');

const getTablesAvailabilityQuerySchema = Joi.object({
	date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
		'any.required': 'date là bắt buộc',
		'string.pattern.base': 'date phải có dạng YYYY-MM-DD',
	}),
	time: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
		'any.required': 'time là bắt buộc',
		'string.pattern.base': 'time phải có dạng HH:mm',
	}),
	guests: Joi.number().integer().min(1).max(50).required().messages({
		'any.required': 'guests là bắt buộc',
		'number.base': 'guests phải là số',
		'number.integer': 'guests phải là số nguyên',
		'number.min': 'guests phải >= 1',
	}),
	ignoreCapacity: Joi.boolean().truthy('true').falsy('false').optional(),
});

const createReservationBodySchema = Joi.object({
	table_id: Joi.number().integer().min(1).required().messages({
		'any.required': 'table_id là bắt buộc',
		'number.base': 'table_id phải là số',
		'number.integer': 'table_id phải là số nguyên',
		'number.min': 'table_id phải là số dương',
	}),
	reservation_time: Joi.date().iso().required().messages({
		'any.required': 'reservation_time là bắt buộc',
		'date.format': 'reservation_time phải là ISO datetime',
		'date.base': 'reservation_time không hợp lệ',
	}),
	number_of_guests: Joi.number().integer().min(1).max(50).required().messages({
		'any.required': 'number_of_guests là bắt buộc',
		'number.base': 'number_of_guests phải là số',
		'number.integer': 'number_of_guests phải là số nguyên',
		'number.min': 'number_of_guests phải >= 1',
	}),
	note: Joi.string().trim().max(255).allow('', null).optional().messages({
		'string.max': 'note không được quá 255 ký tự',
	}),
	customer_name: Joi.string().trim().max(100).allow('', null).optional(),
	customer_phone: Joi.string().trim().max(20).allow('', null).optional(),
	customer_email: Joi.string().trim().max(100).email().allow('', null).optional(),
});

const getReservationsForStaffQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(200).default(50).messages({
		'number.base': 'limit phải là số',
		'number.integer': 'limit phải là số nguyên',
		'number.min': 'limit phải >= 1',
		'number.max': 'limit phải <= 200',
	}),
	offset: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'offset phải là số',
		'number.integer': 'offset phải là số nguyên',
		'number.min': 'offset phải >= 0',
	}),
	state: Joi.string()
		.valid('CONFIRM', 'CANCELED', 'ON_SERVING', 'COMPLETED')
		.optional(),
	from: Joi.date().iso().optional(),
	to: Joi.date().iso().optional(),
});

const createReservationForStaffSchema = Joi.object({
	customer_name: Joi.string().trim().max(100).required().messages({
		'any.required': 'Phải có tên khách hàng',
		'string.max': 'Tên khách hàng không được quá 100 ký tự',
	}),
	customer_phone: Joi.string().trim().max(20).required().messages({
		'any.required': 'Phải có số điện thoại của khách hàng',
		'string.max': 'Số điện thoại của khách hàng có độ dài không quá 20 ký tự'
	}),
	table_id: Joi.number().integer().min(1).required().messages({
		'any.required': 'Cần có table_id',
		'number.base': 'table_id phải là số'
	}),
	reservation_time: Joi.date().iso().required().messages({
		'any.required': 'Cần có reservation_time',
		'date.format': 'reservation_time phải là ISO datetime',
		'date.base': 'reservation_time không hợp lệ'
	}),
	number_of_guests: Joi.number().integer().min(1).max(50).required().messages({
		'any.required': 'Cần có number_of_guests',
		'number.base': 'number_of_guests phải là số',
		'number.integer': 'number_of_guests phải là số nguyên',
		'number.min': 'number_of_guests phải >= 1',
		'number.max': 'number_of_guests phải <= 50',
	}),
	note: Joi.string().trim().max(255).allow('', null).optional().messages({
		'string.max': 'note không được quá 255 ký tự',
	}),
	restaurant_note: Joi.string().trim().max(255).allow('', null).optional().messages({
		'string.max': 'restaurant_note không được quá 255 ký tự',
	}),
});

const updateReservationStatusForStaffSchema = Joi.object({
	reservation_state: Joi.string()
		.valid('ON_SERVING', 'COMPLETED', 'CANCELED')
		.required()
		.messages({
			'any.required': 'Cần có reservation_state',
			'any.only': 'reservation_state phải là ON_SERVING, COMPLETED hoặc CANCELED',
		}),
});

module.exports = {
	getTablesAvailabilityQuerySchema,
	createReservationBodySchema,
	getReservationsForStaffQuerySchema,
	createReservationForStaffSchema,
	updateReservationStatusForStaffSchema,
};