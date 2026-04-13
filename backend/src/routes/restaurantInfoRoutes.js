const express = require("express");
const router = express.Router();
const RestaurantInfoController = require("../controllers/restaurantInfoController");
const validate = require("../middlewares/validate");
const validateParams = require("../middlewares/validateParams");
const restaurantInfoValidation = require("../validations/restaurantInfoValidation");

/**
 * @swagger
 * /api/restaurant-info:
 *   get:
 *     summary: Get restaurant information
 *     description: Retrieve current restaurant profile information used by frontend
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Restaurant information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantInfo'
 */
router.get("/restaurant-info", RestaurantInfoController.getRestaurantInfo);

/**
 * @swagger
 * /api/restaurant-info:
 *   post:
 *     summary: Create restaurant information
 *     description: Create singleton restaurant profile information
 *     tags: [Restaurant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *               slogan:
 *                 type: string
 *                 maxLength: 255
 *               logo_url:
 *                 type: string
 *               brand_image_url:
 *                 type: string
 *               address_line:
 *                 type: string
 *                 maxLength: 255
 *               contact_phone:
 *                 type: string
 *                 maxLength: 20
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *               opening_time:
 *                 type: string
 *                 example: "08:00"
 *               closing_time:
 *                 type: string
 *                 example: "22:00"
 *     responses:
 *       201:
 *         description: Create success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantInfo'
 *       400:
 *         description: Validation error
 */
router.post(
  "/restaurant-info",
  validate(restaurantInfoValidation.createRestaurantInfo),
  RestaurantInfoController.createRestaurantInfo
);

/**
 * @swagger
 * /api/restaurant-info/{id}:
 *   put:
 *     summary: Update restaurant information
 *     description: Update restaurant profile by id
 *     tags: [Restaurant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slogan:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               brand_image_url:
 *                 type: string
 *               address_line:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               opening_time:
 *                 type: string
 *                 example: "08:00"
 *               closing_time:
 *                 type: string
 *                 example: "22:00"
 *     responses:
 *       200:
 *         description: Update success
 *       400:
 *         description: Validation error
 */
router.put(
  "/restaurant-info/:id",
  validateParams(restaurantInfoValidation.restaurantInfoIdParamSchema),
  validate(restaurantInfoValidation.updateRestaurantInfo),
  RestaurantInfoController.updateRestaurantInfo
);

module.exports = router;
