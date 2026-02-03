/**
 * Helper utility functions
 */

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate borrow code
 * Format: BR + YY + MM + random 4 chars
 * @returns {string}
 */
const generateBorrowCode = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BR${year}${month}${random}`;
};

/**
 * Calculate pagination values
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object}
 */
const calculatePagination = (page = 1, limit = 10, total = 0) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const totalPages = Math.ceil(total / limitNum);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    skip,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };
};

/**
 * Build MongoDB query filter from request query params
 * @param {object} query - Request query object
 * @param {array} allowedFields - Fields allowed to filter
 * @returns {object}
 */
const buildQueryFilter = (query, allowedFields = []) => {
  const filter = {};
  
  allowedFields.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      // Handle boolean fields
      if (query[field] === 'true') {
        filter[field] = true;
      } else if (query[field] === 'false') {
        filter[field] = false;
      } else {
        filter[field] = query[field];
      }
    }
  });

  return filter;
};

/**
 * Build MongoDB sort object from request query
 * @param {string} sortQuery - Sort query string (e.g., '-createdAt,title')
 * @param {object} defaultSort - Default sort object
 * @returns {object}
 */
const buildSortObject = (sortQuery, defaultSort = { createdAt: -1 }) => {
  if (!sortQuery) return defaultSort;

  const sortObj = {};
  const fields = sortQuery.split(',');

  fields.forEach(field => {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};

/**
 * Format date to Vietnamese locale
 * @param {Date} date - Date to format
 * @returns {string}
 */
const formatDateVN = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format currency to VND
 * @param {number} amount - Amount to format
 * @returns {string}
 */
const formatCurrencyVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Calculate days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number}
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if object ID is valid MongoDB ObjectId
 * @param {string} id 
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Remove undefined/null fields from object
 * @param {object} obj 
 * @returns {object}
 */
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

module.exports = {
  generateRandomString,
  generateBorrowCode,
  calculatePagination,
  buildQueryFilter,
  buildSortObject,
  formatDateVN,
  formatCurrencyVND,
  daysBetween,
  isValidObjectId,
  cleanObject
};
