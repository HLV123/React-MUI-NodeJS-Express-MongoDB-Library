const { Book, Category } = require('../models');
const { ApiError, ApiResponse, asyncHandler, calculatePagination, buildSortObject } = require('../utils');

/**
 * @desc    Get all books with filters, search, pagination
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 12, 
    sort = '-createdAt',
    category,
    search,
    minRating,
    available,
    featured
  } = req.query;

  // Build filter
  const filter = { isActive: true };
  
  if (category) {
    filter.category = category;
  }
  
  if (search) {
    filter.$text = { $search: search };
  }
  
  if (minRating) {
    filter.rating = { $gte: parseFloat(minRating) };
  }
  
  if (available === 'true') {
    filter.availableCopies = { $gt: 0 };
  }
  
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  // Count total
  const total = await Book.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  // Build sort
  const sortObj = buildSortObject(sort);

  // Query
  const books = await Book.find(filter)
    .populate('category', 'name slug icon color')
    .sort(sortObj)
    .skip(pagination.skip)
    .limit(pagination.limit);

  ApiResponse.paginated(res, {
    data: books,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

/**
 * @desc    Get featured books
 * @route   GET /api/books/featured
 * @access  Public
 */
const getFeaturedBooks = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const books = await Book.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug icon color')
    .sort('-rating -borrowCount')
    .limit(parseInt(limit));

  ApiResponse.success(res, { books });
});

/**
 * @desc    Get new arrivals
 * @route   GET /api/books/new-arrivals
 * @access  Public
 */
const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const books = await Book.find({ isActive: true })
    .populate('category', 'name slug icon color')
    .sort('-createdAt')
    .limit(parseInt(limit));

  ApiResponse.success(res, { books });
});

/**
 * @desc    Get popular books (most borrowed)
 * @route   GET /api/books/popular
 * @access  Public
 */
const getPopularBooks = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const books = await Book.find({ isActive: true })
    .populate('category', 'name slug icon color')
    .sort('-borrowCount -rating')
    .limit(parseInt(limit));

  ApiResponse.success(res, { books });
});

/**
 * @desc    Get single book by ID or slug
 * @route   GET /api/books/:idOrSlug
 * @access  Public
 */
const getBook = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let book;
  
  // Check if it's an ObjectId or slug
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    book = await Book.findById(idOrSlug).populate('category', 'name slug icon color');
  } else {
    book = await Book.findOne({ slug: idOrSlug }).populate('category', 'name slug icon color');
  }

  if (!book || !book.isActive) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  ApiResponse.success(res, { book });
});

/**
 * @desc    Search books
 * @route   GET /api/books/search
 * @access  Public
 */
const searchBooks = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Từ khóa tìm kiếm phải có ít nhất 2 ký tự');
  }

  const searchRegex = new RegExp(q.trim(), 'i');
  
  const filter = {
    isActive: true,
    $or: [
      { title: searchRegex },
      { author: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ]
  };

  const total = await Book.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  const books = await Book.find(filter)
    .populate('category', 'name slug icon color')
    .sort('-rating -borrowCount')
    .skip(pagination.skip)
    .limit(pagination.limit);

  ApiResponse.paginated(res, {
    data: books,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  }, `Tìm thấy ${total} kết quả cho "${q}"`);
});

/**
 * @desc    Get related books
 * @route   GET /api/books/:id/related
 * @access  Public
 */
const getRelatedBooks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 6 } = req.query;

  const book = await Book.findById(id);
  if (!book) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  const relatedBooks = await Book.find({
    _id: { $ne: id },
    isActive: true,
    $or: [
      { category: book.category },
      { author: book.author },
      { tags: { $in: book.tags } }
    ]
  })
    .populate('category', 'name slug icon color')
    .sort('-rating')
    .limit(parseInt(limit));

  ApiResponse.success(res, { books: relatedBooks });
});

// ============================================
// ADMIN CONTROLLERS
// ============================================

/**
 * @desc    Create new book
 * @route   POST /api/books
 * @access  Admin
 */
const createBook = asyncHandler(async (req, res) => {
  const {
    title, author, isbn, description, coverImage,
    category, publisher, publishYear, pageCount,
    language, totalCopies, tags, isFeatured
  } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw ApiError.badRequest('Danh mục không tồn tại');
  }

  // Check ISBN uniqueness
  if (isbn) {
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      throw ApiError.conflict('ISBN đã tồn tại');
    }
  }

  const book = await Book.create({
    title,
    author,
    isbn,
    description,
    coverImage,
    category,
    publisher,
    publishYear,
    pageCount,
    language,
    totalCopies,
    availableCopies: totalCopies,
    tags,
    isFeatured
  });

  await book.populate('category', 'name slug icon color');

  ApiResponse.created(res, { book }, 'Thêm sách thành công');
});

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Admin
 */
const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let book = await Book.findById(id);
  if (!book) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  // If category is being updated, check if it exists
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      throw ApiError.badRequest('Danh mục không tồn tại');
    }
  }

  // If ISBN is being updated, check uniqueness
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      throw ApiError.conflict('ISBN đã tồn tại');
    }
  }

  // Update book
  book = await Book.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug icon color');

  ApiResponse.success(res, { book }, 'Cập nhật sách thành công');
});

/**
 * @desc    Delete book (soft delete)
 * @route   DELETE /api/books/:id
 * @access  Admin
 */
const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findById(id);
  if (!book) {
    throw ApiError.notFound('Không tìm thấy sách');
  }

  // Soft delete
  book.isActive = false;
  await book.save();

  ApiResponse.success(res, null, 'Xóa sách thành công');
});

/**
 * @desc    Get all books (admin - includes inactive)
 * @route   GET /api/books/admin/all
 * @access  Admin
 */
const getAllBooksAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt', search, isActive } = req.query;

  const filter = {};
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { title: searchRegex },
      { author: searchRegex },
      { isbn: searchRegex }
    ];
  }

  const total = await Book.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);
  const sortObj = buildSortObject(sort);

  const books = await Book.find(filter)
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip(pagination.skip)
    .limit(pagination.limit);

  ApiResponse.paginated(res, {
    data: books,
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

module.exports = {
  getBooks,
  getFeaturedBooks,
  getNewArrivals,
  getPopularBooks,
  getBook,
  searchBooks,
  getRelatedBooks,
  createBook,
  updateBook,
  deleteBook,
  getAllBooksAdmin
};
