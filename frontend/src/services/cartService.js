import api from './api';

const cartService = {
  /**
   * Get cart
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response;
  },

  /**
   * Add book to cart
   */
  addToCart: async (bookId) => {
    const response = await api.post('/cart', { bookId });
    return response;
  },

  /**
   * Remove book from cart
   */
  removeFromCart: async (bookId) => {
    const response = await api.delete(`/cart/${bookId}`);
    return response;
  },

  /**
   * Clear cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response;
  },

  /**
   * Check if book is in cart
   */
  checkInCart: async (bookId) => {
    const response = await api.get(`/cart/check/${bookId}`);
    return response;
  },
};

export default cartService;
