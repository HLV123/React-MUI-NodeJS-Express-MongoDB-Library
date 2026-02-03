const { Cart, Book } = require('../models');
const { ApiError, ApiResponse, asyncHandler } = require('../utils');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.book',
      select: 'title author coverImage availableCopies rating category',
      populate: { path: 'category', select: 'name slug' }
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out unavailable books and format response
  const validItems = cart.items.filter(item => item.book && item.book.isActive !== false);

  ApiResponse.success(res, {
    cart: {
      items: validItems,
      itemCount: validItems.length
    }
  });
});

/**
 * @desc    Add book to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  // Check if book exists and is available
  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  if (book.availableCopies <= 0) {
    throw ApiError.badRequest('Sách hiện không còn bản nào để mượn');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if book already in cart
  if (cart.hasBook(bookId)) {
    throw ApiError.badRequest('Sách đã có trong giỏ');
  }

  // Check cart limit (max 5 items)
  if (cart.items.length >= 5) {
    throw ApiError.badRequest('Giỏ sách đã đầy (tối đa 5 cuốn)');
  }

  // Add book to cart
  cart.addBook(bookId);
  await cart.save();

  // Populate and return
  await cart.populate({
    path: 'items.book',
    select: 'title author coverImage availableCopies rating category',
    populate: { path: 'category', select: 'name slug' }
  });

  ApiResponse.success(res, {
    cart: {
      items: cart.items,
      itemCount: cart.items.length
    }
  }, 'Đã thêm vào giỏ sách');
});

/**
 * @desc    Remove book from cart
 * @route   DELETE /api/cart/:bookId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw ApiError.notFound('Giỏ sách trống');
  }

  if (!cart.hasBook(bookId)) {
    throw ApiError.badRequest('Sách không có trong giỏ');
  }

  cart.removeBook(bookId);
  await cart.save();

  await cart.populate({
    path: 'items.book',
    select: 'title author coverImage availableCopies rating category',
    populate: { path: 'category', select: 'name slug' }
  });

  ApiResponse.success(res, {
    cart: {
      items: cart.items,
      itemCount: cart.items.length
    }
  }, 'Đã xóa khỏi giỏ sách');
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.clearCart();
    await cart.save();
  }

  ApiResponse.success(res, {
    cart: {
      items: [],
      itemCount: 0
    }
  }, 'Đã xóa toàn bộ giỏ sách');
});

/**
 * @desc    Check if book is in cart
 * @route   GET /api/cart/check/:bookId
 * @access  Private
 */
const checkInCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  const inCart = cart ? cart.hasBook(bookId) : false;

  ApiResponse.success(res, { inCart });
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkInCart
};
