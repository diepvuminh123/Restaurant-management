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
	updateReservationStatusForStaffSchema,
} = require('../validations/reservationValidation');

// Phần booking 

// GET /api/tables/availability?date=YYYY-MM-DD&time=HH:mm&guests=numOfGuests
/**
 * @swagger
 * /api/tables/availability:
 *   get:
 *     summary: Get available tables for a reservation slot
 *     description: Returns available tables for a selected date, time, and guest count. Authentication is optional.
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-30
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *         example: 18:30
 *       - in: query
 *         name: guests
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         example: 4
 *       - in: query
 *         name: ignoreCapacity
 *         required: false
 *         schema:
 *           type: boolean
 *         example: false
 *     responses:
 *       200:
 *         description: Available tables returned successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get(
	'/tables/availability',
	optionalAuth,
	validateQuery(getTablesAvailabilityQuerySchema),
	ReservationController.getTablesAvailability
);

// POST /api/reservations
/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a reservation
 *     description: Create a reservation for a guest or logged-in user.
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table_id
 *               - reservation_time
 *               - number_of_guests
 *             properties:
 *               table_id:
 *                 type: integer
 *                 example: 5
 *               reservation_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-30T18:30:00.000Z
 *               number_of_guests:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 example: 4
 *               note:
 *                 type: string
 *                 example: Ban gan cua so
 *               customer_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               customer_phone:
 *                 type: string
 *                 example: 0901234567
 *               customer_email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid request body or selected table unavailable
 */
router.post(
	'/reservations',
	optionalAuth,
	validateBody(createReservationBodySchema),
	ReservationController.createReservation
);

// GET /api/reservations/history
/**
 * @swagger
 * /api/reservations/history:
 *   get:
 *     summary: Get reservation history for current user
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Reservation history returned successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/reservations/history', requireAuth, ReservationController.getReservationHistory);


// DELETE /api/reservations/history/:id/cancel: Hủy đặt bàn (Khi thời gian đặt bàn > thời điểm hiện tại)
/**
 * @swagger
 * /api/reservations/history/{id}/cancel:
 *   delete:
 *     summary: Cancel own reservation
 *     description: Logged-in user cancels a reservation if it is still eligible for cancellation.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation canceled successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Reservation cannot be canceled
 */
router.delete('/reservations/history/:id/cancel', requireAuth, ReservationController.cancelReservation);

// ----------FOR ADMIN----------
// Xem danh sách đặt bàn (employee/admin)
/**
 * @swagger
 * /api/reservations/staff:
 *   get:
 *     summary: Get reservations for staff operations
 *     description: Employee/Admin views reservation list with optional filters.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [CONFIRM, CANCELED, ON_SERVING, COMPLETED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Reservation list returned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.get(
	'/reservations/staff',
	requireRole('admin', 'employee'),
	validateQuery(getReservationsForStaffQuerySchema),
	ReservationController.viewReservationForStaff
);

// Tính năng đặt bàn cho admin
/**
 * @swagger
 * /api/reservations/staff/createReservation:
 *   post:
 *     summary: Staff creates reservation for customer
 *     description: Employee creates a reservation directly for a customer at the counter.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - customer_phone
 *               - table_id
 *               - reservation_time
 *               - number_of_guests
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: Tran Thi B
 *               customer_phone:
 *                 type: string
 *                 example: 0912345678
 *               table_id:
 *                 type: integer
 *                 example: 3
 *               reservation_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-30T18:30:00.000Z
 *               number_of_guests:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 example: 6
 *               note:
 *                 type: string
 *                 example: Khach co tre em
 *               restaurant_note:
 *                 type: string
 *                 example: Giu ban 10 phut neu khach tre
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 */
router.post(
	'/reservations/staff/createReservation',
	requireRole('employee'),
	validateBody(createReservationForStaffSchema),
	ReservationController.createReservationForStaff
)

//Tính năng xem đơn đặt bàn chi tiết cho admin/employee
/**
 * @swagger
 * /api/reservations/staff/viewReservationDetail/{id}:
 *   get:
 *     summary: Get reservation detail for staff
 *     description: Employee gets detailed reservation information for operational handling.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation detail returned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Reservation not found
 */
router.get(
	'/reservations/staff/viewReservationDetail/:id',
	requireRole('employee'),
	ReservationController.viewReservationDetailForStaff
)

//Set trạng thái cho reservation của khách hàng
/**
 * @swagger
 * /api/reservations/staff/updateReservationStatus/{id}:
 *   put:
 *     summary: Update reservation status for staff
 *     description: Employee updates reservation processing state for a customer.
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservation_state
 *             properties:
 *               reservation_state:
 *                 type: string
 *                 enum: [ON_SERVING, COMPLETED, CANCELED]
 *                 example: ON_SERVING
 *     responses:
 *       200:
 *         description: Reservation status updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not enough permission
 *       404:
 *         description: Reservation not found
 */
router.put(
	'/reservations/staff/updateReservationStatus/:id',
	requireRole('employee'),
	validateBody(updateReservationStatusForStaffSchema),
	ReservationController.updateReservationStatusForStaff
)
module.exports = router;