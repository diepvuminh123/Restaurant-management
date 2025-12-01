const express = require("express");
const router = express.Router();
const MenuController = require("../controllers/menuController");
const validate  = require("../middlewares/validate");
const menuValidation = require("../validations/menuValidation");

/**
 * GET /api/menu/sections
 * Lấy tất cả các phần menu (Món chính, Đồ uống, Món tráng miệng)
 */
router.get("/menu/sections", MenuController.getSections);

/**
 * PUT /api/menu/sections/:id
 * Cập nhật phần menu
 */
router.put(
  "/menu/sections/:id",
  validate(menuValidation.updateSection),
  MenuController.updateSection
);

/**
 * GET /api/menu/categories
 * Lấy danh mục theo phần menu
 */
router.get("/menu/categories", MenuController.getCategories);

/**
 * PUT /api/menu/categories/:id
 * Cập nhật danh mục
 */
router.put(
  "/menu/categories/:id",
  validate(menuValidation.updateCategory),
  MenuController.updateCategory
);

/**
 * GET /api/menus
 * Lấy danh sách món ăn với filter, sort và phân trang
 */
router.get("/menus", MenuController.getMenuItems);

// /**
//  * GET /api/menus/facets
//  * Lấy facets để filter (giá min/max, danh mục)
//  */
// router.get("/menus/facets", MenuController.getFacets);

/**
 * GET /api/menus/:id
 * Lấy thông tin chi tiết món ăn theo ID
 */
router.get("/menus/:id", MenuController.getMenuItemById);

/**
 * POST /api/menus
 * Tạo món ăn mới
 */
router.post(
  "/menus",
  validate(menuValidation.createMenuItem),
  MenuController.createMenuItem
);

/**
 * PUT /api/menus/:id
 * Cập nhật thông tin món ăn
 */
router.put(
  "/menus/:id",
  validate(menuValidation.updateMenuItem),
  MenuController.updateMenuItem
);

/**
 * PATCH /api/menus/:id/availability
 * Cập nhật trạng thái còn hàng
 */
router.patch(
  "/menus/:id/availability",
  validate(menuValidation.updateAvailability),
  MenuController.updateAvailability
);

/**
 * DELETE /api/menus/:id
 * Xóa món ăn
 */
router.delete("/menus/:id", MenuController.deleteMenuItem);

module.exports = router;
