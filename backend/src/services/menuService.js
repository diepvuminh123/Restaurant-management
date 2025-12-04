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

  /**
   * Tạo Section mới
   */
  static async createSection(data) {
    if (!data.section_name) {
      throw new Error("Tên phần menu là bắt buộc");
    }
    const existSort_order = await Menu.checkOrderSecion(data.display_order);
    if (existSort_order) {
      throw new Error("vui lòng chọn thứ tự hiển thị khác vì đã tồn tại");
    }

    const section = await Menu.createSection(data);
    return section;
  }

  /**
   * Cập nhật Section
   */
  static async updateSection(id, data) {
    if (!id) {
      throw new Error("ID phần menu là bắt buộc");
    }

    const updated = await Menu.updateSection(id, data);
    if (!updated) {
      throw new Error("Phần menu không tồn tại");
    }

    return updated;
  }

  /**
   * Xóa Section
   */
  static async deleteSection(id) {
    if (!id) {
      throw new Error("ID phần menu là bắt buộc");
    }

    const deleted = await Menu.deleteSection(id);
    if (!deleted) {
      throw new Error("Phần menu không tồn tại");
    }
  }

  /**
   * Tạo Category mới
   */
  static async createCategory(data) {
    if (!data.category_name || !data.section_id) {
      throw new Error("Tên danh mục và ID phần menu là bắt buộc");
    }

    const category = await Menu.createCategory(data);
    return category;
  }

  /**
   * Cập nhật Category
   */
  static async updateCategory(id, data) {
    if (!id) {
      throw new Error("ID danh mục là bắt buộc");
    }

    const updated = await Menu.updateCategory(id, data);
    if (!updated) {
      throw new Error("Danh mục không tồn tại");
    }

    return updated;
  }

  /**
   * Xóa Category
   */
  static async deleteCategory(id) {
    if (!id) {
      throw new Error("ID danh mục là bắt buộc");
    }

    const deleted = await Menu.deleteCategory(id);
    if (!deleted) {
      throw new Error("Danh mục không tồn tại");
    }
  }

  static async updateMenuItemImage(id, imageUrl) {
  if (!id) throw new Error("ID món ăn là bắt buộc");

  const updated = await Menu.updateMenuItem(id, { images: imageUrl });

  if (!updated) throw new Error("Món ăn không tồn tại");

  return updated;
}

}

module.exports = MenuService;
