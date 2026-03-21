const Order = require('../models/Order');

class OrderService {
  static resolveOrderOwner(userId, sessionId) {
    if (userId) {
      return { userId, sessionId: null };
    }

    if (!sessionId) {
      const error = new Error('Cần đăng nhập hoặc có phiên guest hợp lệ để đặt món');
      error.statusCode = 400;
      throw error;
    }

    return { userId: null, sessionId };
  }

  static async createOrder(userId, sessionId, payload) {
    const owner = this.resolveOrderOwner(userId, sessionId);

    const pickupDate = new Date(payload.pickup_time);
    if (Number.isNaN(pickupDate.getTime())) {
      const error = new Error('pickup_time không hợp lệ');
      error.statusCode = 400;
      throw error;
    }

    if (pickupDate.getTime() < Date.now()) {
      const error = new Error('Thời gian nhận món phải lớn hơn thời gian hiện tại');
      error.statusCode = 400;
      throw error;
    }

    const paymentStatus = payload.deposit_paid ? 'DEPOSIT_PAID' : 'UNPAID';

    return Order.createFromCart({
      userId: owner.userId,
      sessionId: owner.sessionId,
      customerName: payload.customer_name,
      customerPhone: payload.customer_phone,
      customerEmail: payload.customer_email,
      pickupTime: pickupDate.toISOString(),
      note: payload.note || null,
      paymentStatus
    });
  }
}

module.exports = OrderService;
