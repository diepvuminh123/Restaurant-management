const express = require("express");
const router = express.Router();
const MenuController = require("../controllers/menuController");
const validate  = require("../middlewares/validate");
const menuValidation = require("../validations/menuValidation");
const upload = require("../middlewares/upload");

/**
 * @swagger
 * /api/menu/sections:
 *   get:
 *     summary: Get all menu sections
 *     description: Retrieve all menu sections (Món chính, Đồ uống, Món tráng miệng, etc.)
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of menu sections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       section_name:
 *                         type: string
 *                       display_order:
 *                         type: integer
 */
router.get("/menu/sections", MenuController.getSections);
/**
 * UPLOAD /api/menus/upload/:id/image
 * Upload hình ảnh món ăn
 */
router.post(
  "/menus/upload/:id/image",
  upload.single('image'),
  MenuController.uploadMenuItemImage
);

/**
 * POST /api/menu/sections
 * Tạo phần menu mới
 */
router.post(
  "/menu/sections",
  validate(menuValidation.createSection),
  MenuController.createSection
);

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
 * PATCH /api/menu/sections/:id/order
 * Cập nhật thứ tự hiển thị của phần menu
 */
router.patch("/menu/sections/:id/order", MenuController.updateSectionOrder);

/**
 * DELETE /api/menu/sections/:id
 * Xóa phần menu
 */
router.delete("/menu/sections/:id", MenuController.deleteSection);

/**
 * GET /api/menu/categories
 * Lấy danh mục theo phần menu
 */
router.get("/menu/categories", MenuController.getCategories);

/**
 * POST /api/menu/categories
 * Tạo danh mục mới
 */
router.post(
  "/menu/categories",
  validate(menuValidation.createCategory),
  MenuController.createCategory
);

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
 * DELETE /api/menu/categories/:id
 * Xóa danh mục
 */
router.delete("/menu/categories/:id", MenuController.deleteCategory);

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Get menu items
 *     description: Retrieve list of menu items with filters, sorting, and pagination
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: section_id
 *         schema:
 *           type: integer
 *         description: Filter by section ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name_asc, name_desc, price_asc, price_desc, created_desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
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
