const { Category, Book } = require('../models');
const { ApiError, ApiResponse, asyncHandler, calculatePagination } = require('../utils');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort('order name');

  // Get book count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const bookCount = await Book.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      return {
        ...category.toObject(),
        bookCount
      };
    })
  );

  ApiResponse.success(res, { categories: categoriesWithCount });
});

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:idOrSlug
 * @access  Public
 */
const getCategory = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let category;
  
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(idOrSlug);
  } else {
    category = await Category.findOne({ slug: idOrSlug });
  }

  if (!category || !category.isActive) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }

  // Get book count
  const bookCount = await Book.countDocuments({ 
    category: category._id, 
    isActive: true 
  });

  ApiResponse.success(res, { 
    category: {
      ...category.toObject(),
      bookCount
    }
  });
});

/**
 * @desc    Get books by category
 * @route   GET /api/categories/:idOrSlug/books
 * @access  Public
 */
const getCategoryBooks = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

  let category;
  
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(idOrSlug);
  } else {
    category = await Category.findOne({ slug: idOrSlug });
  }

  if (!category || !category.isActive) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }

  const filter = { category: category._id, isActive: true };
  const total = await Book.countDocuments(filter);
  const pagination = calculatePagination(page, limit, total);

  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const books = await Book.find(filter)
    .populate('category', 'name slug icon color')
    .sort(sortObj)
    .skip(pagination.skip)
    .limit(pagination.limit);

  ApiResponse.paginated(res, {
    data: { category, books },
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages
  });
});

// ============================================
// ADMIN CONTROLLERS
// ============================================

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, color, order } = req.body;

  // Check if name already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw ApiError.conflict('Tên danh mục đã tồn tại');
  }

  const category = await Category.create({
    name,
    description,
    icon,
    color,
    order
  });

  ApiResponse.created(res, { category }, 'Tạo danh mục thành công');
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }

  // Check if new name conflicts with existing
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      throw ApiError.conflict('Tên danh mục đã tồn tại');
    }
  }

  category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  ApiResponse.success(res, { category }, 'Cập nhật danh mục thành công');
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }

  // Check if category has books
  const bookCount = await Book.countDocuments({ category: id, isActive: true });
  if (bookCount > 0) {
    throw ApiError.badRequest(`Không thể xóa danh mục có ${bookCount} sách. Vui lòng chuyển sách sang danh mục khác trước.`);
  }

  // Soft delete
  category.isActive = false;
  await category.save();

  ApiResponse.success(res, null, 'Xóa danh mục thành công');
});

module.exports = {
  getCategories,
  getCategory,
  getCategoryBooks,
  createCategory,
  updateCategory,
  deleteCategory
};
