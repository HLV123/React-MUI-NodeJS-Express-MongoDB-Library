const express = require('express');
const { body } = require('express-validator');
const { cartController } = require('../controllers');
const { auth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('bookId')
    .notEmpty().withMessage('Vui lòng chọn sách')
    .isMongoId().withMessage('Sách không hợp lệ')
];

// All routes require authentication
router.use(auth);

router.get('/', cartController.getCart);
router.post('/', addToCartValidation, validate, cartController.addToCart);
router.delete('/:bookId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.get('/check/:bookId', cartController.checkInCart);

module.exports = router;
