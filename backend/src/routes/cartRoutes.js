const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  addItemSchema,
  updateItemSchema,
  migrateCartSchema
} = require('../validations/cartValidation');

router.get('/cart', optionalAuth, CartController.getCart);

router.post('/cart/items', optionalAuth, validate(addItemSchema), CartController.addItem);

router.put('/cart/items/:id', optionalAuth, validate(updateItemSchema), CartController.updateItem);

router.delete('/cart/items/:id', optionalAuth, CartController.removeItem);

router.delete('/cart', optionalAuth, CartController.clearCart);

router.post('/cart/migrate', validate(migrateCartSchema), CartController.migrateCart);

router.get('/cart/validate', optionalAuth, CartController.validateCart);

module.exports = router;
