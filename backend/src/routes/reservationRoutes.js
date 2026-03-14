const express = require('express');
const router = express.Router();

const ReservationController = require('../controllers/reservationController');
const { optionalAuth } = require('../middlewares/auth');
const validateBody = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');

const {
	getTablesAvailabilityQuerySchema,
	createReservationBodySchema,
} = require('../validations/reservationValidation');

// Phần booking 

// GET /api/tables/availability?date=YYYY-MM-DD&time=HH:mm&guests=
router.get(
	'/tables/availability',
	optionalAuth,
	validateQuery(getTablesAvailabilityQuerySchema),
	ReservationController.getTablesAvailability
);

// POST /api/reservations
router.post(
	'/reservations',
	optionalAuth,
	validateBody(createReservationBodySchema),
	ReservationController.createReservation
);

module.exports = router;