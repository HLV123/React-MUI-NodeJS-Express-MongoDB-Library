const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review phải thuộc về một người dùng']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Review phải thuộc về một cuốn sách']
    },
    rating: {
      type: Number,
      required: [true, 'Vui lòng đánh giá sách'],
      min: [1, 'Rating phải từ 1 đến 5'],
      max: [5, 'Rating phải từ 1 đến 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Nhận xét không được quá 1000 ký tự']
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// One user can only review a book once
reviewSchema.index({ user: 1, book: 1 }, { unique: true });
reviewSchema.index({ book: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Static method to calculate average rating for a book
reviewSchema.statics.calculateAverageRating = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId, isApproved: true } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  const Book = mongoose.model('Book');
  
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      rating: 0,
      reviewCount: 0
    });
  }
};

// Update book rating after saving review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.book);
});

// Update book rating after removing review
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.book);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
