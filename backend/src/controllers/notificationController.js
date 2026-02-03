const { Notification } = require('../models');
const { ApiError, ApiResponse, asyncHandler, calculatePagination } = require('../utils');

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const userId = req.user._id;

  const filter = { user: userId };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const total = await Notification.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  const notifications = await Notification.find(filter)
    .sort('-createdAt')
    .skip(pagination.skip)
    .limit(pagination.limit);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false
  });

  ApiResponse.paginated(res, {
    data: { notifications, unreadCount },
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({ _id: id, user: userId });
  
  if (!notification) {
    throw ApiError.notFound('Không tìm thấy thông báo');
  }

  notification.isRead = true;
  await notification.save();

  ApiResponse.success(res, { notification }, 'Đã đánh dấu đã đọc');
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  ApiResponse.success(res, null, 'Đã đánh dấu tất cả đã đọc');
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
  
  if (!notification) {
    throw ApiError.notFound('Không tìm thấy thông báo');
  }

  ApiResponse.success(res, null, 'Đã xóa thông báo');
});

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  ApiResponse.success(res, { unreadCount: count });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
