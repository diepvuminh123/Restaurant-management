const Cart = require('../models/Cart');

class CartService {
  static resolveCartOwner(userId, sessionId) {
    if (userId) {
      return { userId, sessionId: null };
    }

    if (!sessionId) {
      throw new Error('Cần có user_id hoặc session_id');
    }

    return { userId: null, sessionId };
  }

  /**
   * Lấy giỏ hàng hiện tại của user hoặc guest
   */
  static async getCurrentCart(userId, sessionId) {
    const owner = this.resolveCartOwner(userId, sessionId);

    const cart = await Cart.findOrCreateActiveCart(owner.userId, owner.sessionId);
    const cartWithItems = await Cart.getCartWithItems(cart.id);
    const totals = await Cart.calculateCartTotal(cart.id);

    return {
      ...cartWithItems,
      ...totals
    };
  }

  /**
   * Thêm item vào giỏ hàng
   */
  static async addItemToCart(userId, sessionId, menuItemId, quantity, note) {
    if (quantity <= 0) {
      throw new Error('Số lượng phải lớn hơn 0');
    }

    const owner = this.resolveCartOwner(userId, sessionId);

    const cart = await Cart.findOrCreateActiveCart(owner.userId, owner.sessionId);
    
    await Cart.addItem(cart.id, menuItemId, quantity, note);

    return await this.getCurrentCart(owner.userId, owner.sessionId);
  }

  /**
   * Cập nhật số lượng item trong giỏ
   */
  static async updateCartItem(userId, sessionId, cartItemId, quantity, note = undefined) {
    if (quantity !== undefined && quantity <= 0) {
      throw new Error('Số lượng phải lớn hơn 0');
    }

    const owner = this.resolveCartOwner(userId, sessionId);

    const cart = await Cart.findOrCreateActiveCart(owner.userId, owner.sessionId);

    if (quantity !== undefined) {
      const updated = await Cart.updateItemQuantity(cartItemId, cart.id, quantity);
      if (!updated) {
        throw new Error('Không tìm thấy item trong giỏ hàng');
      }
    }

    if (note !== undefined) {
      const updated = await Cart.updateItemNote(cartItemId, cart.id, note);
      if (!updated) {
        throw new Error('Không tìm thấy item trong giỏ hàng');
      }
    }

    return await this.getCurrentCart(owner.userId, owner.sessionId);
  }

  /**
   * Xóa item khỏi giỏ hàng
   */
  static async removeItemFromCart(userId, sessionId, cartItemId) {
    const owner = this.resolveCartOwner(userId, sessionId);
    const cart = await Cart.findOrCreateActiveCart(owner.userId, owner.sessionId);
    
    const removed = await Cart.removeItem(cartItemId, cart.id);
    if (!removed) {
      throw new Error('Không tìm thấy item trong giỏ hàng');
    }

    return await this.getCurrentCart(owner.userId, owner.sessionId);
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart(userId, sessionId) {
    const owner = this.resolveCartOwner(userId, sessionId);
    const cart = await Cart.findOrCreateActiveCart(owner.userId, owner.sessionId);
    await Cart.clearCart(cart.id);
    
    return await this.getCurrentCart(owner.userId, owner.sessionId);
  }

  /**
   * Migrate guest cart sang user cart khi đăng nhập
   */
  static async migrateGuestCart(sessionId, userId) {
    if (!sessionId || !userId) {
      return null;
    }

    await Cart.migrateGuestCartToUser(sessionId, userId);
    
    return await this.getCurrentCart(userId, null);
  }

  /**
   * Validate giỏ hàng trước khi checkout
   */
  static async validateCart(userId, sessionId) {
    const cart = await this.getCurrentCart(userId, sessionId);
    
    const errors = [];

    if (!cart.items || cart.items.length === 0) {
      errors.push('Giỏ hàng trống');
    }

    cart.items.forEach(item => {
      if (!item.available) {
        errors.push(`Món "${item.name}" hiện không còn phục vụ`);
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        cart
      };
    }

    return {
      valid: true,
      cart
    };
  }
}

module.exports = CartService;
