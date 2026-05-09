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
/**
 * @swagger
 * /api/menus/upload/{id}/image:
 *   post:
 *     summary: Upload menu item image
 *     description: Upload an image file for a menu item.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Image file is required
 *       500:
 *         description: Server error
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
/**
 * @swagger
 * /api/menu/sections:
 *   post:
 *     summary: Create menu section
 *     description: Create a new menu section.
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section_name
 *             properties:
 *               section_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Main dishes
 *               display_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Section created successfully
 *       400:
 *         description: Invalid payload
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
/**
 * @swagger
 * /api/menu/sections/{id}:
 *   put:
 *     summary: Update menu section
 *     description: Update section name or display order.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Section not found
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
/**
 * @swagger
 * /api/menu/sections/{id}/order:
 *   patch:
 *     summary: Update section display order
 *     description: Update the display order for a menu section.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sort_order
 *             properties:
 *               sort_order:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Section order updated successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Section not found
 */
router.patch("/menu/sections/:id/order", MenuController.updateSectionOrder);

/**
 * DELETE /api/menu/sections/:id
 * Xóa phần menu
 */
/**
 * @swagger
 * /api/menu/sections/{id}:
 *   delete:
 *     summary: Delete menu section
 *     description: Delete a menu section by ID.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       404:
 *         description: Section not found
 *       500:
 *         description: Server error
 */
router.delete("/menu/sections/:id", MenuController.deleteSection);

/**
 * GET /api/menu/categories
 * Lấy danh mục theo phần menu
 */
/**
 * @swagger
 * /api/menu/categories:
 *   get:
 *     summary: Get menu categories by section
 *     description: Retrieve categories that belong to a menu section.
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: section_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       400:
 *         description: section_id is required
 *       500:
 *         description: Server error
 */
router.get("/menu/categories", MenuController.getCategories);

/**
 * POST /api/menu/categories
 * Tạo danh mục mới
 */
/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Create menu category
 *     description: Create a new category inside a menu section.
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *               - section_id
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Noodles
 *               section_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid payload
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
/**
 * @swagger
 * /api/menu/categories/{id}:
 *   put:
 *     summary: Update menu category
 *     description: Update category name or its section.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               section_id:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Category not found
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
/**
 * @swagger
 * /api/menu/categories/{id}:
 *   delete:
 *     summary: Delete menu category
 *     description: Delete a menu category by ID.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
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
/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     description: Retrieve detailed information for one menu item.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
router.get("/menus/:id", MenuController.getMenuItemById);

/**
 * POST /api/menus
 * Tạo món ăn mới
 */
/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create menu item
 *     description: Create a new menu item.
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Beef Pho
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 85000
 *               sale_price:
 *                 type: number
 *                 nullable: true
 *                 example: 75000
 *               description:
 *                 type: string
 *               description_short:
 *                 type: string
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *               image:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               section_id:
 *                 type: integer
 *                 minimum: 1
 *               available:
 *                 type: boolean
 *               is_popular:
 *                 type: boolean
 *               is_new:
 *                 type: boolean
 *               is_soldout:
 *                 type: boolean
 *               prep_time:
 *                 type: integer
 *                 minimum: 1
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Invalid payload
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
/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update menu item
 *     description: Update an existing menu item.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *               sale_price:
 *                 type: number
 *                 nullable: true
 *               description:
 *                 type: string
 *               description_short:
 *                 type: string
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *               image:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               section_id:
 *                 type: integer
 *                 minimum: 1
 *               available:
 *                 type: boolean
 *               is_popular:
 *                 type: boolean
 *               is_new:
 *                 type: boolean
 *               is_soldout:
 *                 type: boolean
 *               prep_time:
 *                 type: integer
 *                 minimum: 1
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Menu item not found
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
/**
 * @swagger
 * /api/menus/{id}/availability:
 *   patch:
 *     summary: Update menu item availability
 *     description: Update whether a menu item is available.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - available
 *             properties:
 *               available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
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
/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete menu item
 *     description: Delete a menu item by ID.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
router.delete("/menus/:id", MenuController.deleteMenuItem);




module.exports = router;
