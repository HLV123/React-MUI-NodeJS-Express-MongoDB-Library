import api from './api';

const borrowService = {
  /**
   * Create borrow request
   */
  createBorrow: async (bookId) => {
    const response = await api.post('/borrows', { bookId });
    return response;
  },

  /**
   * Get my borrows
   */
  getMyBorrows: async (params = {}) => {
    const response = await api.get('/borrows/my', { params });
    return response;
  },

  /**
   * Get current borrows (active)
   */
  getCurrentBorrows: async () => {
    const response = await api.get('/borrows/current');
    return response;
  },

  /**
   * Get single borrow detail
   */
  getBorrow: async (id) => {
    const response = await api.get(`/borrows/${id}`);
    return response;
  },

  /**
   * Extend borrow period
   */
  extendBorrow: async (id) => {
    const response = await api.put(`/borrows/${id}/extend`);
    return response;
  },

  // Admin methods
  /**
   * Get all borrows (admin)
   */
  getAllBorrows: async (params = {}) => {
    const response = await api.get('/borrows', { params });
    return response;
  },

  /**
   * Get borrow stats (admin)
   */
  getBorrowStats: async () => {
    const response = await api.get('/borrows/stats');
    return response;
  },

  /**
   * Confirm book return (admin)
   */
  returnBook: async (id) => {
    const response = await api.put(`/borrows/${id}/return`);
    return response;
  },

  /**
   * Cancel borrow (admin)
   */
  cancelBorrow: async (id, reason) => {
    const response = await api.put(`/borrows/${id}/cancel`, { reason });
    return response;
  },
};

export default borrowService;
