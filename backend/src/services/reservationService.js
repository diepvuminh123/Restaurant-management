const Reservation = require('../models/Reservation');

class ReservationService {
  static resolveReservationOwner(userId, sessionId) {
    if (userId) {
      return { userId, sessionId: null };
    }

    if (!sessionId) {
      throw new Error('Cần có user_id hoặc session_id');
    }

    return { userId: null, sessionId };
  }

  static async getTablesForSelection(reservationTime, numOfGuests) {
    if (!reservationTime || !numOfGuests) {
      throw new Error('Cần nhập đầy đủ thời gian và số lượng khách');
    }

    return await Reservation.getTablesWithAvailability(reservationTime, numOfGuests);
  }

  static async createReservation(userId, sessionId, payload) {
    const owner = this.resolveReservationOwner(userId, sessionId);

    const { reservation_time, number_of_guests, table_id, note } = payload;
    const reservationTime = reservation_time instanceof Date ? reservation_time : new Date(reservation_time);

    if (!table_id) {
      throw new Error('Thiếu table_id');
    }
    if (Number.isNaN(reservationTime.getTime())) {
      throw new TypeError('reservation_time không hợp lệ');
    }

    const tables = await Reservation.getTablesWithAvailability(reservationTime, number_of_guests);
    const chosen = tables.find((t) => t.table_id === table_id);
    if (!chosen) {
      throw new Error('Không tìm thấy bàn');
    }
    if (!chosen.selectable) {
      throw new Error(`Bàn không khả dụng: ${chosen.disabled_reason}`);
    }

    return await Reservation.create({
      owner,
      tableId: table_id,
      reservationTime,
      numberOfGuests: number_of_guests,
      note: note || null,
    });
  }

  static async getReservationHistory(userId) {
    if (!userId) {
      throw new Error('Bạn cần đăng nhập để xem lịch sử đặt bàn');
    }
    return await Reservation.getReservationsByUserId(userId);
  }

  static async cancelReservation(userId, reservationId){
    if(!userId){
      throw new Error('Bạn cần đăng nhập vào hệ thống để thực hiện tính năng này');

    }
    if (!reservationId){
      throw new Error('Không tìm thấy lịch đặt bàn trong hệ thống');

    }

    const cancelled = await Reservation.cancelReservation(userId, reservationId);
    if (!cancelled) {
      throw new Error('Không thể hủy đặt bàn (có thể đã quá giờ, đã bị hủy, hoặc không thuộc tài khoản của bạn)');
    }

    return cancelled;
  }
  static async getReservationsForStaff({ limit = 50, offset = 0, state = null, from = null, to = null } = {}) {
    const data = await Reservation.listForStaff({ limit, offset, state, from, to });
    return {
      data,
      meta: {
        limit,
        offset,
        state,
        from,
        to,
      },
    };
  }

  static async createReservationForStaff(staffUserId, payload) {
    if (!staffUserId) {
      throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
    }

    const {
      reservation_time,
      number_of_guests,
      table_id,
      note,
      restaurant_note,
      customer_name,
      customer_phone,
    } = payload;

    const reservationTime = reservation_time instanceof Date ? reservation_time : new Date(reservation_time);
    if (!table_id) {
      throw new Error('Thiếu table_id');
    }
    if (Number.isNaN(reservationTime.getTime())) {
      throw new TypeError('reservation_time không hợp lệ');
    }

    const tables = await Reservation.getTablesWithAvailability(reservationTime, number_of_guests);
    const chosen = tables.find((t) => t.table_id === table_id);
    if (!chosen) {
      throw new Error('Không tìm thấy bàn');
    }
    if (!chosen.selectable) {
      throw new Error(`Bàn không khả dụng: ${chosen.disabled_reason}`);
    }

    const owner = {
      userId: null,
      sessionId: `staff:${staffUserId}:${Date.now()}`,
    };

    const autoRestaurantNote = `KH: ${customer_name} | SDT: ${customer_phone}`;
    const finalRestaurantNote = [autoRestaurantNote, restaurant_note].filter(Boolean).join(' | ').slice(0, 255);

    return await Reservation.create({
      owner,
      tableId: table_id,
      reservationTime,
      numberOfGuests: number_of_guests,
      note: note || null,
      restaurantNote: finalRestaurantNote || null,
    });
  }

  static async getReservationDetailForStaff(reservationId) {
    if (!reservationId) {
      throw new Error('reservation_id không hợp lệ');
    }
    const reservation = await Reservation.getReservationDetailForStaff(reservationId);
    if (!reservation) return null;

    // Frontend staff modal expects `customer_name`.
    // In current schema, staff flow stores customer name in `note`.
    const name = typeof reservation.note === 'string' ? reservation.note.trim() : '';
    reservation.customer_name = name || null;
    return reservation;
  }
}

module.exports = ReservationService;