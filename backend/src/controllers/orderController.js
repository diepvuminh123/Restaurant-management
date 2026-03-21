const OrderService = require('../services/orderService');

class OrderController {
  static getOrderOwner(req) {
    const userId = req.session?.userId || null;
    const sessionId = userId ? null : req.sessionID;
    return { userId, sessionId };
  }

  static async createOrder(req, res) {
    try {
      const { userId, sessionId } = OrderController.getOrderOwner(req);

      const order = await OrderService.createOrder(userId, sessionId, req.body);

      res.status(201).json({
        success: true,
        message: 'Đặt món thành công',
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Create order error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi tạo đơn hàng',
        error: error.message
      });
    }
  }
}

module.exports = OrderController;
