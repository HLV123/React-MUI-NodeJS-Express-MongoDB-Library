import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { storage, setToken, removeToken } from '../utils';
import config from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.get(config.storageKeys.token);
      const savedUser = storage.get(config.storageKeys.user);
      
      if (token && savedUser) {
        try {
          // Verify token with server
          const response = await authService.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          removeToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { user: userData, token, refreshToken } = response.data;
    
    setToken(token);
    storage.set(config.storageKeys.refreshToken, refreshToken);
    storage.set(config.storageKeys.user, userData);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return response;
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    const { user: newUser, token, refreshToken } = response.data;
    
    setToken(token);
    storage.set(config.storageKeys.refreshToken, refreshToken);
    storage.set(config.storageKeys.user, newUser);
    
    setUser(newUser);
    setIsAuthenticated(true);
    
    return response;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error
    } finally {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback((userData) => {
    setUser(userData);
    storage.set(config.storageKeys.user, userData);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
