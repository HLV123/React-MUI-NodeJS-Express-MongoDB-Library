const express = require('express');
const { body } = require('express-validator');
const { reviewController } = require('../controllers');
const { auth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating phải từ 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Nhận xét không được quá 1000 ký tự')
];

// Note: Most review routes are in bookRoutes (/api/books/:bookId/reviews)
// These are for managing individual reviews

router.put('/:id', auth, reviewValidation, validate, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
