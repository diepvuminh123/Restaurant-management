const pool = require("../config/database");

class Menu {
  /**
   * Lấy tất cả phần menu đang active
   */
  static async getAllSections() {
    const result = await pool.query(
      "SELECT id, name, sort_order, is_active FROM menu_sections WHERE is_active = true ORDER BY sort_order ASC"
    );
    return result.rows;
  }

  /**
   * Lấy danh mục theo section
   */
  static async getCategoriesBySection(sectionId) {
    const result = await pool.query(
      "SELECT id, name, section_id FROM menu_categories WHERE section_id = $1",
      [sectionId]
    );
    return result.rows;
  }

  /**
   * Lấy danh sách món ăn với filter, sort và phân trang
   */
  static async getAllMenuItems(filters = {}) {
    const {
      section_id,
      category_id,
      available,
      is_popular,
      is_new,
      is_soldout,
      search,
      price_min,
      price_max,
      sort_by = "price",
      sort_order = "ASC",
      page = 1,
      limit = 10,
    } = filters;

    let whereConditions = [];
    let params = [];
    let idx = 1; // $1,2...

    if (section_id !== undefined) {
      whereConditions.push(`mi.section_id = $${idx++}`);
      params.push(section_id);
    }

    if (category_id !== undefined) {
      if (Array.isArray(category_id) && category_id.length > 0) {
        const placeholders = category_id.map(() => `$${idx++}`).join(", ");

        whereConditions.push(`
      EXISTS (
        SELECT 1
        FROM menu_item_categories mic
        WHERE mic.menu_item_id = mi.id
          AND mic.category_id IN (${placeholders})
      )
    `);

        params.push(...category_id);
      } else {
        whereConditions.push(`
      EXISTS (
        SELECT 1
        FROM menu_item_categories mic
        WHERE mic.menu_item_id = mi.id
          AND mic.category_id = $${idx++}
      )
    `);

        params.push(category_id);
      }
    }

    if (available !== undefined) {
      whereConditions.push(`mi.available = $${idx++}`);
      params.push(available);
    }

    if (is_popular !== undefined) {
      whereConditions.push(`mi.is_popular = $${idx++}`);
      params.push(is_popular);
    }

    if (is_new !== undefined) {
      whereConditions.push(`mi.is_new = $${idx++}`);
      params.push(is_new);
    }

    if (is_soldout !== undefined) {
      whereConditions.push(`mi.is_soldout = $${idx++}`);
      params.push(is_soldout);
    }

    if (search !== undefined && search !== "") {
      whereConditions.push(
        `(mi.name ILIKE $${idx} OR mi.description_short ILIKE $${idx})` //ILike kệ chữ hoa và thường
      );
      params.push(`%${search}%`);
      idx++;
    }

    // Price filters
    if (price_min !== undefined && price_min !== null) {
      whereConditions.push(`COALESCE(mi.sale_price, mi.price) >= $${idx++}`);
      params.push(price_min);
    }

    if (price_max !== undefined && price_max !== null) {
      whereConditions.push(`COALESCE(mi.sale_price, mi.price) <= $${idx++}`);
      params.push(price_max);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";
    console.log("WHERE CLAUSE:", whereClause, "PARAMS:", params);

    // Đếm tổng số items
    const countQuery = `SELECT COUNT(*) as total FROM menu_items mi ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10) || 0;
    console.log("TOTAL ITEMS ABC:", total);
    console.log("countResult: ", countResult);

    const allowedSortFields = [
      "name",
      "price",
      "rating_avg",
      "created_at",
      "is_popular",
      "is_new",
      "id",
    ];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : "price";
    console.log("SORT FIELD:", sortField);
    const sortDir =
      sort_order && sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC"; //toUpperCase() -> vuminh -> VUMINH
    console.log("SORT DIRECTION:", sortDir);

    // tính phân trang
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    console.log("OFFSET:", offset, "LIMIT:", limit);

    // Add limit & offset placeholders
    const limitPlaceholder = `$${idx++}`;
    const offsetPlaceholder = `$${idx++}`;

    const itemsQuery = `
            SELECT 
                mi.id,
                mi.name,
                mi.price,
                mi.sale_price,
                COALESCE(mi.sale_price, mi.price) as effective_price,
                mi.description_short,
                mi.images,
                mi.rating_avg,
                mi.rating_count,
                mi.is_popular,
                mi.available,
                mi.is_new,
                mi.is_soldout,
                mi.prep_time,
                mi.notes
            FROM menu_items mi
            ${whereClause}
            ORDER BY mi.${sortField} ${sortDir}
            LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
        `;

    // truy vấn
    const itemsParams = [...params, limit, offset];
    const itemsResult = await pool.query(itemsQuery, itemsParams);
    const items = itemsResult.rows;
    for (const item of items) {
      const categoriesQuery = `
    SELECT mc.name
    FROM menu_item_categories mic
    INNER JOIN menu_categories mc ON mc.id = mic.category_id
    WHERE mic.menu_item_id = $1
  `;

      const { rows: catRows } = await pool.query(categoriesQuery, [item.id]);

      item.categories = catRows.map((r) => r.name);
    }

    return {
      items: items.map((item) => ({
        ...item,
        price: item.price !== null ? parseFloat(item.price) : null,
        sale_price:
          item.sale_price !== null ? parseFloat(item.sale_price) : null,
        effective_price:
          item.effective_price !== null
            ? parseFloat(item.effective_price)
            : null,
        rating_avg: item.rating_avg !== null ? parseFloat(item.rating_avg) : 0,
        is_popular: Boolean(item.is_popular),
        available: Boolean(item.available),
        is_new: Boolean(item.is_new),
        is_soldout: Boolean(item.is_soldout),
        prep_time: item.prep_time !== null ? parseInt(item.prep_time) : null,
        notes: item.notes || "",
        categories: item.categories || [],
      })),
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        total_pages: Math.ceil(total / limit) || 0,
      },
    };
  }

  /**
   * Lấy thông tin món ăn theo ID
   */
  static async getMenuItemById(id) {
    const query = `
            SELECT 
                mi.id,
                mi.name,
                mi.description_full,
                mi.description_short,
                mi.images,
                mi.price,
                mi.sale_price,
                mi.section_id,
                mi.rating_avg,
                mi.rating_count,
                mi.available,
                mi.is_popular,
                mi.is_new,
                mi.is_soldout,
                mi.prep_time,
                mi.notes,
                ms.name as section_name
            FROM menu_items mi
            LEFT JOIN menu_sections ms ON mi.section_id = ms.id
            WHERE mi.id = $1
        `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    const item = result.rows[0];

    const categoriesQuery = `
            SELECT mc.id, mc.name
            FROM menu_categories mc
            INNER JOIN menu_item_categories mic ON mc.id = mic.category_id
            WHERE mic.menu_item_id = $1
        `;
    const categoriesResult = await pool.query(categoriesQuery, [id]);

    return {
      id: item.id,
      name: item.name,
      description_full: item.description_full,
      description_short: item.description_short || "",
      images: item.images || [],
      price: item.price !== null ? parseFloat(item.price) : null,
      sale_price: item.sale_price !== null ? parseFloat(item.sale_price) : null,
      section: {
        id: item.section_id,
        name: item.section_name,
      },
      categories: categoriesResult.rows,
      rating_avg: item.rating_avg !== null ? parseFloat(item.rating_avg) : 0,
      rating_count: item.rating_count,
      available: Boolean(item.available),
      is_popular: Boolean(item.is_popular),
      is_new: Boolean(item.is_new),
      is_soldout: Boolean(item.is_soldout),
      prep_time: item.prep_time !== null ? parseInt(item.prep_time) : null,
      notes: item.notes || "",
    };
  }

  /**
   * Tạo món ăn mới
   */
  static async createMenuItem(data) {
    const {
      name,
      price,
      description,
      category_ids = [],
      image,
      images,
      sale_price = null,
      section_id = 1,
      description_short = null,
      available = true,
      is_popular = false,
      is_new = false,
      is_soldout = false,
      prep_time = null,
      notes = null,
    } = data;

    try {
      await pool.query("BEGIN");

      const insertQuery = `
                INSERT INTO menu_items 
                    (name, price, sale_price, description_short, description_full, images, section_id, available, is_popular, is_new, is_soldout, prep_time, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            `;

      // Xử lý images: ưu tiên images array, fallback về image string
      let imagesJson = null;
      if (images && Array.isArray(images) && images.length > 0) {
        imagesJson = JSON.stringify(images);
      } else if (image) {
        imagesJson = JSON.stringify([image]);
      }

      const insertResult = await pool.query(insertQuery, [
        name,
        price,
        sale_price,
        description_short || description,
        description,
        imagesJson,
        section_id,
        available,
        is_popular,
        is_new,
        is_soldout,
        prep_time,
        notes,
      ]);

      const menuItemId = insertResult.rows[0].id;

      if (category_ids && category_ids.length > 0) {
        const insertCatQuery =
          "INSERT INTO menu_item_categories (menu_item_id, category_id) VALUES ($1, $2)";
        for (const catId of category_ids) {
          await pool.query(insertCatQuery, [menuItemId, catId]);
        }
      }

      await pool.query("COMMIT");
      return menuItemId;
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    } finally {
      pool.release();
    }
  }

  /**
   * Cập nhật món ăn
   */
  static async updateMenuItem(id, data) {
    const {
      name,
      price,
      sale_price,
      description,
      description_short,
      images,
      section_id,
      category_ids,
      available,
      is_popular,
      is_new,
      is_soldout,
      prep_time,
      notes,
    } = data;

    try {
      await pool.query("BEGIN");

      const updateFields = [];
      const updateParams = [];
      let idx = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${idx++}`);
        updateParams.push(name);
      }
      if (price !== undefined) {
        updateFields.push(`price = $${idx++}`);
        updateParams.push(price);
      }
      if (sale_price !== undefined) {
        updateFields.push(`sale_price = $${idx++}`);
        updateParams.push(sale_price);
      }
      if (description !== undefined) {
        updateFields.push(`description_full = $${idx++}`);
        updateParams.push(description);
      }
      if (description_short !== undefined) {
        updateFields.push(`description_short = $${idx++}`);
        updateParams.push(description_short);
      }
      if (images !== undefined) {
        updateFields.push(`images = $${idx++}`);
        // Nếu images là array thì stringify, nếu là string đơn thì wrap trong array
        const imagesJson = Array.isArray(images)
          ? JSON.stringify(images)
          : JSON.stringify([images]);
        updateParams.push(imagesJson);
      }
      if (section_id !== undefined) {
        updateFields.push(`section_id = $${idx++}`);
        updateParams.push(section_id);
      }
      if (available !== undefined) {
        updateFields.push(`available = $${idx++}`);
        updateParams.push(available);
      }
      if (is_popular !== undefined) {
        updateFields.push(`is_popular = $${idx++}`);
        updateParams.push(is_popular);
      }
      if (is_new !== undefined) {
        updateFields.push(`is_new = $${idx++}`);
        updateParams.push(is_new);
      }
      if (is_soldout !== undefined) {
        updateFields.push(`is_soldout = $${idx++}`);
        updateParams.push(is_soldout);
      }
      if (prep_time !== undefined) {
        updateFields.push(`prep_time = $${idx++}`);
        updateParams.push(prep_time);
      }
      if (notes !== undefined) {
        updateFields.push(`notes = $${idx++}`);
        updateParams.push(notes);
      }

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE menu_items SET ${updateFields.join(
          ", "
        )} WHERE id = $${idx}`;
        updateParams.push(id);
        await pool.query(updateQuery, updateParams);
      }

      if (category_ids !== undefined) {
        await pool.query(
          "DELETE FROM menu_item_categories WHERE menu_item_id = $1",
          [id]
        );

        if (category_ids && category_ids.length > 0) {
          const insertCatQuery =
            "INSERT INTO menu_item_categories (menu_item_id, category_id) VALUES ($1, $2)";
          for (const catId of category_ids) {
            await pool.query(insertCatQuery, [id, catId]);
          }
        }
      }

      await pool.query("COMMIT");
      return true;
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái còn hàng
   */
  static async updateAvailability(id, available) {
    const result = await pool.query(
      "UPDATE menu_items SET available = $1 WHERE id = $2",
      [available, id]
    );
    return result.rowCount > 0;
  }

  /**
   * Xóa món ăn
   */
  static async deleteMenuItem(id) {
    const result = await pool.query("DELETE FROM menu_items WHERE id = $1", [
      id,
    ]);
    return result.rowCount > 0;
  }

  /**
   * Tạo Section mới
   */
  static async createSection(data) {
    const { section_name, display_order } = data;

    const query = `
      INSERT INTO menu_sections (name, sort_order, is_active)
      VALUES ($1, $2, true)
      RETURNING *
    `;

    const result = await pool.query(query, [section_name, display_order || 0]);

    return result.rows[0];
  }
  static async checkOrderSecion(id) {
    const result = await pool.query(
      "SELECT sort_order FROM menu_sections WHERE id=$1",
      [id]
    );
    return result.rowCount > 0 ? result.rows[0] : null;
  }

  /**
   * Cập nhật Section
   */
  static async updateSection(id, data) {
    const { section_name, display_order } = data;

    const updateFields = [];
    const updateParams = [];
    let idx = 1;

    if (section_name !== undefined) {
      updateFields.push(`name = $${idx++}`);
      updateParams.push(section_name);
    }
    if (display_order !== undefined) {
      updateFields.push(`sort_order = $${idx++}`);
      updateParams.push(display_order);
    }

    if (updateFields.length === 0) {
      throw new Error("Không có trường nào để cập nhật");
    }

    const updateQuery = `UPDATE menu_sections SET ${updateFields.join(
      ", "
    )} WHERE id = $${idx} RETURNING *`;
    updateParams.push(id);

    const result = await pool.query(updateQuery, updateParams);
    return result.rowCount > 0 ? result.rows[0] : null;
  }

  /**
   * Xóa Section
   */
  static async deleteSection(id) {
    const result = await pool.query(
      "DELETE FROM menu_sections WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Tạo Category mới
   */
  static async createCategory(data) {
    const { category_name, section_id } = data;

    const query = `
      INSERT INTO menu_categories (name, section_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [category_name, section_id]);

    return result.rows[0];
  }

  /**
   * Cập nhật Category
   */
  static async updateCategory(id, data) {
    const { category_name, section_id } = data;

    const updateFields = [];
    const updateParams = [];
    let idx = 1;

    if (category_name !== undefined) {
      updateFields.push(`name = $${idx++}`);
      updateParams.push(category_name);
    }
    if (section_id !== undefined) {
      updateFields.push(`section_id = $${idx++}`);
      updateParams.push(section_id);
    }

    if (updateFields.length === 0) {
      throw new Error("Không có trường nào để cập nhật");
    }

    const updateQuery = `UPDATE menu_categories SET ${updateFields.join(
      ", "
    )} WHERE id = $${idx} RETURNING *`;
    updateParams.push(id);

    const result = await pool.query(updateQuery, updateParams);
    return result.rowCount > 0 ? result.rows[0] : null;
  }

  /**
   * Xóa Category
   */
  static async deleteCategory(id) {
    const result = await pool.query(
      "DELETE FROM menu_categories WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = Menu;
