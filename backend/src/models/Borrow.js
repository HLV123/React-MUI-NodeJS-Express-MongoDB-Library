const mongoose = require('mongoose');
const config = require('../config');

const borrowSchema = new mongoose.Schema(
  {
    borrowCode: {
      type: String,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng chọn người mượn']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Vui lòng chọn sách']
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'borrowed', 'returned', 'overdue', 'cancelled'],
      default: 'pending'
    },
    extendCount: {
      type: Number,
      default: 0,
      max: [config.borrow.maxExtensions, `Chỉ được gia hạn tối đa ${config.borrow.maxExtensions} lần`]
    },
    fine: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú không được quá 500 ký tự']
    },
    // Snapshot of book info at borrow time (in case book is deleted/modified)
    bookSnapshot: {
      title: String,
      author: String,
      coverImage: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to check if overdue
borrowSchema.virtual('isOverdue').get(function () {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Virtual for days until due or days overdue
borrowSchema.virtual('daysRemaining').get(function () {
  if (this.status === 'returned') return null;
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Indexes
borrowSchema.index({ borrowCode: 1 });
borrowSchema.index({ user: 1 });
borrowSchema.index({ book: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ createdAt: -1 });

// Generate borrow code before saving
borrowSchema.pre('save', async function (next) {
  if (!this.borrowCode) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.borrowCode = `BR${year}${month}${random}`;
  }
  next();
});

// Set default due date if not provided
borrowSchema.pre('save', function (next) {
  if (!this.dueDate) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + config.borrow.borrowDurationDays);
    this.dueDate = dueDate;
  }
  next();
});

// Store book snapshot
borrowSchema.pre('save', async function (next) {
  if (this.isNew && this.book) {
    const Book = mongoose.model('Book');
    const book = await Book.findById(this.book);
    if (book) {
      this.bookSnapshot = {
        title: book.title,
        author: book.author,
        coverImage: book.coverImage
      };
    }
  }
  next();
});

// Calculate fine for overdue
borrowSchema.methods.calculateFine = function () {
  if (this.status === 'returned' || !this.isOverdue) return 0;
  
  const now = new Date();
  const overdueDays = Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, overdueDays * config.borrow.finePerDay);
};

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow;