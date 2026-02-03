import api from './api';

const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response;
  },

  /**
   * Get favorites
   */
  getFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response;
  },

  /**
   * Add to favorites
   */
  addFavorite: async (bookId) => {
    const response = await api.post(`/users/favorites/${bookId}`);
    return response;
  },

  /**
   * Remove from favorites
   */
  removeFavorite: async (bookId) => {
    const response = await api.delete(`/users/favorites/${bookId}`);
    return response;
  },

  /**
   * Check if book is in favorites
   */
  checkFavorite: async (bookId) => {
    const response = await api.get(`/users/favorites/${bookId}/check`);
    return response;
  },

  // Admin methods
  /**
   * Get all users (admin)
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response;
  },

  /**
   * Get user by ID (admin)
   */
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },

  /**
   * Update user (admin)
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response;
  },

  /**
   * Delete user (admin)
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  /**
   * Get user stats (admin)
   */
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response;
  },
};

export default userService;
