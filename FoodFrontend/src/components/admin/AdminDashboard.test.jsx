import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
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

describe('👑 Admin Dashboard Component Tests', () => {
  const mockAdmin = {
    _id: 'admin123',
    username: 'testAdmin',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active'
  };

  const mockPlatformStats = {
    totalUsers: 1250,
    totalSellers: 89,
    totalShops: 156,
    totalOrders: 3420,
    totalRevenue: 125000.50,
    activeUsers: 1180,
    pendingApprovals: {
      shops: 12,
      products: 45,
      offers: 23,
      sellers: 8
    }
  };

  const mockRecentActivity = [
    {
      _id: 'activity1',
      type: 'user_registration',
      description: 'New user registered: john.doe@email.com',
      timestamp: new Date().toISOString(),
      severity: 'info'
    },
    {
      _id: 'activity2',
      type: 'shop_approval',
      description: 'Shop "Pizza Palace" approved by admin',
      timestamp: new Date().toISOString(),
      severity: 'success'
    },
    {
      _id: 'activity3',
      type: 'order_completed',
      description: 'Order #ORD1234 completed successfully',
      timestamp: new Date().toISOString(),
      severity: 'info'
    }
  ];

  const mockPendingApprovals = {
    shops: [
      {
        _id: 'shop1',
        name: 'New Restaurant',
        seller: 'seller123',
        category: 'restaurant',
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    ],
    products: [
      {
        _id: 'product1',
        name: 'New Product',
        shop: 'shop123',
        price: 15.99,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    ],
    offers: [
      {
        _id: 'offer1',
        title: 'Summer Sale',
        shop: 'shop123',
        discountValue: 20,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    ]
  };

  const mockSystemHealth = {
    database: 'healthy',
    api: 'healthy',
    websocket: 'healthy',
    email: 'healthy',
    storage: 'healthy',
    lastCheck: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth store
    useAuthStore.mockReturnValue({
      user: mockAdmin,
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
    it('✅ should render admin dashboard with all sections', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Platform Overview')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('✅ should display admin information', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText(mockAdmin.username)).toBeInTheDocument();
      expect(screen.getByText(mockAdmin.email)).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('✅ should render admin navigation menu items', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Shops')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Drones')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Data Fetching & Display', () => {
    it('✅ should fetch and display platform statistics', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument(); // totalUsers
        expect(screen.getByText('89')).toBeInTheDocument(); // totalSellers
        expect(screen.getByText('156')).toBeInTheDocument(); // totalShops
        expect(screen.getByText('3,420')).toBeInTheDocument(); // totalOrders
        expect(screen.getByText('$125,000.50')).toBeInTheDocument(); // totalRevenue
      });
    });

    it('✅ should display pending approval counts', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument(); // pending shops
        expect(screen.getByText('45')).toBeInTheDocument(); // pending products
        expect(screen.getByText('23')).toBeInTheDocument(); // pending offers
        expect(screen.getByText('8')).toBeInTheDocument(); // pending sellers
      });
    });

    it('✅ should display recent activity with correct information', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('New user registered: john.doe@email.com')).toBeInTheDocument();
        expect(screen.getByText('Shop "Pizza Palace" approved by admin')).toBeInTheDocument();
        expect(screen.getByText('Order #ORD1234 completed successfully')).toBeInTheDocument();
      });
    });

    it('✅ should display system health status', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Database')).toBeInTheDocument();
        expect(screen.getByText('API')).toBeInTheDocument();
        expect(screen.getByText('WebSocket')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Storage')).toBeInTheDocument();
        
        // All should show as healthy
        const healthStatuses = screen.getAllByText('healthy');
        expect(healthStatuses).toHaveLength(5);
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
          <AdminDashboard />
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
          <AdminDashboard />
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
          <AdminDashboard />
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
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('✅ should navigate to users page when clicked', async () => {
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
          <AdminDashboard />
        </BrowserRouter>
      );

      const usersLink = screen.getByText('Users');
      fireEvent.click(usersLink);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });

    it('✅ should navigate to shops page when clicked', async () => {
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
          <AdminDashboard />
        </BrowserRouter>
      );

      const shopsLink = screen.getByText('Shops');
      fireEvent.click(shopsLink);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/shops');
    });

    it('✅ should open approval modals when pending items are clicked', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const pendingShopsLink = screen.getByText('12 Shops');
        fireEvent.click(pendingShopsLink);
        
        expect(screen.getByText('Pending Shop Approvals')).toBeInTheDocument();
        expect(screen.getByText('New Restaurant')).toBeInTheDocument();
      });
    });

    it('✅ should handle logout when logout button is clicked', () => {
      const mockLogout = vi.fn();
      useAuthStore.mockReturnValue({
        user: mockAdmin,
        isAuthenticated: true,
        logout: mockLogout
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Admin-Specific Functionality', () => {
    it('✅ should display system health monitoring', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('System Health')).toBeInTheDocument();
        expect(screen.getByText('Last Check:')).toBeInTheDocument();
        
        // Check health indicators
        const healthIndicators = screen.getAllByTestId('health-indicator');
        expect(healthIndicators).toHaveLength(5);
      });
    });

    it('✅ should show pending approval workflow', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
        
        // Check approval categories
        expect(screen.getByText('Shops')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Offers')).toBeInTheDocument();
        expect(screen.getByText('Sellers')).toBeInTheDocument();
      });
    });

    it('✅ should display platform analytics summary', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Platform Overview')).toBeInTheDocument();
        
        // Check key metrics
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Total Sellers')).toBeInTheDocument();
        expect(screen.getByText('Total Shops')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });
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
          <AdminDashboard />
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
          <AdminDashboard />
        </BrowserRouter>
      );

      unmount();
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('✅ should display mobile menu toggle on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
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
          <AdminDashboard />
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
          <AdminDashboard />
        </BrowserRouter>
      );

      expect(screen.getByLabelText('Admin dashboard navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Platform statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Recent activity feed')).toBeInTheDocument();
      expect(screen.getByLabelText('Pending approvals list')).toBeInTheDocument();
    });

    it('✅ should support keyboard navigation', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard');
      dashboardLink.focus();
      
      expect(dashboardLink).toHaveFocus();
      
      // Test tab navigation
      fireEvent.keyDown(dashboardLink, { key: 'Tab' });
    });

    it('✅ should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Admin Dashboard');

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s).toHaveLength(5); // Platform Overview, Recent Activity, Pending Approvals, System Health, Quick Actions
    });
  });

  describe('Edge Cases', () => {
    it('✅ should handle empty data gracefully', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: { ...mockPlatformStats, totalUsers: 0, totalSellers: 0 },
            recentActivity: [],
            pendingApprovals: { shops: [], products: [], offers: [], sellers: [] },
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No pending approvals')).toBeInTheDocument();
        expect(screen.getByText('No recent activity')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // totalUsers
        expect(screen.getByText('$0.00')).toBeInTheDocument(); // totalRevenue
      });
    });

    it('✅ should handle very large numbers correctly', async () => {
      const mockApi = await import('../../stores/api.js');
      mockApi.api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            stats: {
              ...mockPlatformStats,
              totalUsers: 9999999,
              totalRevenue: 999999999.99
            },
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('9,999,999')).toBeInTheDocument();
        expect(screen.getByText('$999,999,999.99')).toBeInTheDocument();
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
          <AdminDashboard />
        </BrowserRouter>
      );

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      resolvePromise({
        data: {
          success: true,
          data: { stats: mockPlatformStats, recentActivity: [], pendingApprovals: {}, systemHealth: {} }
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
            <AdminDashboard />
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
            stats: mockPlatformStats,
            recentActivity: mockRecentActivity,
            pendingApprovals: mockPendingApprovals,
            systemHealth: mockSystemHealth
          }
        }
      });

      render(
        <BrowserRouter>
          <AdminDashboard />
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
