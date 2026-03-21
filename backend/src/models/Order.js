const pool = require('../config/database');

class Order {
  static async createFromCart({
    userId = null,
    sessionId = null,
    customerName,
    customerPhone,
    customerEmail,
    pickupTime,
    note = null,
    paymentStatus = 'DEPOSIT_PAID'
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const ownerField = userId ? 'user_id' : 'session_id';
      const ownerValue = userId || sessionId;

      if (!ownerValue) {
        const error = new Error('Không xác định được chủ sở hữu giỏ hàng');
        error.statusCode = 400;
        throw error;
      }

      const cartResult = await client.query(
        `SELECT id, user_id, session_id
         FROM carts
         WHERE ${ownerField} = $1 AND status = 'ACTIVE'
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [ownerValue]
      );

      const cart = cartResult.rows[0];
      if (!cart) {
        const error = new Error('Không tìm thấy giỏ hàng để tạo đơn');
        error.statusCode = 400;
        throw error;
      }

      const existedOrder = await client.query(
        'SELECT id FROM orders WHERE cart_id = $1 LIMIT 1',
        [cart.id]
      );

      if (existedOrder.rows.length > 0) {
        const error = new Error('Giỏ hàng này đã được tạo đơn trước đó');
        error.statusCode = 409;
        throw error;
      }

      const itemResult = await client.query(
        `SELECT
           ci.menu_item_id,
           ci.quantity,
           ci.note,
           mi.name,
           mi.images,
           mi.available,
           COALESCE(mi.sale_price, mi.price) AS unit_price
         FROM cart_items ci
         JOIN menu_items mi ON mi.id = ci.menu_item_id
         WHERE ci.cart_id = $1`,
        [cart.id]
      );

      const items = itemResult.rows;
      if (items.length === 0) {
        const error = new Error('Giỏ hàng trống, không thể tạo đơn');
        error.statusCode = 400;
        throw error;
      }

      const unavailableItems = items.filter((item) => !item.available);
      if (unavailableItems.length > 0) {
        const itemNames = unavailableItems.map((item) => item.name).join(', ');
        const error = new Error(`Một số món hiện không còn phục vụ: ${itemNames}`);
        error.statusCode = 400;
        throw error;
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
        0
      );

      const discountAmount = 0;
      const finalAmount = totalAmount - discountAmount;
      const depositAmount = Number((finalAmount * 0.5).toFixed(2));

      const orderInsert = await client.query(
        `INSERT INTO orders (
           user_id,
           session_id,
           cart_id,
           status,
           payment_status,
           total_amount,
           discount_amount,
           final_amount,
           deposit_amount,
           customer_name,
           customer_phone,
           customer_email,
           pickup_time,
           note
         ) VALUES (
           $1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
         )
         RETURNING *`,
        [
          cart.user_id,
          cart.session_id,
          cart.id,
          paymentStatus,
          totalAmount,
          discountAmount,
          finalAmount,
          depositAmount,
          customerName,
          customerPhone,
          customerEmail,
          pickupTime,
          note
        ]
      );

      const order = orderInsert.rows[0];

      for (const item of items) {
        const lineTotal = Number(item.unit_price) * Number(item.quantity);
        await client.query(
          `INSERT INTO order_items (
             order_id,
             menu_item_id,
             item_name,
             item_image,
             note,
             quantity,
             unit_price,
             line_total
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            order.id,
            item.menu_item_id,
            item.name,
            Array.isArray(item.images) ? item.images[0] || null : null,
            item.note,
            item.quantity,
            item.unit_price,
            lineTotal
          ]
        );
      }

      await client.query(
        `UPDATE carts
         SET status = 'CHECKED_OUT', updated_at = NOW()
         WHERE id = $1`,
        [cart.id]
      );

      await client.query('COMMIT');

      return this.getOrderById(order.id, cart.user_id, cart.session_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getOrderById(orderId, userId = null, sessionId = null) {
    const ownerField = userId ? 'o.user_id = $2' : 'o.session_id = $2';
    const ownerValue = userId || sessionId;

    if (!ownerValue) {
      return null;
    }

    const orderResult = await pool.query(
      `SELECT
         o.id,
         o.user_id,
         o.session_id,
         o.cart_id,
         o.status,
         o.payment_status,
         o.total_amount,
         o.discount_amount,
         o.final_amount,
         o.deposit_amount,
         o.customer_name,
         o.customer_phone,
         o.customer_email,
         o.pickup_time,
         o.note,
         o.created_at,
         o.updated_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'menu_item_id', oi.menu_item_id,
               'item_name', oi.item_name,
               'item_image', oi.item_image,
               'note', oi.note,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'line_total', oi.line_total
             ) ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND ${ownerField}
       GROUP BY o.id`,
      [orderId, ownerValue]
    );

    return orderResult.rows[0] || null;
  }
}

module.exports = Order;
