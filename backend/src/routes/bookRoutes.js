const express = require('express');
const { body } = require('express-validator');
const { bookController, reviewController } = require('../controllers');
const { auth, admin, optionalAuth, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tên sách')
    .isLength({ max: 200 }).withMessage('Tên sách không được quá 200 ký tự'),
  body('author')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tên tác giả')
    .isLength({ max: 100 }).withMessage('Tên tác giả không được quá 100 ký tự'),
  body('category')
    .notEmpty().withMessage('Vui lòng chọn danh mục')
    .isMongoId().withMessage('Danh mục không hợp lệ'),
  body('totalCopies')
    .notEmpty().withMessage('Vui lòng nhập số lượng sách')
    .isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
  body('isbn')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không được quá 2000 ký tự'),
  body('publishYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Năm xuất bản không hợp lệ'),
  body('pageCount')
    .optional()
    .isInt({ min: 1 }).withMessage('Số trang phải lớn hơn 0')
];

const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Vui lòng đánh giá')
    .isInt({ min: 1, max: 5 }).withMessage('Rating phải từ 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Nhận xét không được quá 1000 ký tự')
];

// Public routes
router.get('/', bookController.getBooks);
router.get('/featured', bookController.getFeaturedBooks);
router.get('/new-arrivals', bookController.getNewArrivals);
router.get('/popular', bookController.getPopularBooks);
router.get('/search', bookController.searchBooks);
router.get('/:idOrSlug', bookController.getBook);
router.get('/:id/related', bookController.getRelatedBooks);

// Review routes
router.get('/:bookId/reviews', reviewController.getBookReviews);
router.get('/:bookId/reviews/my', auth, reviewController.getMyReview);
router.post('/:bookId/reviews', auth, reviewValidation, validate, reviewController.createReview);

// Admin routes
router.get('/admin/all', auth, admin, bookController.getAllBooksAdmin);
router.post('/', auth, admin, bookValidation, validate, bookController.createBook);
router.put('/:id', auth, admin, bookController.updateBook);
router.delete('/:id', auth, admin, bookController.deleteBook);

module.exports = router;
