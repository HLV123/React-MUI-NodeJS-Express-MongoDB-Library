const express = require('express');
const { body } = require('express-validator');
const { userController } = require('../controllers');
const { auth, admin, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ không được quá 500 ký tự')
];

// User routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, updateProfileValidation, validate, userController.updateProfile);
router.get('/favorites', auth, userController.getFavorites);
router.post('/favorites/:bookId', auth, userController.addFavorite);
router.delete('/favorites/:bookId', auth, userController.removeFavorite);
router.get('/favorites/:bookId/check', auth, userController.checkFavorite);

// Admin routes
router.get('/stats', auth, admin, userController.getUserStats);
router.get('/', auth, admin, userController.getUsers);
router.get('/:id', auth, admin, userController.getUser);
router.put('/:id', auth, admin, userController.updateUser);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
