const { auth, optionalAuth } = require('./auth');
const { admin, authorize } = require('./admin');
const { errorHandler, notFoundHandler } = require('./errorHandler');
const validate = require('./validate');
const { apiLimiter, authLimiter, createLimiter } = require('./rateLimiter');

module.exports = {
  auth,
  optionalAuth,
  admin,
  authorize,
  errorHandler,
  notFoundHandler,
  validate,
  apiLimiter,
  authLimiter,
  createLimiter
};
