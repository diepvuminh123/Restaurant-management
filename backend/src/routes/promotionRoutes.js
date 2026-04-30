const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotionController');
const { requireAuth, requireRole, optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const validateQuery = require('../middlewares/validateQuery');
const validateParams = require('../middlewares/validateParams');
const {
  createPromotionSchema,
  updatePromotionSchema,
  validatePromotionSchema,
  getPromotionsQuerySchema,
  promotionIdParamSchema
} = require('../validations/promotionValidation');

// Public route for checkout validation
router.post(
  '/promotions/validate',
  optionalAuth,
  validate(validatePromotionSchema),
  PromotionController.validatePromotion
);

// Admin routes
router.get(
  '/promotions',
  requireRole('admin'),
  validateQuery(getPromotionsQuerySchema),
  PromotionController.listPromotions
);

router.post(
  '/promotions',
  requireRole('admin'),
  validate(createPromotionSchema),
  PromotionController.createPromotion
);

router.get(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  PromotionController.getPromotion
);

router.put(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  validate(updatePromotionSchema),
  PromotionController.updatePromotion
);

router.delete(
  '/promotions/:id',
  requireRole('admin'),
  validateParams(promotionIdParamSchema),
  PromotionController.deletePromotion
);

module.exports = router;
