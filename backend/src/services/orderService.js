const Order = require('../models/Order');
const sseService = require('./sseService');

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

    const minLeadTimeMinutes = 120; // 2 hours
    const now = Date.now();
    const minPickupTime = now + minLeadTimeMinutes * 60 * 1000;

    if (pickupDate.getTime() < minPickupTime) {
      const error = new Error('Thời gian nhận món phải sau ít nhất 2 tiếng kể từ bây giờ để nhà hàng kịp chuẩn bị.');
      error.statusCode = 400;
      throw error;
    }

    const paymentStatus = 'UNPAID';
    const paymentLabel = this.paymentMethodToLabel(payload.payment_method);
    const customerNote = payload.note?.trim() || '';
    const combinedNote = customerNote
      ? `[PAYMENT_METHOD:${paymentLabel}] ${customerNote}`
      : `[PAYMENT_METHOD:${paymentLabel}]`;

    const order = await Order.createFromCart({
      userId: owner.userId,
      sessionId: owner.sessionId,
      customerName: payload.customer_name,
      customerPhone: payload.customer_phone,
      customerEmail: payload.customer_email,
      pickupTime: pickupDate.toISOString(),
      note: combinedNote,
      paymentStatus,
      promotionCode: payload.promotion_code?.trim().toUpperCase() || null
    });

    // Thông báo cho nhân viên về đơn hàng mới
    sseService.notifyStaff('NEW_ORDER', {
      id: order.id,
      order_code: order.order_code,
      customer_name: order.customer_name,
      total_amount: order.total_amount
    });

    return order;
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
    
    // Thông báo cho khách hàng và nhân viên
    sseService.notifyCustomer(updatedOrder.user_id, updatedOrder.session_id, 'ORDER_STATUS_UPDATED', updatedOrder);
    sseService.notifyStaff('ORDER_STATUS_UPDATED', updatedOrder);

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

    const updatedOrder = await Order.updateOrderStatus(orderId, status);

    // Thông báo cập nhật trạng thái
    sseService.notifyCustomer(updatedOrder.user_id, updatedOrder.session_id, 'ORDER_STATUS_UPDATED', updatedOrder);
    sseService.notifyStaff('ORDER_STATUS_UPDATED', updatedOrder);

    return updatedOrder;
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

    const canceledOrder = await Order.cancelOrder(orderId, canceledBy, canceledReason || null);

    // Thông báo hủy đơn
    sseService.notifyCustomer(canceledOrder.user_id, canceledOrder.session_id, 'ORDER_STATUS_UPDATED', canceledOrder);
    sseService.notifyStaff('ORDER_STATUS_UPDATED', canceledOrder);

    return canceledOrder;
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

    const canceledOrder = await Order.cancelOrder(orderId, userId, canceledReason || null);

    // Thông báo hủy đơn cho cả khách và nhân viên
    sseService.notifyCustomer(canceledOrder.user_id, canceledOrder.session_id, 'ORDER_STATUS_UPDATED', canceledOrder);
    sseService.notifyStaff('ORDER_STATUS_UPDATED', canceledOrder);

    return canceledOrder;
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
