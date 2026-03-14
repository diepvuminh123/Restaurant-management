const ReservationService = require('../services/reservationService');

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
}

module.exports = ReservationController;