const pool = require('../config/database');

class Stats {
  static async getDashboardStats(timeRange = 'month') {
    const client = await pool.connect();

    try {
      // Xác định khoảng thời gian
      let timeFilter = "NOW() - INTERVAL '30 days'";
      if (timeRange === 'week') {
        timeFilter = "NOW() - INTERVAL '7 days'";
      } else if (timeRange === 'today') {
        timeFilter = "CURRENT_DATE";
      } else if (timeRange === 'all') {
        timeFilter = "'1970-01-01'";
      }

      // 1. Tổng đơn hàng, doanh thu (không tính CANCELED)
      const overviewResult = await client.query(`
        SELECT 
          COUNT(id) as total_orders,
          COALESCE(SUM(final_amount), 0) as total_revenue
        FROM orders
        WHERE status != 'CANCELED' 
          AND created_at >= ${timeFilter}
      `);

      const totalOrders = parseInt(overviewResult.rows[0].total_orders) || 0;
      const totalRevenue = parseFloat(overviewResult.rows[0].total_revenue) || 0;

      // 2. Tổng số khách hàng (loại trừ các quyền quản trị/nhân viên)
      const customersResult = await client.query(`
        SELECT COUNT(user_id) as total_customers
        FROM users
        WHERE role NOT IN ('admin', 'employee', 'system_admin', 'staff')
      `);
      const totalCustomers = parseInt(customersResult.rows[0].total_customers) || 0;

      // 3. Top 5 món ăn bán chạy nhất
      const topDishesResult = await client.query(`
        SELECT 
          mi.id,
          oi.item_name as name,
          COALESCE(SUM(oi.quantity), 0) as sold,
            mi.price as price

        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.status != 'CANCELED'
          AND o.created_at >= ${timeFilter}
        GROUP BY mi.id, oi.item_name
        ORDER BY sold DESC
        LIMIT 5
      `);
      const topDishes = topDishesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        sold: parseInt(row.sold),
        price: parseFloat(row.price)
      }));

      // 4. Tổng quan đơn hàng (Biểu đồ động theo timeRange)
      let overviewQuery = '';
      if (timeRange === 'today') {
        overviewQuery = `
          WITH Hours AS (
            SELECT generate_series(0, 23) AS hour_val
          )
          SELECT 
            h.hour_val,
            LPAD(h.hour_val::text, 2, '0') || ':00' as display_label,
            COUNT(o.id) as orders_count
          FROM Hours h
          LEFT JOIN orders o 
            ON EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = h.hour_val
            AND (o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = CURRENT_DATE
            AND o.status != 'CANCELED'
          GROUP BY h.hour_val
          ORDER BY h.hour_val ASC;
        `;
      } else if (timeRange === 'week' || !timeRange) {
        overviewQuery = `
          WITH Last7Days AS (
            SELECT (CURRENT_DATE - i) AS date_val
            FROM generate_series(0, 6) i
          )
          SELECT 
            d.date_val,
            CASE EXTRACT(ISODOW FROM d.date_val)
              WHEN 1 THEN 'Thứ 2'
              WHEN 2 THEN 'Thứ 3'
              WHEN 3 THEN 'Thứ 4'
              WHEN 4 THEN 'Thứ 5'
              WHEN 5 THEN 'Thứ 6'
              WHEN 6 THEN 'Thứ 7'
              WHEN 7 THEN 'CN'
            END as display_label,
            COUNT(o.id) as orders_count
          FROM Last7Days d
          LEFT JOIN orders o 
            ON (o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = d.date_val
            AND o.status != 'CANCELED'
          GROUP BY d.date_val, display_label
          ORDER BY d.date_val ASC;
        `;
      } else if (timeRange === 'month') {
        overviewQuery = `
          WITH Last30Days AS (
            SELECT (CURRENT_DATE - i) AS date_val
            FROM generate_series(0, 29) i
          )
          SELECT 
            d.date_val,
            TO_CHAR(d.date_val, 'DD/MM') as display_label,
            COUNT(o.id) as orders_count
          FROM Last30Days d
          LEFT JOIN orders o 
            ON (o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = d.date_val
            AND o.status != 'CANCELED'
          GROUP BY d.date_val, display_label
          ORDER BY d.date_val ASC;
        `;
      } else if (timeRange === 'all') {
        overviewQuery = `
          WITH Last12Months AS (
            SELECT (DATE_TRUNC('month', CURRENT_DATE) - (i || ' month')::interval)::date AS month_val
            FROM generate_series(0, 11) i
          )
          SELECT 
            m.month_val,
            TO_CHAR(m.month_val, 'MM/YYYY') as display_label,
            COUNT(o.id) as orders_count
          FROM Last12Months m
          LEFT JOIN orders o 
            ON DATE_TRUNC('month', o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = m.month_val
            AND o.status != 'CANCELED'
          GROUP BY m.month_val, display_label
          ORDER BY m.month_val ASC;
        `;
      }

      const ordersOverviewResult = await client.query(overviewQuery);
      const ordersOverview = ordersOverviewResult.rows.map(row => ({
        day: row.display_label,
        orders: parseInt(row.orders_count)
      }));

      // 5. Phân bổ danh mục
      const topCategoriesResult = await client.query(`
        WITH CategorySales AS (
          SELECT 
            mc.id,
            mc.name,
            SUM(oi.quantity) as total_sold
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          JOIN menu_item_categories mic ON oi.menu_item_id = mic.menu_item_id
          JOIN menu_categories mc ON mic.category_id = mc.id
          WHERE o.status != 'CANCELED'
            AND o.created_at >= ${timeFilter}
          GROUP BY mc.id, mc.name
        ), TotalSales AS (
          SELECT COALESCE(SUM(total_sold), 1) as grand_total FROM CategorySales
        )
        SELECT 
          cs.name,
          cs.total_sold,
          ROUND((cs.total_sold::numeric / ts.grand_total::numeric) * 100, 1) as percentage
        FROM CategorySales cs, TotalSales ts
        ORDER BY cs.total_sold DESC
        LIMIT 4
      `);
      const topCategories = topCategoriesResult.rows.map(row => ({
        name: row.name,
        value: parseFloat(row.percentage)
      }));

      // 6. Trạng thái đơn hàng
      const orderStatusesResult = await client.query(`
        SELECT 
          status,
          COUNT(id) as count
        FROM orders
        WHERE created_at >= ${timeFilter}
        GROUP BY status
      `);

      const allStatuses = {
        'PENDING': { name: 'Chờ xác nhận', count: 0 },
        'CONFIRMED': { name: 'Đã xác nhận', count: 0 },
        'PREPARING': { name: 'Đang chuẩn bị', count: 0 },
        'READY': { name: 'Đã sẵn sàng', count: 0 },
        'COMPLETED': { name: 'Đã hoàn thành', count: 0 }
      };

      let totalValidOrders = 0;
      orderStatusesResult.rows.forEach(row => {
        if (allStatuses[row.status]) {
          allStatuses[row.status].count = parseInt(row.count);
          totalValidOrders += parseInt(row.count);
        }
      });

      const orderStatuses = Object.keys(allStatuses).map(key => {
        const item = allStatuses[key];
        return {
          name: item.name,
          count: item.count,
          percentage: totalValidOrders > 0 ? parseFloat((item.count / totalValidOrders * 100).toFixed(1)) : 0
        };
      }).filter(s => s.count > 0);

      return {
        totalOrders,
        totalCustomers,
        totalRevenue,
        topDishes,
        ordersOverview,
        topCategories,
        orderStatuses
      };

    } finally {
      client.release();
    }
  }
}

module.exports = Stats;
