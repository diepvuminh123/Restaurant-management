const Menu = require("../models/Menu");

class MenuService {
  /**
   * Lấy tất cả phần menu
   */
  static async getSections() {
    return await Menu.getAllSections();
  }

  /**
   * Lấy danh mục theo section
   */
  static async getCategoriesBySection(sectionId) {
    if (!sectionId) {
      throw new Error("Section ID là bắt buộc");
    }
    return await Menu.getCategoriesBySection(sectionId);
  }

  /**
   * Lấy danh sách món ăn với filter
   */
  static async getMenuItems(filters) {
    return await Menu.getAllMenuItems(filters);
  }

  /**
   * Lấy facets để filter
   */
  static async getFacets(sectionId) {
    return await Menu.getFacets(sectionId);
  }

  /**
   * Lấy thông tin món ăn theo ID
   */
  static async getMenuItemById(id) {
    if (!id) {
      throw new Error("ID món ăn là bắt buộc");
    }

    const item = await Menu.getMenuItemById(id);
    if (!item) {
      throw new Error("Món ăn không tồn tại");
    }

    return item;
  }

  /**
   * Tạo món ăn mới
   */
  static async createMenuItem(data) {
    const { name, price } = data;

    if (!name || !price) {
      throw new Error("Tên và giá là bắt buộc");
    }

    if (price <= 0) {
      throw new Error("Giá phải lớn hơn 0");
    }

    const menuItemId = await Menu.createMenuItem(data);
    return { id: menuItemId };
  }

  /**
   * Cập nhật món ăn
   */
  static async updateMenuItem(id, data) {
    if (!id) {
      throw new Error("ID món ăn là bắt buộc");
    }

    // Kiểm tra món ăn có tồn tại không
    const existingItem = await Menu.getMenuItemById(id);
    if (!existingItem) {
      throw new Error("Món ăn không tồn tại");
    }

    // Validate giá nếu được cung cấp
    if (data.price !== undefined && data.price <= 0) {
      throw new Error("Giá phải lớn hơn 0");
    }

    await Menu.updateMenuItem(id, data);
  }

  /**
   * Cập nhật trạng thái còn hàng
   */
  static async updateAvailability(id, available) {
    if (!id) {
      throw new Error("ID món ăn là bắt buộc");
    }

    if (available === undefined) {
      throw new Error("Trạng thái còn hàng là bắt buộc");
    }

    const updated = await Menu.updateAvailability(id, available);
    if (!updated) {
      throw new Error("Món ăn không tồn tại");
    }
  }

  /**
   * Xóa món ăn
   */
  static async deleteMenuItem(id) {
    if (!id) {
      throw new Error("ID món ăn là bắt buộc");
    }

    const deleted = await Menu.deleteMenuItem(id);
    if (!deleted) {
      throw new Error("Món ăn không tồn tại");
    }
  }
}

module.exports = MenuService;
