const ReservationService = require('../services/reservationService');
const reservationMailer = require('../reservationMailer');
const User = require('../models/User');

class ReservationController {
	static getReservationOwner(req) {
		const userId = req.session?.userId || null;
		const sessionId = userId ? null : req.sessionID;
		return { userId, sessionId };
	}

	static async getTablesAvailability(req, res) {
		try {
			const { date, time, guests } = req.query;
			const reservationTime = new Date(`${date}T${time}:00`);
			if (Number.isNaN(reservationTime.getTime())) {
				return res.status(400).json({
					success: false,
					message: 'Thời gian không hợp lệ',
				});
			}

			const tables = await ReservationService.getTablesForSelection(
				reservationTime,
				Number(guests)
			);

			res.json({
				success: true,
				data: {
					reservation_time: reservationTime.toISOString(),
					guests: Number(guests),
					tables,
				},
			});
		} catch (error) {
			console.error('Get tables availability error:', error);
			res.status(500).json({
				success: false,
				message: error.message || 'Lỗi khi lấy danh sách bàn',
				error: error.message,
			});
		}
	}

	static async createReservation(req, res) {
		try {
			const { userId, sessionId } = ReservationController.getReservationOwner(req);
			const reservation = await ReservationService.createReservation(userId, sessionId, req.body);

			// Send confirmation email for logged-in users (guest flow has no email in payload)
			if (userId) {
				try {
					const userEmailRow = await User.getEmailById(userId);
					const to = userEmailRow?.email;
					if (to) {
						await reservationMailer({
							to,
							reservation_id: reservation.reservation_id,
							reservation_time: reservation.reservation_time,
							table_id: reservation.table_id,
							number_of_guests: reservation.number_of_guests,
							note: reservation.note,
						});
					}
				} catch (mailError) {
					console.error('Reservation email error:', mailError);
				}
			}

			res.status(201).json({
				success: true,
				message: 'Đặt bàn thành công',
				data: reservation,
			});
		} catch (error) {
			console.error('Create reservation error:', error);
			res.status(400).json({
				success: false,
				message: error.message || 'Lỗi khi đặt bàn',
				error: error.message,
			});
		}
	}

	static async getReservationHistory(req, res) {
		try {
			const userId = req.session?.userId;
			const reservations = await ReservationService.getReservationHistory(userId);

			res.json({
				success: true,
				data: reservations,
			});
		} catch (error) {
			console.error('Get reservation history error:', error);
			res.status(400).json({
				success: false,
				message: error.message || 'Lỗi khi lấy lịch sử đặt bàn',
				error: error.message,
			});
		}
	}

	static async cancelReservation(req, res) {
		try {
			const userId = req.session?.userId;
			const reservationIdRaw = req.params?.id;
			const reservationId = Number(reservationIdRaw);

			if (!Number.isFinite(reservationId)) {
				return res.status(400).json({
					success: false,
					message: 'reservation_id không hợp lệ',
				});
			}

			await ReservationService.cancelReservation(userId, reservationId);
			res.json({
				success: true,
				message: 'Hủy đặt bàn thành công, xin hẹn quý khách vào những dịp khác',
			});
		} catch (error) {
			console.log('Cancel reservation error:', error);
			res.status(400).json({
				success: false,
				message: error.message || 'Hủy đặt bàn thất bại',
				error: error.message,
			});
		}
	}
}

module.exports = ReservationController;