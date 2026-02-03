import config from '../config';

/**
 * Format date to Vietnamese locale
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency to VND
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format number with separator
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Calculate days remaining until due date
 */
export const getDaysRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get status color for borrow status
 */
export const getBorrowStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    borrowed: 'primary',
    returned: 'success',
    overdue: 'error',
    cancelled: 'default',
  };
  return colors[status] || 'default';
};

/**
 * Get status text in Vietnamese
 */
export const getBorrowStatusText = (status) => {
  const texts = {
    pending: 'Chờ xử lý',
    borrowed: 'Đang mượn',
    returned: 'Đã trả',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy',
  };
  return texts[status] || status;
};

/**
 * Get membership badge color
 */
export const getMembershipColor = (type) => {
  const colors = {
    basic: 'default',
    silver: 'info',
    gold: 'warning',
  };
  return colors[type] || 'default';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

/**
 * Get token from storage
 */
export const getToken = () => {
  return storage.get(config.storageKeys.token);
};

/**
 * Set token to storage
 */
export const setToken = (token) => {
  storage.set(config.storageKeys.token, token);
};

/**
 * Remove token from storage
 */
export const removeToken = () => {
  storage.remove(config.storageKeys.token);
  storage.remove(config.storageKeys.refreshToken);
  storage.remove(config.storageKeys.user);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};
