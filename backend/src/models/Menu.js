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
            search,
            price_min,
            price_max,
            sort_by = "id",
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
            whereConditions.push(
                `EXISTS (SELECT 1 FROM menu_item_categories mic WHERE mic.menu_item_id = mi.id AND mic.category_id = $${idx++})`
            );
            params.push(category_id);
        }

        if (available !== undefined) {
            whereConditions.push(`mi.available = $${idx++}`);
            params.push(available);
        }

        if (is_popular !== undefined) {
            whereConditions.push(`mi.is_popular = $${idx++}`);
            params.push(is_popular);
        }

        if (search !== undefined && search !== "") {
            whereConditions.push(
                `(mi.name ILIKE $${idx} OR mi.description_short ILIKE $${idx})` //ILike kệ chữ hoa và thường
            );
            params.push(`%${search}%`);
            idx++;
        }

        if (price_min !== undefined) {
            whereConditions.push(`mi.price >= $${idx++}`);
            params.push(price_min);
        }

        if (price_max !== undefined) {
            whereConditions.push(`mi.price <= $${idx++}`);
            params.push(price_max);
        }

        const whereClause =
            whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";
        console.log("WHERE CLAUSE:", whereClause, "PARAMS:", params);

        // Đếm tổng số items
        const countQuery = `SELECT COUNT(*) as total FROM menu_items mi ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total, 10) || 0;
        console.log("TOTAL ITEMS ABC:", total);
        console.log("countResult: ", countResult);
        


        
        const allowedSortFields = [
            "id",
            "name",
            "price",
            "rating_avg",
            "created_at",
        ];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "id";
        console.log("SORT FIELD:", sortField);
        const sortDir = sort_order && sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC"; //toUpperCase() -> vuminh -> VUMINH
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
                mi.image_cover,
                mi.rating_avg,
                mi.rating_count,
                mi.is_popular,
                mi.available
            FROM menu_items mi
            ${whereClause}
            ORDER BY mi.${sortField} ${sortDir}
            LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
        `;

        // truy vấn nè
        const itemsParams = [...params, limit, offset];
        const itemsResult = await pool.query(itemsQuery, itemsParams);

        return {
            items: itemsResult.rows.map((item) => ({
                ...item,
                price: item.price !== null ? parseFloat(item.price) : null,
                sale_price: item.sale_price !== null ? parseFloat(item.sale_price) : null,
                effective_price: item.effective_price !== null ? parseFloat(item.effective_price) : null,
                rating_avg: item.rating_avg !== null ? parseFloat(item.rating_avg) : 0,
                is_popular: Boolean(item.is_popular),
                available: Boolean(item.available),
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
     * Lấy facets để filter (khoảng giá, danh mục)
     */
    static async getFacets(sectionId) {
        const whereClause = sectionId !== undefined ? "WHERE mi.section_id = $1" : "";
        const params = sectionId !== undefined ? [sectionId] : [];

        const priceQuery = `
            SELECT 
                MIN(price) as price_min, 
                MAX(price) as price_max
            FROM menu_items mi
            ${whereClause}
        `;
        const priceResult = await pool.query(priceQuery, params);

        const categoriesQuery = `
            SELECT 
                mc.id,
                mc.name,
                COUNT(DISTINCT mic.menu_item_id) as count
            FROM menu_categories mc
            LEFT JOIN menu_item_categories mic ON mc.id = mic.category_id
            LEFT JOIN menu_items mi ON mic.menu_item_id = mi.id
            ${whereClause}
            GROUP BY mc.id, mc.name
            HAVING COUNT(DISTINCT mic.menu_item_id) > 0
            ORDER BY mc.name
        `;
        const categoriesResult = await pool.query(categoriesQuery, params);

        return {
            price_min: priceResult.rows[0].price_min !== null ? parseFloat(priceResult.rows[0].price_min) : 0,
            price_max: priceResult.rows[0].price_max !== null ? parseFloat(priceResult.rows[0].price_max) : 0,
            categories: categoriesResult.rows.map((cat) => ({
                id: cat.id,
                name: cat.name,
                count: parseInt(cat.count, 10),
            })),
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
                mi.images,
                mi.price,
                mi.sale_price,
                mi.section_id,
                mi.rating_avg,
                mi.rating_count,
                mi.available,
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
            sale_price = null,
            section_id = 1,
            description_short = null,
        } = data;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const insertQuery = `
                INSERT INTO menu_items 
                    (name, price, sale_price, description_short, description_full, image_cover, images, section_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;

            const images = image ? JSON.stringify([image]) : null;
            const insertResult = await client.query(insertQuery, [
                name,
                price,
                sale_price,
                description_short || description,
                description,
                image,
                images,
                section_id,
            ]);

            const menuItemId = insertResult.rows[0].id;

            if (category_ids && category_ids.length > 0) {
                const insertCatQuery = "INSERT INTO menu_item_categories (menu_item_id, category_id) VALUES ($1, $2)";
                for (const catId of category_ids) {
                    await client.query(insertCatQuery, [menuItemId, catId]);
                }
            }

            await client.query("COMMIT");
            return menuItemId;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
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
            image,
            section_id,
            category_ids,
            available,
        } = data;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

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
            if (image !== undefined) {
                updateFields.push(`image_cover = $${idx++}`);
                updateParams.push(image);
                updateFields.push(`images = $${idx++}`);
                updateParams.push(JSON.stringify([image]));
            }
            if (section_id !== undefined) {
                updateFields.push(`section_id = $${idx++}`);
                updateParams.push(section_id);
            }
            if (available !== undefined) {
                updateFields.push(`available = $${idx++}`);
                updateParams.push(available);
            }

            if (updateFields.length > 0) {
                const updateQuery = `UPDATE menu_items SET ${updateFields.join(", ")} WHERE id = $${idx}`;
                updateParams.push(id);
                await client.query(updateQuery, updateParams);
            }

            if (category_ids !== undefined) {
                await client.query(
                    "DELETE FROM menu_item_categories WHERE menu_item_id = $1",
                    [id]
                );

                if (category_ids && category_ids.length > 0) {
                    const insertCatQuery = "INSERT INTO menu_item_categories (menu_item_id, category_id) VALUES ($1, $2)";
                    for (const catId of category_ids) {
                        await client.query(insertCatQuery, [id, catId]);
                    }
                }
            }

            await client.query("COMMIT");
            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
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
        const result = await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
        return result.rowCount > 0;
    }
}

module.exports = Menu;
