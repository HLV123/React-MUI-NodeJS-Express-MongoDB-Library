const { Review, Book, Borrow } = require('../models');
const { ApiError, ApiResponse, asyncHandler, calculatePagination } = require('../utils');

/**
 * @desc    Get reviews for a book
 * @route   GET /api/books/:bookId/reviews
 * @access  Public
 */
const getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const book = await Book.findById(bookId);
  if (!book) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  const filter = { book: bookId, isApproved: true };
  const total = await Review.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort(sortObj)
    .skip(pagination.skip)
    .limit(pagination.limit);

  // Calculate rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { book: book._id, isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingStats.forEach(r => { ratingDistribution[r._id] = r.count; });

  ApiResponse.paginated(res, {
    data: {
      reviews,
      stats: {
        averageRating: book.rating,
        totalReviews: book.reviewCount,
        ratingDistribution
      }
    },
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

/**
 * @desc    Create review for a book
 * @route   POST /api/books/:bookId/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  // Check if user already reviewed this book
  const existingReview = await Review.findOne({ user: userId, book: bookId });
  if (existingReview) {
    throw ApiError.badRequest('Bạn đã đánh giá sách này rồi');
  }

  // Optional: Check if user has borrowed this book
  const hasBorrowed = await Borrow.findOne({
    user: userId,
    book: bookId,
    status: { $in: ['borrowed', 'returned'] }
  });

  if (!hasBorrowed) {
    throw ApiError.badRequest('Bạn cần mượn sách này trước khi đánh giá');
  }

  const review = await Review.create({
    user: userId,
    book: bookId,
    rating,
    comment
  });

  await review.populate('user', 'name avatar');

  ApiResponse.created(res, { review }, 'Đánh giá thành công');
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  let review = await Review.findById(id);
  
  if (!review) {
    throw ApiError.notFound('Không tìm thấy đánh giá');
  }

  // Check ownership
  if (review.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('Bạn không có quyền sửa đánh giá này');
  }

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  
  await review.save();
  await review.populate('user', 'name avatar');

  ApiResponse.success(res, { review }, 'Cập nhật đánh giá thành công');
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  const review = await Review.findById(id);
  
  if (!review) {
    throw ApiError.notFound('Không tìm thấy đánh giá');
  }

  // Check ownership or admin
  if (!isAdmin && review.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('Bạn không có quyền xóa đánh giá này');
  }

  await Review.findByIdAndDelete(id);

  ApiResponse.success(res, null, 'Xóa đánh giá thành công');
});

/**
 * @desc    Get user's review for a book
 * @route   GET /api/books/:bookId/reviews/my
 * @access  Private
 */
const getMyReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOne({ user: userId, book: bookId })
    .populate('user', 'name avatar');

  ApiResponse.success(res, { review });
});

module.exports = {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview
};
