const { ApiError } = require('../utils');

/**
 * Admin role middleware
 * Must be used after auth middleware
 */
const admin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
  }

  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Bạn không có quyền truy cập chức năng này');
  }

  next();
};

/**
 * Role-based access middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('Bạn không có quyền truy cập chức năng này');
    }

    next();
  };
};

module.exports = { admin, authorize };
