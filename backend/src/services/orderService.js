const Order = require('../models/Order');

class OrderService {
  static PAYMENT_TAG_REGEX = /^\[PAYMENT_METHOD:[^\]]+\]\s*/;

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

  static async getOrdersForStaff(query) {
    return Order.getOrdersForStaff(query);
  }

  static async lookupOrdersForGuest(query) {
    // Ưu tiên mã đơn vì đây là định danh chính xác nhất
    const orderCode = query.order_code?.trim();
    const customerPhone = query.customer_phone?.trim();
    const customerEmail = query.customer_email?.trim();

    const lookupInput = {
      orderCode: orderCode || null,
      customerPhone: orderCode ? null : customerPhone || null,
      customerEmail: orderCode || customerPhone ? null : customerEmail || null,
      limit: query.limit,
      offset: query.offset
    };

    return Order.lookupOrdersForGuest(lookupInput);
  }

  static async getOrdersForUser(userId, query) {
    if (!userId) {
      const error = new Error('Bạn cần đăng nhập để xem đơn mang về');
      error.statusCode = 401;
      throw error;
    }

    return Order.getOrdersForUser(userId, {
      status: query.status,
      page: query.page,
      limit: query.limit
    });
  }

  static async getOrderDetailForStaff(orderId) {
    const order = await Order.getOrderDetailForStaff(orderId);
    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  static async updateOrderStatus(orderId, status) {
    const order = await Order.getOrderByIdForStaff(orderId);

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'CANCELED' || order.status === 'COMPLETED') {
      const error = new Error('Đơn hàng đã kết thúc, không thể cập nhật trạng thái');
      error.statusCode = 409;
      throw error;
    }

    if (order.status === status) {
      return order;
    }

    return Order.updateOrderStatus(orderId, status);
  }

  static async cancelOrder(orderId, canceledBy, canceledReason) {
    const order = await Order.getOrderByIdForStaff(orderId);

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'CANCELED') {
      return order;
    }

    if (order.status === 'COMPLETED') {
      const error = new Error('Đơn đã hoàn tất, không thể hủy');
      error.statusCode = 409;
      throw error;
    }

    return Order.cancelOrder(orderId, canceledBy, canceledReason || null);
  }

  static async cancelOrderForUser(userId, orderId, canceledReason) {
    if (!userId) {
      const error = new Error('Bạn cần đăng nhập để hủy đơn');
      error.statusCode = 401;
      throw error;
    }

    const order = await Order.getOrderById(orderId, userId, null);

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng thuộc tài khoản của bạn');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'CANCELED') {
      return order;
    }

    if (order.status === 'COMPLETED') {
      const error = new Error('Đơn đã hoàn tất, không thể hủy');
      error.statusCode = 409;
      throw error;
    }

    return Order.cancelOrder(orderId, userId, canceledReason || null);
  }

  static async updateOrderNote(orderId, note) {
    const order = await Order.getOrderByIdForStaff(orderId);

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'CANCELED' || order.status === 'COMPLETED') {
      const error = new Error('Đơn hàng đã kết thúc, không thể cập nhật ghi chú');
      error.statusCode = 409;
      throw error;
    }

    const paymentTagMatch = (order.note || '').match(this.PAYMENT_TAG_REGEX);
    const paymentTag = paymentTagMatch ? paymentTagMatch[0].trim() : '';
    const normalizedNote = (note || '').trim();
    const finalNote = paymentTag
      ? `${paymentTag}${normalizedNote ? ` ${normalizedNote}` : ''}`
      : normalizedNote;

    return Order.updateOrderNote(orderId, finalNote);
  }
}

module.exports = OrderService;
