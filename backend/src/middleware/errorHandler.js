const config = require('../config');
const { ApiError } = require('../utils');

/**
 * Convert non-ApiError errors to ApiError
 */
const convertError = (err) => {
  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Không tìm thấy tài nguyên với ID: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại trong hệ thống`;
    error = new ApiError(409, message);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    const message = messages.join('. ');
    error = new ApiError(400, message);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Token không hợp lệ');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token đã hết hạn');
  }

  return error;
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = convertError(err);

  // If not an ApiError, create one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Đã có lỗi xảy ra';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error in development
  if (config.env === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
    ...(config.env === 'development' && {
      stack: error.stack,
      error: err
    })
  };

  res.status(error.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Không tìm thấy endpoint: ${req.originalUrl}`);
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
