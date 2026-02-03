import api from './api';

const bookService = {
  /**
   * Get all books with filters
   */
  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response;
  },

  /**
   * Get single book by ID or slug
   */
  getBook: async (idOrSlug) => {
    const response = await api.get(`/books/${idOrSlug}`);
    return response;
  },

  /**
   * Get featured books
   */
  getFeaturedBooks: async (limit = 6) => {
    const response = await api.get('/books/featured', { params: { limit } });
    return response;
  },

  /**
   * Get new arrivals
   */
  getNewArrivals: async (limit = 10) => {
    const response = await api.get('/books/new-arrivals', { params: { limit } });
    return response;
  },

  /**
   * Get popular books
   */
  getPopularBooks: async (limit = 10) => {
    const response = await api.get('/books/popular', { params: { limit } });
    return response;
  },

  /**
   * Search books
   */
  searchBooks: async (query, params = {}) => {
    const response = await api.get('/books/search', { 
      params: { q: query, ...params } 
    });
    return response;
  },

  /**
   * Get related books
   */
  getRelatedBooks: async (bookId, limit = 6) => {
    const response = await api.get(`/books/${bookId}/related`, { params: { limit } });
    return response;
  },

  /**
   * Get book reviews
   */
  getBookReviews: async (bookId, params = {}) => {
    const response = await api.get(`/books/${bookId}/reviews`, { params });
    return response;
  },

  /**
   * Create review
   */
  createReview: async (bookId, reviewData) => {
    const response = await api.post(`/books/${bookId}/reviews`, reviewData);
    return response;
  },

  /**
   * Get my review for a book
   */
  getMyReview: async (bookId) => {
    const response = await api.get(`/books/${bookId}/reviews/my`);
    return response;
  },

  // Admin methods
  /**
   * Create book (admin)
   */
  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response;
  },

  /**
   * Update book (admin)
   */
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response;
  },

  /**
   * Delete book (admin)
   */
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response;
  },

  /**
   * Get all books for admin
   */
  getAllBooksAdmin: async (params = {}) => {
    const response = await api.get('/books/admin/all', { params });
    return response;
  },
};

export default bookService;
