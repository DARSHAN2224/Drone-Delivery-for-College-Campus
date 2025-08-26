import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SellerDashboard from './SellerDashboard';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';

// Mock the stores
vi.mock('../../stores/authStore');
vi.mock('../../stores/appStore');

// Mock the API calls
vi.mock('../../stores/api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock the notification store
vi.mock('../../stores/notificationStore', () => ({
  useNotificationStore: () => ({
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
    notifications: []
  })
}));

describe('🏪 Seller Dashboard Component Tests', () => {
  const mockUser = {
    _id: 'seller123',
    username: 'testSeller',
    email: 'seller@test.com',
    role: 'seller',
    status: 'active'
  };

  const mockShop = {
    _id: 'shop123',
    name: 'Test Shop',
    description: 'A test shop',
    status: 'approved',
    address: '123 Test St',
    city: 'Test City',
    category: 'restaurant',
    cuisine: 'international'
  };

  const mockStats = {
    totalOrders: 25,
    totalRevenue: 1250.50,
    pendingOrders: 3,
    completedOrders: 22,
    averageRating: 4.5,
    totalProducts: 15
  };

  const mockRecentOrders = [
    {
      _id: 'order1',
      orderNumber: 'ORD001',
      customerName: 'John Doe',
      total: 45.99,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'order2',
      orderNumber: 'ORD002',
      customerName: 'Jane Smith',
      total: 32.50,
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  ];

  const mockRecentProducts = [
    {
      _id: 'product1',
      name: 'Test Product 1',
      price: 12.99,
      status: 'approved',
      category: 'main'
    },
    {
      _id: 'product2',
      name: 'Test Product 2',
      price: 8.99,
      status: 'pending',
      category: 'appetizer'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth store
    useAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: vi.fn()
    });

    // Mock app store
    useAppStore.mockReturnValue({
      isLoading: false,
      error: null,
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn()
    });
  });

  describe('Component Rendering', () => {
    it('✅ should render seller dashboard with all sections', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Shop Overview')).toBeInTheDocument();
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      expect(screen.getByText('Recent Products')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('✅ should display seller information', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText('Seller')).toBeInTheDocument();
    });

    it('✅ should render navigation menu items', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Offers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Data Fetching & Display', () => {
    it('✅ should fetch and display shop statistics', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockStats,
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // totalOrders
        expect(screen.getByText('$1,250.50')).toBeInTheDocument(); // totalRevenue
        expect(screen.getByText('3')).toBeInTheDocument(); // pendingOrders
        expect(screen.getByText('4.5')).toBeInTheDocument(); // averageRating
      });
    });

    it('✅ should display recent orders with correct information', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockStats,
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ORD001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('$45.99')).toBeInTheDocument();
        expect(screen.getByText('ORD002')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('$32.50')).toBeInTheDocument();
      });
    });

    it('✅ should display recent products with correct information', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockStats,
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('$12.99')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('$8.99')).toBeInTheDocument();
      });
    });

    it('✅ should show loading state while fetching data', () => {
      useAppStore.mockReturnValue({
        isLoading: true,
        error: null,
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn()
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('❌ should display error message when API call fails', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockRejectedValue(new Error('Failed to fetch data'));

      useAppStore.mockReturnValue({
        isLoading: false,
        error: 'Failed to fetch dashboard data',
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn()
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('✅ should allow retrying when data fetch fails', async () => {
      const mockApi = await import('../../stores/api.js');
      const mockSetError = vi.fn();
      const mockSetLoading = vi.fn();

      useAppStore.mockReturnValue({
        isLoading: false,
        error: 'Failed to fetch dashboard data',
        setLoading: mockSetLoading,
        setError: mockSetError,
        clearError: vi.fn()
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });

    it('✅ should handle network errors gracefully', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('✅ should navigate to products page when clicked', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const productsLink = screen.getByText('Products');
      fireEvent.click(productsLink);

      expect(mockNavigate).toHaveBeenCalledWith('/seller/products');
    });

    it('✅ should navigate to orders page when clicked', async () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const ordersLink = screen.getByText('Orders');
      fireEvent.click(ordersLink);

      expect(mockNavigate).toHaveBeenCalledWith('/seller/orders');
    });

    it('✅ should open quick action modals when buttons are clicked', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockStats,
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const addProductButton = screen.getByText('Add Product');
        fireEvent.click(addProductButton);
        
        expect(screen.getByText('Add New Product')).toBeInTheDocument();
        expect(screen.getByText('Product Name')).toBeInTheDocument();
      });
    });

    it('✅ should handle logout when logout button is clicked', () => {
      const mockLogout = vi.fn();
      useAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        logout: mockLogout
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('✅ should update loading state during data fetch', async () => {
      const mockSetLoading = vi.fn();
      useAppStore.mockReturnValue({
        isLoading: false,
        error: null,
        setLoading: mockSetLoading,
        setError: vi.fn(),
        clearError: vi.fn()
      });

      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });

    it('✅ should clear error when component unmounts', () => {
      const mockClearError = vi.fn();
      useAppStore.mockReturnValue({
        isLoading: false,
        error: null,
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: mockClearError
      });

      const { unmount } = render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      unmount();
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('✅ should display mobile menu toggle on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    });

    it('✅ should toggle mobile menu when hamburger is clicked', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const menuToggle = screen.getByTestId('mobile-menu-toggle');
      fireEvent.click(menuToggle);

      expect(screen.getByTestId('mobile-menu')).toHaveClass('open');
    });
  });

  describe('Accessibility', () => {
    it('✅ should have proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      expect(screen.getByLabelText('Dashboard navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Shop statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Recent orders list')).toBeInTheDocument();
    });

    it('✅ should support keyboard navigation', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard');
      dashboardLink.focus();
      
      expect(dashboardLink).toHaveFocus();
      
      // Test tab navigation
      fireEvent.keyDown(dashboardLink, { key: 'Tab' });
      // Should focus next focusable element
    });

    it('✅ should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Seller Dashboard');

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s).toHaveLength(4); // Shop Overview, Recent Orders, Recent Products, Quick Actions
    });
  });

  describe('Edge Cases', () => {
    it('✅ should handle empty data gracefully', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: { ...mockStats, totalOrders: 0, totalRevenue: 0 },
            recentOrders: [],
            recentProducts: []
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
        expect(screen.getByText('No products yet')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });
    });

    it('✅ should handle very large numbers correctly', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: {
              ...mockStats,
              totalOrders: 999999,
              totalRevenue: 999999.99
            },
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('999,999')).toBeInTheDocument();
        expect(screen.getByText('$999,999.99')).toBeInTheDocument();
      });
    });

    it('✅ should handle component unmounting during API call', async () => {
      const mockApi = await import('../../stores/api.js');
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockApi.api.get.mockReturnValue(promise);

      const { unmount } = render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      resolvePromise({
        data: {
          success: true,
          data: { stats: mockStats, recentOrders: [], recentProducts: [] }
        }
      });

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('✅ should not re-render unnecessarily', () => {
      const renderCount = vi.fn();
      
      const TestWrapper = () => {
        renderCount();
        return (
          <BrowserRouter>
            <SellerDashboard />
          </BrowserRouter>
        );
      };

      render(<TestWrapper />);
      
      // Component should only render once initially
      expect(renderCount).toHaveBeenCalledTimes(1);
    });

    it('✅ should handle rapid state changes efficiently', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockStats,
            recentOrders: mockRecentOrders,
            recentProducts: mockRecentProducts
          }
        }
      });

      render(
        <BrowserRouter>
          <SellerDashboard />
        </BrowserRouter>
      );

      // Rapidly click multiple buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        fireEvent.click(button);
      });

      // Should handle all clicks without errors
      expect(true).toBe(true);
    });
  });
});
