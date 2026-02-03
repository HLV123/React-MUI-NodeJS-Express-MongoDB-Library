const express = require('express');
const { body } = require('express-validator');
const { categoryController } = require('../controllers');
const { auth, admin, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tên danh mục')
    .isLength({ max: 50 }).withMessage('Tên danh mục không được quá 50 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Màu không hợp lệ'),
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Thứ tự phải là số dương')
];

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:idOrSlug', categoryController.getCategory);
router.get('/:idOrSlug/books', categoryController.getCategoryBooks);

// Admin routes
router.post('/', auth, admin, categoryValidation, validate, categoryController.createCategory);
router.put('/:id', auth, admin, categoryController.updateCategory);
router.delete('/:id', auth, admin, categoryController.deleteCategory);

module.exports = router;
