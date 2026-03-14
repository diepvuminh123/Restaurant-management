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
});

module.exports = {
	getTablesAvailabilityQuerySchema,
	createReservationBodySchema,
};