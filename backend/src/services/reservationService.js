const Reservation = require('../models/Reservation');
const User = require('../models/User');

const extractTaggedValue = (text, tag) => {
  if (!text) return '';
  const source = String(text);
  const regex = new RegExp(String.raw`${tag}\s*:\s*([^|]+)`, 'i');
  const match = regex.exec(source);
  return match ? String(match[1]).trim() : '';
};

const parseReservationMetadata = (restaurantNote) => {
  const source = String(restaurantNote || '');

  return {
    customerName: extractTaggedValue(source, 'KH'),
    customerPhone: extractTaggedValue(source, 'SDT'),
    customerEmail: extractTaggedValue(source, 'Email'),
    customerNote: extractTaggedValue(source, 'Ghi chú'),
  };
};

const buildRestaurantNote = ({ customerName, customerPhone, customerEmail, customerNote, existingRestaurantNote }) => {
  const parts = [];

  if (customerName) parts.push(`KH: ${customerName}`);
  if (customerPhone) parts.push(`SDT: ${customerPhone}`);
  if (customerEmail) parts.push(`Email: ${customerEmail}`);
  if (customerNote) parts.push(`Ghi chú: ${customerNote}`);
  if (existingRestaurantNote) parts.push(existingRestaurantNote);

  return parts.join(' | ').slice(0, 255) || null;
};

class ReservationService {
  static async normalizeReservationForStaff(reservation) {
    if (!reservation) return null;

    const parsed = parseReservationMetadata(reservation.restaurant_note);
    let user = null;

    if (reservation.user_id) {
      user = await User.findById(reservation.user_id);
    }

    const noteValue = typeof reservation.note === 'string' ? reservation.note.trim() : '';
    const fullName = typeof user?.full_name === 'string' ? user.full_name.trim() : '';
    const username = typeof user?.username === 'string' ? user.username.trim() : '';
    const phone = typeof user?.phone === 'string' ? user.phone.trim() : '';
    const email = typeof user?.email === 'string' ? user.email.trim() : '';

    return {
      ...reservation,
      customer_name: parsed.customerName || noteValue || fullName || username || null,
      customer_phone: parsed.customerPhone || phone || null,
      customer_email: parsed.customerEmail || email || null,
      customer_note: parsed.customerNote || null,
    };
  }

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

    const {
      reservation_time,
      number_of_guests,
      table_id,
      note,
      customer_name,
      customer_phone,
      customer_email,
      restaurant_note,
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

    let user = null;
    if (owner.userId) {
      user = await User.findById(owner.userId);
    }

    const normalizedCustomerName =
      String(customer_name || '').trim()
      || String(user?.full_name || '').trim()
      || String(user?.username || '').trim()
      || null;
    const normalizedCustomerPhone = String(customer_phone || '').trim() || String(user?.phone || '').trim() || null;
    const normalizedCustomerEmail = String(customer_email || '').trim() || String(user?.email || '').trim() || null;

    return await Reservation.create({
      owner,
      tableId: table_id,
      reservationTime,
      numberOfGuests: number_of_guests,
      note: note || null,
      restaurantNote: buildRestaurantNote({
        customerName: normalizedCustomerName,
        customerPhone: normalizedCustomerPhone,
        customerEmail: normalizedCustomerEmail,
        customerNote: note,
        existingRestaurantNote: restaurant_note,
      }),
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
    const normalizedData = await Promise.all(data.map((reservation) => this.normalizeReservationForStaff(reservation)));
    return {
      data: normalizedData,
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

    const finalRestaurantNote = buildRestaurantNote({
      customerName: customer_name,
      customerPhone: customer_phone,
      customerEmail: null,
      customerNote: note,
      existingRestaurantNote: restaurant_note,
    });

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

    return await this.normalizeReservationForStaff(reservation);
  }
}

module.exports = ReservationService;