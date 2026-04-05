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

  static async getOrdersForStaff(req, res) {
    try {
      const result = await OrderService.getOrdersForStaff(req.query);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Get orders for staff error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng',
        error: error.message
      });
    }
  }

  static async lookupOrdersForGuest(req, res) {
    try {
      const orders = await OrderService.lookupOrdersForGuest(req.query);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Lookup orders for guest error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi tra cứu đơn hàng',
        error: error.message
      });
    }
  }

  static async getOrdersForUser(req, res) {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xem đơn mang về'
        });
      }

      const result = await OrderService.getOrdersForUser(userId, req.query);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Get orders for user error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng',
        error: error.message
      });
    }
  }

  static async getOrderDetailForStaff(req, res) {
    try {
      const orderId = parseInt(req.params.id, 10);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn hàng không hợp lệ'
        });
      }

      const order = await OrderService.getOrderDetailForStaff(orderId);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Get order detail error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi lấy chi tiết đơn hàng',
        error: error.message
      });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const orderId = parseInt(req.params.id, 10);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn hàng không hợp lệ'
        });
      }

      const order = await OrderService.updateOrderStatus(orderId, req.body.status);

      res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Update order status error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng',
        error: error.message
      });
    }
  }

  static async cancelOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id, 10);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn hàng không hợp lệ'
        });
      }

      const canceledBy = req.session?.userId || null;
      const order = await OrderService.cancelOrder(orderId, canceledBy, req.body.reason);

      res.json({
        success: true,
        message: 'Đã hủy đơn hàng',
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Cancel order error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi hủy đơn hàng',
        error: error.message
      });
    }
  }

  static async updateOrderNote(req, res) {
    try {
      const orderId = parseInt(req.params.id, 10);
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn hàng không hợp lệ'
        });
      }

      const order = await OrderService.updateOrderNote(orderId, req.body.note);

      res.json({
        success: true,
        message: 'Cập nhật ghi chú thành công',
        data: order
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      console.error('Update order note error:', error);
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật ghi chú',
        error: error.message
      });
    }
  }
}

module.exports = OrderController;
