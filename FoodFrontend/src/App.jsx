import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useAppStore } from './stores/appStore';
import { useNotificationStore } from './stores/notificationStore';
import { Toaster } from 'react-hot-toast';

// Components
import UserHeader from './components/layout/UserHeader';
import SellerHeader from './components/layout/SellerHeader';
import AdminHeader from './components/layout/AdminHeader';
import UserFooter from './components/layout/UserFooter';
import SellerFooter from './components/layout/SellerFooter';
import AdminFooter from './components/layout/AdminFooter';
import LoadingSpinner from './components/common/LoadingSpinner';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserLogin from './components/auth/UserLogin';
import UserSignup from './components/auth/UserSignup';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// User Components
import UserHome from './components/user/UserHome';
import Shops from './components/user/Shops';
import ShopDetails from './components/user/ShopDetails';
import Cart from './components/user/Cart';
import Orders from './components/user/Orders';
import OrderDetail from './components/user/OrderDetail';
import OrderHistory from './components/user/OrderHistory';
import PageViewer from './components/user/PageViewer';
import QRValidation from './components/user/QRValidation';
import Profile from './components/user/Profile';
import UserOffers from './components/user/UserOffers';
import DeliveryTracking from './components/user/DeliveryTracking';

// Seller Components
import SellerDashboard from './components/seller/SellerDashboard';
import SellerAddProduct from './components/seller/SellerAddProduct';
import SellerEditProduct from './components/seller/SellerEditProduct';
import SellerEditShop from './components/seller/SellerEditShop';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminPendingProducts from './components/admin/AdminPendingProducts';
import AdminPendingShops from './components/admin/AdminPendingShops';
import AdminPendingOffers from './components/admin/AdminPendingOffers';
import AdminSellers from './components/admin/AdminSellers';
import AdminPages from './components/admin/AdminPages';
import AdminDocumentation from './components/admin/AdminDocumentation';
import AdminFeedbackPage from './components/admin/AdminFeedback';
import DroneControlCenter from './components/admin/DroneControlCenter';
import MockDroneTesting from './components/admin/MockDroneTesting';
import RegularDeliveryDashboard from './components/admin/RegularDeliveryDashboard';

// Common Components
import About from './components/common/About';
import Contact from './components/common/Contact';
import Partner from './components/common/Partner';
import HowItWorks from './components/common/HowItWorks';
import Support from './components/common/Support';
import Terms from './components/common/Terms';
import Privacy from './components/common/Privacy';
import SearchResults from './components/common/SearchResults';
import Documentation from './pages/Documentation';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'seller') {
      return <Navigate to="/seller" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Unauth-only Route Component
const UnauthRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'seller') {
      return <Navigate to="/seller" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// App Content Component
const AppContent = () => {
  const { checkAuth, isAuthenticated, isLoading, user } = useAuthStore();
  const { getHomeData } = useAppStore();
  const { fetchNotifications, subscribeLive } = useNotificationStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleFocus = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && !isAuthenticated) {
        console.log('🔍 Window focused, re-checking auth...');
        checkAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAuth, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user?.role === 'user') {
      getHomeData();
    }
  }, [isAuthenticated, isLoading, user, getHomeData]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        console.log('🔍 App.jsx - fetching notifications after auth delay');
        fetchNotifications();
        // Only subscribe to live updates in production
        if (process.env.NODE_ENV === 'production') {
          subscribeLive();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, fetchNotifications, subscribeLive]);

  const currentPath = location.pathname;
  const userRole = user?.role;
  
  const getHeaderComponent = () => {
    if (currentPath.startsWith('/admin') || userRole === 'admin') return AdminHeader;
    if (currentPath.startsWith('/seller') || userRole === 'seller') return SellerHeader;
    return UserHeader;
  };
  
  const getFooterComponent = () => {
    if (currentPath.startsWith('/admin') || userRole === 'admin') return AdminFooter;
    if (currentPath.startsWith('/seller') || userRole === 'seller') return SellerFooter;
    return UserFooter;
  };
  
  const HeaderComponent = getHeaderComponent();
  const FooterComponent = getFooterComponent();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderComponent />
      <Toast />
      <Toaster position="top-right" />
      <main className="flex-1">
        <Routes>
          {/* Unauthenticated-only Routes */}
          <Route path="/login" element={<UnauthRoute><Login /></UnauthRoute>} />
          <Route path="/register" element={<UnauthRoute><Register /></UnauthRoute>} />
          <Route path="/login/user" element={<UnauthRoute><UserLogin /></UnauthRoute>} />
          <Route path="/signup/user" element={<UnauthRoute><UserSignup /></UnauthRoute>} />
          <Route path="/verify-email" element={<UnauthRoute><VerifyEmail /></UnauthRoute>} />
          <Route path="/forgot-password" element={<UnauthRoute><ForgotPassword /></UnauthRoute>} />
          <Route path="/reset-password/:token" element={<UnauthRoute><ResetPassword /></UnauthRoute>} />

          {/* Public Home Route */}
          <Route path="/" element={<UserHome />} />
          
          {/* Seller Routes */}
          <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/shop" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/offers" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/addproducts" element={<ProtectedRoute allowedRoles={['seller']}><SellerAddProduct /></ProtectedRoute>} />
          <Route path="/seller/editproduct/:id" element={<ProtectedRoute allowedRoles={['seller']}><SellerEditProduct /></ProtectedRoute>} />
          <Route path="/seller/edit-shop" element={<ProtectedRoute allowedRoles={['seller']}><SellerEditShop /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/pending-products" element={<ProtectedRoute allowedRoles={['admin']}><AdminPendingProducts /></ProtectedRoute>} />
          <Route path="/admin/pending-shops" element={<ProtectedRoute allowedRoles={['admin']}><AdminPendingShops /></ProtectedRoute>} />
          <Route path="/admin/pending-offers" element={<ProtectedRoute allowedRoles={['admin']}><AdminPendingOffers /></ProtectedRoute>} />
          <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSellers /></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute allowedRoles={['admin']}><AdminPages /></ProtectedRoute>} />
          <Route path="/admin/documentation" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocumentation /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedbackPage /></ProtectedRoute>} />
                  <Route path="/admin/drone-control" element={<ProtectedRoute allowedRoles={['admin']}><DroneControlCenter /></ProtectedRoute>} />
        <Route path="/admin/regular-delivery" element={<ProtectedRoute allowedRoles={['admin']}><RegularDeliveryDashboard /></ProtectedRoute>} />
        {process.env.NODE_ENV === 'development' && (
          <Route path="/admin/mock-drone-testing" element={<ProtectedRoute allowedRoles={['admin']}><MockDroneTesting /></ProtectedRoute>} />
        )}

          {/* Public browsing routes */}
          <Route path="/shops" element={<Shops />} />
          <Route path="/shop/:shopId" element={<ShopDetails />} />
          <Route path="/offers" element={<UserOffers />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['user']}><Orders /></ProtectedRoute>} />
          <Route path="/delivery/:orderId" element={<ProtectedRoute allowedRoles={['user']}><DeliveryTracking /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['user']}><OrderDetail /></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute allowedRoles={['user']}><OrderHistory /></ProtectedRoute>} />
          <Route path="/qr-validation" element={<ProtectedRoute allowedRoles={['user']}><QRValidation /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Public info pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Public CMS page */}
          <Route path="/pages/:slug" element={<PageViewer />} />
          
          {/* Catch-all route - redirect to appropriate page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <FooterComponent />
    </div>
  );
};

// Main App Component (wraps Router)
function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;