const CartService = require('../services/cartService');

class CartController {
  static getCartOwner(req) {
    const userId = req.session?.userId || null;
    const sessionId = userId ? null : req.sessionID;
    return { userId, sessionId };
  }

  /**
   * GET /api/cart
   * Lấy giỏ hàng hiện tại
   */
  static async getCart(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);

      const cart = await CartService.getCurrentCart(userId, sessionId);

      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * POST /api/cart/items
   * Thêm món vào giỏ hàng
   * Body: { menu_item_id, quantity, note }
   */
  static async addItem(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);
      const { menu_item_id, quantity, note } = req.body;

      if (!menu_item_id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin món ăn'
        });
      }

      const cart = await CartService.addItemToCart(
        userId,
        sessionId,
        menu_item_id,
        quantity || 1,
        note || null
      );

      res.json({
        success: true,
        message: 'Đã thêm món vào giỏ hàng',
        data: cart
      });
    } catch (error) {
      console.error('Add item error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi thêm món vào giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/cart/items/:id
   * Cập nhật item trong giỏ hàng
   * Body: { quantity?, note? }
   */
  static async updateItem(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);
      const cartItemId = parseInt(req.params.id);
      const { quantity, note } = req.body;

      if (!cartItemId) {
        return res.status(400).json({
          success: false,
          message: 'ID item không hợp lệ'
        });
      }

      const cart = await CartService.updateCartItem(
        userId,
        sessionId,
        cartItemId,
        quantity,
        note
      );

      res.json({
        success: true,
        message: 'Đã cập nhật giỏ hàng',
        data: cart
      });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/cart/items/:id
   * Xóa item khỏi giỏ hàng
   */
  static async removeItem(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);
      const cartItemId = parseInt(req.params.id);

      if (!cartItemId) {
        return res.status(400).json({
          success: false,
          message: 'ID item không hợp lệ'
        });
      }

      const cart = await CartService.removeItemFromCart(
        userId,
        sessionId,
        cartItemId
      );

      res.json({
        success: true,
        message: 'Đã xóa món khỏi giỏ hàng',
        data: cart
      });
    } catch (error) {
      console.error('Remove item error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa món khỏi giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/cart
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);

      const cart = await CartService.clearCart(userId, sessionId);

      res.json({
        success: true,
        message: 'Đã xóa toàn bộ giỏ hàng',
        data: cart
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * POST /api/cart/migrate
   * Migrate guest cart sang user cart khi đăng nhập
   * Body: { guest_session_id }
   */
  static async migrateCart(req, res) {
    try {
      const userId = req.session?.userId;
      const { guest_session_id } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện chức năng này'
        });
      }

      if (!guest_session_id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu guest_session_id'
        });
      }

      const cart = await CartService.migrateGuestCart(guest_session_id, userId);

      res.json({
        success: true,
        message: 'Đã chuyển giỏ hàng sang tài khoản',
        data: cart
      });
    } catch (error) {
      console.error('Migrate cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi chuyển giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * GET /api/cart/validate
   * Validate giỏ hàng trước khi checkout
   */
  static async validateCart(req, res) {
    try {
      const { userId, sessionId } = CartController.getCartOwner(req);

      const result = await CartService.validateCart(userId, sessionId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Validate cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra giỏ hàng',
        error: error.message
      });
    }
  }
}

module.exports = CartController;
