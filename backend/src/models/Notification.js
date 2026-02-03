const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'borrow_confirmed',    // Đơn mượn được xác nhận
        'borrow_reminder',     // Nhắc nhở trả sách
        'borrow_overdue',      // Sách quá hạn
        'book_available',      // Sách có sẵn (đã đặt trước)
        'return_confirmed',    // Xác nhận đã trả sách
        'points_earned',       // Nhận điểm thưởng
        'membership_upgrade',  // Nâng cấp thành viên
        'system'              // Thông báo hệ thống
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Auto-delete old notifications (older than 30 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
