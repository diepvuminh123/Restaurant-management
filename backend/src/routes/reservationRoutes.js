const express = require('express');
const router = express.Router();

const ReservationController = require('../controllers/reservationController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/auth');
const validateBody = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');

const {
	getTablesAvailabilityQuerySchema,
	createReservationBodySchema,
	getReservationsForStaffQuerySchema,
	createReservationForStaffSchema,
} = require('../validations/reservationValidation');

// Phần booking 

// GET /api/tables/availability?date=YYYY-MM-DD&time=HH:mm&guests=numOfGuests
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

// GET /api/reservations/history
router.get('/reservations/history', requireAuth, ReservationController.getReservationHistory);


// DELETE /api/reservations/history/:id/cancel: Hủy đặt bàn (Khi thời gian đặt bàn > thời điểm hiện tại)
router.delete('/reservations/history/:id/cancel', requireAuth, ReservationController.cancelReservation);

// ----------FOR ADMIN----------
// Xem danh sách đặt bàn (employee/admin)
router.get(
	'/reservations/staff',
	requireRole('admin', 'employee'),
	validateQuery(getReservationsForStaffQuerySchema),
	ReservationController.viewReservationForStaff
);

// Tính năng đặt bàn cho admin
router.post(
	'/reservations/staff/createReservation',
	requireRole('admin', 'employee'),
	validateBody(createReservationForStaffSchema),
	ReservationController.createReservationForStaff
)

//Tính năng xem đơn đặt bàn chi tiết cho admin/employee
router.get(
	'/reservations/staff/viewReservationDetail/:id',
	requireRole('admin', 'employee'),
	ReservationController.viewReservationDetailForStaff
)
module.exports = router;