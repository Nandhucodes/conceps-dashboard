import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Registration from './pages/Registration/Registration';
import ListPage from './pages/ListPage/ListPage';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import UsersPage from './pages/Users/UsersPage';
import Profile from './pages/Profile/Profile';

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

function PublicRoute({ children, isAuthenticated }) {
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, login, logout, register } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />} />

        {/* Auth Routes */}
        <Route
          element={
            <AuthLayout theme={theme} onToggleTheme={toggleTheme} />
          }
        >
          <Route
            path="/signin"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <SignIn onLogin={login} />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <SignUp onLogin={login} />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={<VerifyOTP onRegister={register} />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
        </Route>

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout
                user={user}
                onLogout={logout}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
