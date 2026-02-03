const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên sách'],
      trim: true,
      maxlength: [200, 'Tên sách không được quá 200 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    author: {
      type: String,
      required: [true, 'Vui lòng nhập tên tác giả'],
      trim: true,
      maxlength: [100, 'Tên tác giả không được quá 100 ký tự']
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Mô tả không được quá 2000 ký tự']
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop'
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục']
    },
    publisher: {
      type: String,
      trim: true
    },
    publishYear: {
      type: Number,
      min: [1000, 'Năm xuất bản không hợp lệ'],
      max: [new Date().getFullYear(), 'Năm xuất bản không được lớn hơn năm hiện tại']
    },
    pageCount: {
      type: Number,
      min: [1, 'Số trang phải lớn hơn 0']
    },
    language: {
      type: String,
      default: 'vietnamese'
    },
    totalCopies: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng sách'],
      min: [0, 'Số lượng không được âm'],
      default: 1
    },
    availableCopies: {
      type: Number,
      min: [0, 'Số lượng không được âm'],
      default: 1
    },
    rating: {
      type: Number,
      min: [0, 'Rating không được nhỏ hơn 0'],
      max: [5, 'Rating không được lớn hơn 5'],
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    borrowCount: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to check if book is available
bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0;
});

// Virtual for reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book'
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' }, { default_language: 'vietnamese' });
bookSchema.index({ slug: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ borrowCount: -1 });
bookSchema.index({ createdAt: -1 });

// Generate slug before saving
bookSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now().toString(36);
  }
  next();
});

// Ensure availableCopies doesn't exceed totalCopies
bookSchema.pre('save', function (next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;