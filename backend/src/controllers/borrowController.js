const { Borrow, Book, User, Notification } = require('../models');
const { ApiError, ApiResponse, asyncHandler } = require('../utils');
const config = require('../config');

// @desc    Create new borrow request
// @route   POST /api/borrows
// @access  Private
const createBorrow = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  // Check if book exists and is available
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, 'Không tìm thấy sách');
  }

  if (!book.isActive) {
    throw new ApiError(400, 'Sách này hiện không khả dụng');
  }

  if (book.availableCopies <= 0) {
    throw new ApiError(400, 'Sách đã được mượn hết');
  }

  // Check if user already borrowed this book (and not returned yet)
  const existingBorrow = await Borrow.findOne({
    user: req.user._id,
    book: bookId,
    status: { $in: ['pending', 'borrowed', 'overdue'] }
  });

  if (existingBorrow) {
    throw new ApiError(400, 'Bạn đang mượn cuốn sách này');
  }

  // Create borrow record
  const borrow = await Borrow.create({
    user: req.user._id,
    book: bookId,
    status: 'borrowed'
  });

  // Update book available copies
  book.availableCopies -= 1;
  book.borrowCount += 1;
  await book.save();

  // Create notification
  await Notification.create({
    user: req.user._id,
    type: 'borrow_confirmed',
    title: 'Mượn sách thành công',
    message: `Bạn đã mượn thành công sách "${book.title}". Hạn trả: ${new Date(borrow.dueDate).toLocaleDateString('vi-VN')}`,
    data: { borrowId: borrow._id, bookId: book._id }
  });

  const populatedBorrow = await Borrow.findById(borrow._id)
    .populate('book', 'title author coverImage')
    .populate('user', 'name email');

  res.status(201).json(
    new ApiResponse(201, populatedBorrow, 'Mượn sách thành công')
  );
});

// @desc    Get my borrows
// @route   GET /api/borrows/my
// @access  Private
const getMyBorrows = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: {
      path: 'book',
      select: 'title author coverImage category'
    }
  };

  const borrows = await Borrow.find(query)
    .populate(options.populate)
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const total = await Borrow.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      borrows,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    })
  );
});

// @desc    Get current borrows (borrowed + overdue)
// @route   GET /api/borrows/current
// @access  Private
const getCurrentBorrows = asyncHandler(async (req, res) => {
  const borrows = await Borrow.find({
    user: req.user._id,
    status: { $in: ['borrowed', 'overdue'] }
  })
    .populate('book', 'title author coverImage')
    .sort({ dueDate: 1 });

  res.json(new ApiResponse(200, borrows));
});

// @desc    Get single borrow
// @route   GET /api/borrows/:id
// @access  Private
const getBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id)
    .populate('book')
    .populate('user', 'name email phone');

  if (!borrow) {
    throw new ApiError(404, 'Không tìm thấy phiếu mượn');
  }

  // Check if user owns this borrow or is admin
  if (borrow.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Bạn không có quyền xem phiếu mượn này');
  }

  res.json(new ApiResponse(200, borrow));
});

// @desc    Extend borrow
// @route   PUT /api/borrows/:id/extend
// @access  Private
const extendBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);

  if (!borrow) {
    throw new ApiError(404, 'Không tìm thấy phiếu mượn');
  }

  // Check if user owns this borrow
  if (borrow.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Bạn không có quyền gia hạn phiếu mượn này');
  }

  if (borrow.status !== 'borrowed') {
    throw new ApiError(400, 'Chỉ có thể gia hạn sách đang mượn');
  }

  if (borrow.extendCount >= config.borrow.maxExtensions) {
    throw new ApiError(400, `Chỉ được gia hạn tối đa ${config.borrow.maxExtensions} lần`);
  }

  // Extend due date
  const newDueDate = new Date(borrow.dueDate);
  newDueDate.setDate(newDueDate.getDate() + config.borrow.borrowDurationDays);
  
  borrow.dueDate = newDueDate;
  borrow.extendCount += 1;
  await borrow.save();

  res.json(new ApiResponse(200, borrow, 'Gia hạn thành công'));
});

// @desc    Get all borrows (Admin)
// @route   GET /api/borrows
// @access  Private/Admin
const getAllBorrows = asyncHandler(async (req, res) => {
  const { status, userId, bookId, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (userId) query.user = userId;
  if (bookId) query.book = bookId;

  const borrows = await Borrow.find(query)
    .populate('user', 'name email')
    .populate('book', 'title author coverImage')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Borrow.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      borrows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// @desc    Return book (Admin)
// @route   PUT /api/borrows/:id/return
// @access  Private/Admin
const returnBook = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book');

  if (!borrow) {
    throw new ApiError(404, 'Không tìm thấy phiếu mượn');
  }

  if (borrow.status === 'returned') {
    throw new ApiError(400, 'Sách đã được trả rồi');
  }

  if (borrow.status === 'cancelled') {
    throw new ApiError(400, 'Phiếu mượn đã bị hủy');
  }

  // Update borrow status
  borrow.status = 'returned';
  borrow.returnDate = new Date();
  
  // Calculate fine if overdue
  if (borrow.isOverdue) {
    borrow.fine = borrow.calculateFine();
  }

  await borrow.save();

  // Update book available copies
  const book = await Book.findById(borrow.book._id);
  if (book) {
    book.availableCopies += 1;
    await book.save();
  }

  // Create notification
  await Notification.create({
    user: borrow.user,
    type: 'return_confirmed',
    title: 'Trả sách thành công',
    message: `Sách "${borrow.bookSnapshot.title}" đã được xác nhận trả.${borrow.fine > 0 ? ` Phí phạt: ${borrow.fine.toLocaleString('vi-VN')}đ` : ''}`,
    data: { borrowId: borrow._id }
  });

  res.json(new ApiResponse(200, borrow, 'Xác nhận trả sách thành công'));
});

// @desc    Cancel borrow (Admin)
// @route   PUT /api/borrows/:id/cancel
// @access  Private/Admin
const cancelBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);

  if (!borrow) {
    throw new ApiError(404, 'Không tìm thấy phiếu mượn');
  }

  if (borrow.status === 'returned') {
    throw new ApiError(400, 'Không thể hủy phiếu mượn đã trả');
  }

  if (borrow.status === 'cancelled') {
    throw new ApiError(400, 'Phiếu mượn đã bị hủy');
  }

  // Update borrow status
  borrow.status = 'cancelled';
  await borrow.save();

  // Return book copy if borrowed
  if (borrow.status === 'borrowed' || borrow.status === 'overdue') {
    const book = await Book.findById(borrow.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
  }

  res.json(new ApiResponse(200, borrow, 'Đã hủy phiếu mượn'));
});

// @desc    Get borrow statistics (Admin)
// @route   GET /api/borrows/stats
// @access  Private/Admin
const getBorrowStats = asyncHandler(async (req, res) => {
  const stats = await Borrow.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalBorrows = await Borrow.countDocuments();
  const overdueBorrows = await Borrow.countDocuments({ status: 'overdue' });
  const activeBorrows = await Borrow.countDocuments({ status: 'borrowed' });

  res.json(
    new ApiResponse(200, {
      total: totalBorrows,
      active: activeBorrows,
      overdue: overdueBorrows,
      byStatus: stats
    })
  );
});

module.exports = {
  createBorrow,
  getMyBorrows,
  getCurrentBorrows,
  getBorrow,
  extendBorrow,
  getAllBorrows,
  returnBook,
  cancelBorrow,
  getBorrowStats
};
