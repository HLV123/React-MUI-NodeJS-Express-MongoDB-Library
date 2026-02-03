const { User, Borrow, Book } = require('../models');
const { ApiError, ApiResponse, asyncHandler, calculatePagination } = require('../utils');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get user stats
  const borrowedCount = await Borrow.countDocuments({ 
    user: req.user._id, 
    status: { $in: ['borrowed', 'overdue'] } 
  });
  const returnedCount = await Borrow.countDocuments({ 
    user: req.user._id, 
    status: 'returned' 
  });
  const favoriteCount = user.favoriteBooks?.length || 0;

  ApiResponse.success(res, {
    user: user.toPublicJSON(),
    stats: {
      borrowedCount,
      returnedCount,
      favoriteCount,
      points: user.points
    }
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (avatar) user.avatar = avatar;

  await user.save();

  ApiResponse.success(res, { user: user.toPublicJSON() }, 'Cập nhật thông tin thành công');
});

/**
 * @desc    Get user's favorite books
 * @route   GET /api/users/favorites
 * @access  Private
 */
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'favoriteBooks',
      select: 'title author coverImage rating reviewCount availableCopies category',
      populate: { path: 'category', select: 'name slug' }
    });

  ApiResponse.success(res, { favorites: user.favoriteBooks || [] });
});

/**
 * @desc    Add book to favorites
 * @route   POST /api/users/favorites/:bookId
 * @access  Private
 */
const addFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  const user = await User.findById(req.user._id);

  if (user.favoriteBooks.includes(bookId)) {
    throw ApiError.badRequest('Sách đã có trong danh sách yêu thích');
  }

  user.favoriteBooks.push(bookId);
  await user.save();

  ApiResponse.success(res, { message: 'Đã thêm vào yêu thích' });
});

/**
 * @desc    Remove book from favorites
 * @route   DELETE /api/users/favorites/:bookId
 * @access  Private
 */
const removeFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const user = await User.findById(req.user._id);

  const index = user.favoriteBooks.indexOf(bookId);
  if (index === -1) {
    throw ApiError.badRequest('Sách không có trong danh sách yêu thích');
  }

  user.favoriteBooks.splice(index, 1);
  await user.save();

  ApiResponse.success(res, { message: 'Đã xóa khỏi yêu thích' });
});

/**
 * @desc    Check if book is in favorites
 * @route   GET /api/users/favorites/:bookId/check
 * @access  Private
 */
const checkFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const user = await User.findById(req.user._id);
  const isFavorite = user.favoriteBooks.includes(bookId);
  
  ApiResponse.success(res, { isFavorite });
});

// ============================================
// ADMIN CONTROLLERS
// ============================================

/**
 * @desc    Get all users (admin)
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive, membershipType } = req.query;

  const filter = {};
  
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (membershipType) filter.membershipType = membershipType;
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  const total = await User.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip(pagination.skip)
    .limit(pagination.limit);

  ApiResponse.paginated(res, {
    data: users,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

/**
 * @desc    Get single user (admin)
 * @route   GET /api/users/:id
 * @access  Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }

  // Get user's borrow stats
  const borrowStats = await Borrow.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const stats = {
    pending: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0
  };
  borrowStats.forEach(s => { stats[s._id] = s.count; });

  ApiResponse.success(res, { user, borrowStats: stats });
});

/**
 * @desc    Update user (admin)
 * @route   PUT /api/users/:id
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, role, membershipType, isActive, points } = req.body;

  let user = await User.findById(id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }

  // Prevent changing own role if admin
  if (req.user._id.toString() === id && role && role !== user.role) {
    throw ApiError.badRequest('Không thể thay đổi role của chính mình');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (role) updateData.role = role;
  if (membershipType) updateData.membershipType = membershipType;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (points !== undefined) updateData.points = points;

  user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  ApiResponse.success(res, { user }, 'Cập nhật người dùng thành công');
});

/**
 * @desc    Delete/Deactivate user (admin)
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw ApiError.badRequest('Không thể xóa chính mình');
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }

  // Check if user has active borrows
  const activeBorrows = await Borrow.countDocuments({
    user: id,
    status: { $in: ['pending', 'borrowed', 'overdue'] }
  });

  if (activeBorrows > 0) {
    throw ApiError.badRequest(`Người dùng còn ${activeBorrows} đơn mượn chưa trả. Không thể xóa.`);
  }

  // Soft delete
  user.isActive = false;
  await user.save();

  ApiResponse.success(res, null, 'Vô hiệu hóa người dùng thành công');
});

/**
 * @desc    Get user statistics (admin)
 * @route   GET /api/users/stats
 * @access  Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
  
  const membershipStats = await User.aggregate([
    { $match: { role: 'user' } },
    { $group: { _id: '$membershipType', count: { $sum: 1 } } }
  ]);

  const newUsersThisMonth = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: new Date(new Date().setDate(1)) }
  });

  ApiResponse.success(res, {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    membershipStats: membershipStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {})
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
};
