const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError, asyncHandler } = require('../utils');
const config = require('../config');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Also check for token in cookies (optional)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw ApiError.unauthorized('Người dùng không tồn tại');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Tài khoản đã bị vô hiệu hóa');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Token không hợp lệ');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token đã hết hạn, vui lòng đăng nhập lại');
    }
    throw error;
  }
});

/**
 * Optional authentication middleware
 * Attaches user to request if token exists, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, but that's okay for optional auth
    }
  }

  next();
});

module.exports = { auth, optionalAuth };
