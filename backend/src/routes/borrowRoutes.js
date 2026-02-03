const express = require('express');
const { body } = require('express-validator');
const { borrowController } = require('../controllers');
const { auth, admin, validate } = require('../middleware');

const router = express.Router();

// Validation rules
const createBorrowValidation = [
  body('bookId')
    .notEmpty().withMessage('Vui lòng chọn sách')
    .isMongoId().withMessage('Sách không hợp lệ')
];

// User routes
router.post('/', auth, createBorrowValidation, validate, borrowController.createBorrow);
router.get('/my', auth, borrowController.getMyBorrows);
router.get('/current', auth, borrowController.getCurrentBorrows);
router.get('/stats', auth, admin, borrowController.getBorrowStats);
router.get('/:id', auth, borrowController.getBorrow);
router.put('/:id/extend', auth, borrowController.extendBorrow);

// Admin routes
router.get('/', auth, admin, borrowController.getAllBorrows);
router.put('/:id/return', auth, admin, borrowController.returnBook);
router.put('/:id/cancel', auth, admin, borrowController.cancelBorrow);

module.exports = router;
