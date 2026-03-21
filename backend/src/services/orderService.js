const Order = require('../models/Order');

class OrderService {
  static paymentMethodToLabel(paymentMethod) {
    switch (paymentMethod) {
      case 'zalopay':
        return 'ZaloPay';
      case 'acb':
        return 'ACB';
      case 'vietcombank':
        return 'Vietcombank';
      default:
        return 'Unknown';
    }
  }

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

    const paymentStatus = 'UNPAID';
    const paymentLabel = this.paymentMethodToLabel(payload.payment_method);
    const customerNote = payload.note?.trim() || '';
    const combinedNote = customerNote
      ? `[PAYMENT_METHOD:${paymentLabel}] ${customerNote}`
      : `[PAYMENT_METHOD:${paymentLabel}]`;

    return Order.createFromCart({
      userId: owner.userId,
      sessionId: owner.sessionId,
      customerName: payload.customer_name,
      customerPhone: payload.customer_phone,
      customerEmail: payload.customer_email,
      pickupTime: pickupDate.toISOString(),
      note: combinedNote,
      paymentStatus
    });
  }

  static async confirmDeposit(orderId) {
    const order = await Order.getOrderByIdForStaff(orderId);

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'CANCELED') {
      const error = new Error('Đơn hàng đã hủy, không thể xác nhận cọc');
      error.statusCode = 409;
      throw error;
    }

    if (order.payment_status === 'DEPOSIT_PAID' || order.payment_status === 'PAID') {
      return order;
    }

    if (order.payment_status !== 'UNPAID') {
      const error = new Error('Trạng thái thanh toán hiện tại không thể xác nhận cọc');
      error.statusCode = 409;
      throw error;
    }

    const updatedOrder = await Order.confirmDepositPaid(orderId);
    return updatedOrder;
  }
}

module.exports = OrderService;
