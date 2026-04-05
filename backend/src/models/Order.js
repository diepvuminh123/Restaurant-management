const pool = require('../config/database');

class Order {
  static formatOrderCode(order) {
    const createdDate = new Date(order.created_at || Date.now());
    console.log('Creating order code for date:', createdDate);
    const y = createdDate.getUTCFullYear();
    const m = String(createdDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(createdDate.getUTCDate()).padStart(2, '0');
    const seq = String(order.id).padStart(6, '0');
    return `ORD-${y}${m}${d}-${seq}`;
  }

  static async createFromCart({
    userId = null,
    sessionId = null,
    customerName,
    customerPhone,
    customerEmail,
    pickupTime,
    note = null,
    paymentStatus = 'UNPAID'
  }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      // Xác định cart này của ai
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
      // Lấy cart và kiểm tra cart hợp lệ
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
        // Lấy items và validate món
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
      // Tính tiền và tạo order chính
      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
        0
      );

      const discountAmount = 0;
      const finalAmount = totalAmount - discountAmount;
      const depositAmount = Number((finalAmount * 0.5).toFixed(2));

      const now = new Date();
      const idSeqResult = await client.query(
        `SELECT nextval(pg_get_serial_sequence('orders', 'id'))::int AS id` // ????
      );
      const nextOrderId = idSeqResult.rows[0].id;
      const orderCode = this.formatOrderCode({
        id: nextOrderId,
        created_at: now,
      });
      // Tạo order chính
      const orderInsert = await client.query(
        `INSERT INTO orders (
           id,
           order_code,
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
           note,
           created_at,
           updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, 'PENDING', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
         )
         RETURNING *`,
        [
          nextOrderId,
          orderCode,
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
          note,
          now,
          now
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
        o.order_code,
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

  static async getOrderByIdForStaff(orderId) {
    const result = await pool.query(
      `SELECT id, order_code, status, payment_status, pickup_time, customer_name, customer_phone, customer_email,
              total_amount, discount_amount, final_amount, deposit_amount, note,
              canceled_reason, canceled_at, canceled_by, confirmed_at, confirmed_by, created_at, updated_at
       FROM orders
       WHERE id = $1
       LIMIT 1`,
      [orderId]
    );

    return result.rows[0] || null;
  }

  static async confirmDepositPaid(orderId) {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = 'DEPOSIT_PAID', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    return result.rows[0] || null;
  }

  static async getOrdersForStaff({ date, status, search, page = 1, limit = 10 }) {
    const where = [];
    const values = [];
    let idx = 1;

    if (date) {
      where.push(`DATE(o.created_at) = $${idx++}`);
      values.push(date);
    }

    if (status && status !== 'ALL') {
      where.push(`o.status = $${idx++}`);
      values.push(status);
    }

    if (search) {
      where.push(`(o.order_code ILIKE $${idx} OR o.customer_name ILIKE $${idx} OR o.customer_phone ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx += 1;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM orders o
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0]?.total || 0;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    const listValues = [...values, safeLimit, offset];
    const listResult = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.status,
         o.payment_status,
         o.customer_name,
         o.customer_phone,
         o.pickup_time,
         o.final_amount,
         o.created_at
       FROM orders o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      listValues
    );

    return {
      items: listResult.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        total_pages: Math.max(1, Math.ceil(total / safeLimit))
      }
    };
  }

  static async getOrderDetailForStaff(orderId) {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.status,
         o.payment_status,
         o.customer_name,
         o.customer_phone,
         o.customer_email,
         o.pickup_time,
         o.total_amount,
         o.discount_amount,
         o.final_amount,
         o.deposit_amount,
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
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    return result.rows[0] || null;
  }

  static async updateOrderStatus(orderId, status) {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW(),
           confirmed_at = CASE WHEN $3 = 'CONFIRMED' THEN NOW() ELSE confirmed_at END
       WHERE id = $2
       RETURNING *`,
      [status, orderId, status]
    );

    return result.rows[0] || null;
  }

  static async cancelOrder(orderId, canceledBy, canceledReason = null) {
    const result = await pool.query(
      `UPDATE orders
       SET status = 'CANCELED',
           canceled_by = $2,
           canceled_reason = $3,
           canceled_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId, canceledBy, canceledReason]
    );

    return result.rows[0] || null;
  }
// khách chưa đăng nhập (guest) tra cứu đơn
  static async lookupOrdersForGuest({ orderCode = null, customerPhone = null, customerEmail = null, limit = 10 }) {
    const where = [];
    const values = [];
    let idx = 1;

    // Chỉ dùng duy nhất 1 tiêu chí (ưu tiên theo service): mã đơn > sđt > email
    if (orderCode) {
      where.push(`UPPER(o.order_code) = UPPER($${idx++})`);
      values.push(orderCode);
    } else if (customerPhone) {
      where.push(`o.customer_phone = $${idx++}`);
      values.push(customerPhone);
    } else if (customerEmail) {
      where.push(`LOWER(o.customer_email) = LOWER($${idx++})`);
      values.push(customerEmail);
    }

    if (where.length === 0) {
      return [];
    }

    const safeLimit = Math.max(1, Math.min(20, Number(limit) || 10));
    values.push(safeLimit);

    const result = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.status,
         o.payment_status,
         o.customer_name,
         o.customer_phone,
         o.customer_email,
         o.pickup_time,
         o.final_amount,
         o.deposit_amount,
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
       WHERE ${where.join(' AND ')}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${idx}`,
      values
    );

    return result.rows;
  }

  static async getOrdersForUser(userId, { status = 'ALL', page = 1, limit = 20 } = {}) {
    const where = ['o.user_id = $1'];
    const values = [userId];
    let idx = 2;

    if (status && status !== 'ALL') {
      where.push(`o.status = $${idx++}`);
      values.push(status);
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(30, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = where.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM orders o
       WHERE ${whereClause}`,
      values
    );

    const total = countResult.rows[0]?.total || 0;

    values.push(safeLimit);
    values.push(offset);

    const result = await pool.query(
      `SELECT
         o.id,
         o.order_code,
         o.status,
         o.payment_status,
         o.customer_name,
         o.customer_phone,
         o.customer_email,
         o.pickup_time,
         o.final_amount,
         o.deposit_amount,
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
       WHERE ${whereClause}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return {
      items: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        total_pages: Math.max(1, Math.ceil(total / safeLimit))
      }
    };
  }

  static async updateOrderNote(orderId, note) {
    const result = await pool.query(
      `UPDATE orders
       SET note = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [note, orderId]
    );

    return result.rows[0] || null;
  }
}

module.exports = Order;
