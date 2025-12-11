const MenuService = require("../services/menuService");

class MenuController {
  /**
   * GET /api/menu/sections
   * Lấy tất cả các phần menu
   */
  static async getSections(req, res) {
    try {
      const sections = await MenuService.getSections();
      res.status(200).json({
        success: true,
        data: sections,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/menu/categories
   * Lấy danh mục theo phần menu
   */
  static async getCategories(req, res) {
    try {
      const { section_id } = req.query;

      if (!section_id) {
        return res.status(400).json({
          success: false,
          message: "section_id là bắt buộc",
        });
      }

      const categories = await MenuService.getCategoriesBySection(section_id);
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/menus
   * Lấy danh sách món ăn với filter, sort và phân trang
   */
  static async getMenuItems(req, res) {
    try {
      const filters = {
        section_id: req.query.section_id,
        category_id: req.query.category_id
          ? req.query.category_id.split(",").map(Number)
          : undefined,
        available:
          req.query.available !== undefined
            ? req.query.available === "true"
            : undefined,
        is_popular:
          req.query.is_popular !== undefined
            ? req.query.is_popular === "true"
            : undefined,
        is_new:
          req.query.is_new !== undefined
            ? req.query.is_new === "true"
            : undefined,
        is_soldout:
          req.query.is_soldout !== undefined
            ? req.query.is_soldout === "true"
            : undefined,
        search: req.query.search,
        price_min: req.query.price_min
          ? parseFloat(req.query.price_min)
          : undefined,
        price_max: req.query.price_max
          ? parseFloat(req.query.price_max)
          : undefined,
        sort_by: req.query.sort_by || "id",
        sort_order: req.query.sort_order || "ASC",
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
      };

      const result = await MenuService.getMenuItems(filters);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/menus/facets
   * Lấy thông tin facets để filter (giá min/max, danh mục)
   */
  static async getFacets(req, res) {
    try {
      const { section_id } = req.query;
      const facets = await MenuService.getFacets(section_id);
      res.json({
        success: true,
        data: facets,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/menus/:id
   * Lấy thông tin chi tiết món ăn
   */
  static async getMenuItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await MenuService.getMenuItemById(id);
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      if (error.message === "Món ăn không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });

      console.log("Test");
    }
  }

  /**
   * POST /api/menus
   * Tạo món ăn mới
   */
  static async createMenuItem(req, res) {
    try {
      const result = await MenuService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo món ăn thành công",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/menus/:id
   * Cập nhật thông tin món ăn
   */
  static async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      await MenuService.updateMenuItem(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật món ăn thành công",
      });
    } catch (error) {
      if (error.message === "Món ăn không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/menus/:id/availability
   * Cập nhật trạng thái còn hàng
   */
  static async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { available } = req.body;

      if (available === undefined) {
        return res.status(400).json({
          success: false,
          message: "Trường available là bắt buộc",
        });
      }

      await MenuService.updateAvailability(id, available);
      res.json({
        success: true,
        message: "Cập nhật trạng thái thành công",
      });
    } catch (error) {
      if (error.message === "Món ăn không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/menus/:id
   * Xóa món ăn
   */
  static async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;
      await MenuService.deleteMenuItem(id);
      res.json({
        success: true,
        message: "Xóa món ăn thành công",
      });
    } catch (error) {
      if (error.message === "Món ăn không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/menu/sections/:id
   * Cập nhật Section
   */
  static async updateSection(req, res) {
    try {
      const { id } = req.params;
      const updated = await MenuService.updateSection(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật phần menu thành công",
        data: updated,
      });
    } catch (error) {
      if (error.message === "Phần menu không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/menu/sections/:id/order
   * Cập nhật thứ tự hiển thị của Section
   */
  static async updateSectionOrder(req, res) {
    try {
      const { id } = req.params;
      const { sort_order } = req.body;

      if (!sort_order || isNaN(parseInt(sort_order))) {
        return res.status(400).json({
          success: false,
          message: "sort_order phải là một số hợp lệ",
        });
      }

      const updated = await MenuService.updateSectionOrder(id, parseInt(sort_order));
      res.json({
        success: true,
        message: "Cập nhật thứ tự hiển thị thành công",
        data: updated,
      });
    } catch (error) {
      if (error.message === "Phần menu không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/menu/sections
   * Tạo Section mới
   */
  static async createSection(req, res) {
    try {
      const section = await MenuService.createSection(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo phần menu thành công",
        data: section,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/menu/sections/:id
   * Xóa Section
   */
  static async deleteSection(req, res) {
    try {
      const { id } = req.params;
      await MenuService.deleteSection(id);
      res.json({
        success: true,
        message: "Xóa phần menu thành công",
      });
    } catch (error) {
      if (error.message === "Phần menu không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/menu/categories/:id
   * Cập nhật Category
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updated = await MenuService.updateCategory(id, req.body);
      res.json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updated,
      });
    } catch (error) {
      if (error.message === "Danh mục không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/menu/categories
   * Tạo Category mới
   */
  static async createCategory(req, res) {
    try {
      const category = await MenuService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/menu/categories/:id
   * Xóa Category
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await MenuService.deleteCategory(id);
      res.json({
        success: true,
        message: "Xóa danh mục thành công",
      });
    } catch (error) {
      if (error.message === "Danh mục không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  static async uploadMenuItemImage(req, res) {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng tải lên hình ảnh",
        });
      }
      const imageUrl = `/images/upload/${req.file.filename}`;
      console.log("FILE:", req.file);


      await MenuService.updateMenuItemImage(id, imageUrl);
      console.log("RETURNING SUCCESS!");


      
      res.json({
        success: true,
        message: "Tải lên hình ảnh thành công",
        image: imageUrl,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = MenuController;
