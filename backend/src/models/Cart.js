const pool = require("../config/database");

class Cart {
  /**
   * Tìm hoặc tạo giỏ hàng ACTIVE
   * @param {number|null} userId - ID người dùng (null nếu guest)
   * @param {string|null} sessionId - Session ID cho guest
   */
  static async findOrCreateActiveCart(userId = null, sessionId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (userId) {
        sessionId = null;
      }

      let cart;
      if (userId) {
        const result = await client.query(
          `SELECT * FROM carts WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
          [userId]
        );
        cart = result.rows[0];
      } else if (sessionId) {
        const result = await client.query(
          `SELECT * FROM carts WHERE session_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
          [sessionId]
        );
        cart = result.rows[0];
      }

      if (!cart) {
        const insertResult = await client.query(
          `INSERT INTO carts (user_id, session_id, status) VALUES ($1, $2, 'ACTIVE') RETURNING *`,
          [userId, sessionId]
        );
        cart = insertResult.rows[0];
      }

      await client.query('COMMIT');
      return cart;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Lấy giỏ hàng với tất cả items
   */
  static async getCartWithItems(cartId) {
    const result = await pool.query(
      `SELECT 
        c.id as cart_id,
        c.user_id,
        c.session_id,
        c.status,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ci.id,
              'menu_item_id', ci.menu_item_id,
              'quantity', ci.quantity,
              'note', ci.note,
              'name', mi.name,
              'description_short', mi.description_short,
              'price', mi.price,
              'sale_price', mi.sale_price,
              'images', mi.images,
              'available', mi.available
            ) ORDER BY ci.created_at
          ) FILTER (WHERE ci.id IS NOT NULL),
          '[]'
        ) as items
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN menu_items mi ON ci.menu_item_id = mi.id
      WHERE c.id = $1
      GROUP BY c.id`,
      [cartId]
    );
    return result.rows[0];
  }

  /**
   * Thêm item vào giỏ hàng
   */
  static async addItem(cartId, menuItemId, quantity, note = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkItem = await client.query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2`,
        [cartId, menuItemId]
      );

      let result;
      if (checkItem.rows.length > 0) {
        const newQuantity = checkItem.rows[0].quantity + quantity;
        result = await client.query(
          `UPDATE cart_items SET quantity = $1, note = COALESCE($2, note), updated_at = NOW() 
           WHERE cart_id = $3 AND menu_item_id = $4 RETURNING *`,
          [newQuantity, note, cartId, menuItemId]
        );
      } else {
        result = await client.query(
          `INSERT INTO cart_items (cart_id, menu_item_id, quantity, note) VALUES ($1, $2, $3, $4) RETURNING *`,
          [cartId, menuItemId, quantity, note]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật số lượng item trong giỏ
   */
  static async updateItemQuantity(cartItemId, cartId, quantity) {
    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW() 
       WHERE id = $2 AND cart_id = $3 RETURNING *`,
      [quantity, cartItemId, cartId]
    );
    return result.rows[0];
  }

  /**
   * Cập nhật ghi chú item trong giỏ
   */
  static async updateItemNote(cartItemId, cartId, note) {
    const result = await pool.query(
      `UPDATE cart_items SET note = $1, updated_at = NOW() 
       WHERE id = $2 AND cart_id = $3 RETURNING *`,
      [note, cartItemId, cartId]
    );
    return result.rows[0];
  }

  /**
   * Xóa item khỏi giỏ hàng
   */
  static async removeItem(cartItemId, cartId) {
    const result = await pool.query(
      `DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *`,
      [cartItemId, cartId]
    );
    return result.rows[0];
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart(cartId) {
    await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
    return true;
  }

  /**
   * Cập nhật trạng thái giỏ hàng
   */
  static async updateCartStatus(cartId, status) {
    const result = await pool.query(
      `UPDATE carts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, cartId]
    );
    return result.rows[0];
  }

  /**
   * Migrate guest cart sang user cart khi đăng nhập
   */
  static async migrateGuestCartToUser(sessionId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const guestCart = await client.query(
        `SELECT id FROM carts WHERE session_id = $1 AND status = 'ACTIVE' LIMIT 1`,
        [sessionId]
      );

      if (guestCart.rows.length > 0) {
        const userCart = await client.query(
          `SELECT id FROM carts WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1`,
          [userId]
        );

        if (userCart.rows.length > 0) {
          await client.query(
            `INSERT INTO cart_items (cart_id, menu_item_id, quantity, note)
             SELECT $1, menu_item_id, quantity, note FROM cart_items WHERE cart_id = $2
             ON CONFLICT (cart_id, menu_item_id) 
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
            [userCart.rows[0].id, guestCart.rows[0].id]
          );

          await client.query(
            `UPDATE carts SET status = 'CANCELED' WHERE id = $1`,
            [guestCart.rows[0].id]
          );
        } else {
          await client.query(
            `UPDATE carts SET user_id = $1, session_id = NULL WHERE id = $2`,
            [userId, guestCart.rows[0].id]
          );
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Tính tổng tiền giỏ hàng
   */
  static async calculateCartTotal(cartId) {
    const result = await pool.query(
      `SELECT 
        COUNT(ci.id) as item_count,
        SUM(ci.quantity) as total_quantity,
        SUM(ci.quantity * COALESCE(mi.sale_price, mi.price)) as total_amount
      FROM cart_items ci
      JOIN menu_items mi ON ci.menu_item_id = mi.id
      WHERE ci.cart_id = $1 AND mi.available = true`,
      [cartId]
    );
    return result.rows[0];
  }
}

module.exports = Cart;
