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

  static async confirmDeposit(req, res) {
    try {
      const orderId = parseInt(req.params.id, 10);

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn hàng không hợp lệ'
        });
      }

      const order = await OrderService.confirmDeposit(orderId);

      res.json({
        success: true,
        message: 'Đã xác nhận đơn hàng đã cọc',
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Confirm deposit error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi xác nhận cọc',
        error: error.message
      });
    }
  }
}

module.exports = OrderController;
