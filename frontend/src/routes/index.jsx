import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/common';

// Public pages
import { HomePage, BooksPage, BookDetailPage } from '../pages/public';

// Auth pages
import { LoginPage, RegisterPage } from '../pages/auth';

// Error pages
import { NotFoundPage } from '../pages/errors';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Route wrapper (redirect if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes (no layout) */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      {/* Main layout routes */}
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:idOrSlug" element={<BookDetailPage />} />
        <Route path="search" element={<BooksPage />} />
        <Route path="categories" element={<BooksPage />} />
        <Route path="categories/:slug" element={<BooksPage />} />

        {/* Protected routes - placeholder pages */}
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Giỏ sách</h2>
                <p>Trang này đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Dashboard</h2>
                <p>Trang này đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="my-books"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Sách đang mượn</h2>
                <p>Trang này đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Sách yêu thích</h2>
                <p>Trang này đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Hồ sơ cá nhân</h2>
                <p>Trang này đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Admin Dashboard</h2>
                <p>Trang quản trị đang được phát triển...</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
