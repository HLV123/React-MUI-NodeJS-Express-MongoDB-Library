import api from './api';

const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response;
  },

  /**
   * Get single category
   */
  getCategory: async (idOrSlug) => {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response;
  },

  /**
   * Get books by category
   */
  getCategoryBooks: async (idOrSlug, params = {}) => {
    const response = await api.get(`/categories/${idOrSlug}/books`, { params });
    return response;
  },

  // Admin methods
  /**
   * Create category (admin)
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response;
  },

  /**
   * Update category (admin)
   */
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response;
  },

  /**
   * Delete category (admin)
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
  },
};

export default categoryService;
