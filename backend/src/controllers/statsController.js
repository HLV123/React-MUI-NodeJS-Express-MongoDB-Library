const { User, Book, Borrow, Category } = require('../models');
const { ApiResponse, asyncHandler } = require('../utils');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Basic counts
  const [totalUsers, totalBooks, totalBorrows, totalCategories] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Book.countDocuments({ isActive: true }),
    Borrow.countDocuments(),
    Category.countDocuments({ isActive: true })
  ]);

  // Active borrows
  const activeBorrows = await Borrow.countDocuments({
    status: { $in: ['borrowed', 'overdue'] }
  });

  // Overdue borrows
  const overdueBorrows = await Borrow.countDocuments({
    status: 'borrowed',
    dueDate: { $lt: new Date() }
  });

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newUsersToday, borrowsToday, returnsToday] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: today } }),
    Borrow.countDocuments({ createdAt: { $gte: today } }),
    Borrow.countDocuments({ returnDate: { $gte: today } })
  ]);

  // This month stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const [newUsersMonth, borrowsMonth] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thisMonth } }),
    Borrow.countDocuments({ createdAt: { $gte: thisMonth } })
  ]);

  // Top borrowed books
  const topBooks = await Book.find({ isActive: true })
    .select('title author coverImage borrowCount rating')
    .sort('-borrowCount')
    .limit(5);

  // Recent borrows
  const recentBorrows = await Borrow.find()
    .populate('user', 'name email')
    .populate('book', 'title coverImage')
    .sort('-createdAt')
    .limit(10);

  // Borrow status distribution
  const borrowStatusStats = await Borrow.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const statusDistribution = {
    pending: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0,
    cancelled: 0
  };
  borrowStatusStats.forEach(s => { statusDistribution[s._id] = s.count; });

  // Category stats
  const categoryStats = await Book.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', icon: '$category.icon', color: '$category.color', count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // Membership distribution
  const membershipStats = await User.aggregate([
    { $match: { role: 'user' } },
    { $group: { _id: '$membershipType', count: { $sum: 1 } } }
  ]);

  const membershipDistribution = { basic: 0, silver: 0, gold: 0 };
  membershipStats.forEach(m => { membershipDistribution[m._id] = m.count; });

  ApiResponse.success(res, {
    overview: {
      totalUsers,
      totalBooks,
      totalBorrows,
      totalCategories,
      activeBorrows,
      overdueBorrows
    },
    today: {
      newUsers: newUsersToday,
      borrows: borrowsToday,
      returns: returnsToday
    },
    thisMonth: {
      newUsers: newUsersMonth,
      borrows: borrowsMonth
    },
    topBooks,
    recentBorrows,
    statusDistribution,
    categoryStats,
    membershipDistribution
  });
});

/**
 * @desc    Get borrow trends (last 7 days)
 * @route   GET /api/stats/trends
 * @access  Admin
 */
const getBorrowTrends = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  const trends = await Borrow.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        borrows: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing dates
  const result = [];
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const found = trends.find(t => t._id === dateStr);
    result.push({
      date: dateStr,
      borrows: found ? found.borrows : 0
    });
  }

  ApiResponse.success(res, { trends: result });
});

module.exports = {
  getDashboardStats,
  getBorrowTrends
};
