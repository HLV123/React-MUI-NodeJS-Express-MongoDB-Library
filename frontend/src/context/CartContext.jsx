import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], itemCount: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], itemCount: 0 });
    }
  }, [isAuthenticated]);

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await cartService.getCart();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add to cart
  const addToCart = useCallback(async (bookId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ sách');
      return false;
    }

    try {
      const response = await cartService.addToCart(bookId);
      setCart(response.data.cart);
      toast.success('Đã thêm vào giỏ sách');
      return true;
    } catch (error) {
      toast.error(error.message || 'Không thể thêm vào giỏ sách');
      return false;
    }
  }, [isAuthenticated]);

  // Remove from cart
  const removeFromCart = useCallback(async (bookId) => {
    try {
      const response = await cartService.removeFromCart(bookId);
      setCart(response.data.cart);
      toast.success('Đã xóa khỏi giỏ sách');
      return true;
    } catch (error) {
      toast.error(error.message || 'Không thể xóa khỏi giỏ sách');
      return false;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      const response = await cartService.clearCart();
      setCart(response.data.cart);
      toast.success('Đã xóa toàn bộ giỏ sách');
      return true;
    } catch (error) {
      toast.error(error.message || 'Không thể xóa giỏ sách');
      return false;
    }
  }, []);

  // Check if book is in cart
  const isInCart = useCallback((bookId) => {
    return cart.items.some(item => item.book?._id === bookId || item.book === bookId);
  }, [cart.items]);

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    itemCount: cart.itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
