import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { useAuthStore } from '../../stores/authStore';

// Mock the auth store
const mockLogin = vi.fn();
const mockClearError = vi.fn();

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: mockLogin,
    clearError: mockClearError
  }))
}));

// Mock the router
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the API
global.fetch = vi.fn();

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('🔐 Login Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockClear();
    mockClearError.mockClear();
    mockNavigate.mockClear();
  });

  describe('Component Rendering', () => {
    it('✅ should render login form correctly', () => {
      renderLogin();
      
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('✅ should display form fields with correct attributes', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
      expect(emailInput).toBeRequired();
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
      expect(passwordInput).toBeRequired();
    });

    it('✅ should display navigation links correctly', () => {
      renderLogin();
      
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('❌ should show error for empty email submission', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('❌ should show error for empty password submission', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('❌ should show error for invalid email format', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('❌ should show error for password too short', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('✅ should not show errors for valid input', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Blur events to trigger validation
      fireEvent.blur(emailInput);
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('✅ should call login function with valid credentials', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('❌ should not submit form with invalid data', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    it('✅ should clear previous errors on new submission attempt', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // First submission with invalid data
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
      
      // Fill in valid data and submit again
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('✅ should show loading state during submission', async () => {
      // Mock loading state
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        login: mockLogin,
        clearError: mockClearError
      });
      
      renderLogin();
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('✅ should disable form during loading', async () => {
      // Mock loading state
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        login: mockLogin,
        clearError: mockClearError
      });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /signing in/i });
      
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('✅ should display authentication errors from store', () => {
      const errorMessage = 'Invalid email or password';
      
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        login: mockLogin,
        clearError: mockClearError
      });
      
      renderLogin();
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('✅ should clear error when user starts typing', async () => {
      const errorMessage = 'Invalid email or password';
      
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        login: mockLogin,
        clearError: mockClearError
      });
      
      renderLogin();
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('✅ should display different types of errors', () => {
      const errors = [
        'Invalid email or password',
        'Account is locked due to multiple failed attempts',
        'Email not verified',
        'Account is deactivated',
        'Network error occurred'
      ];
      
      errors.forEach(errorMessage => {
        vi.mocked(useAuthStore).mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
          login: mockLogin,
          clearError: mockClearError
        });
        
        const { unmount } = renderLogin();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Navigation', () => {
    it('✅ should navigate to signup page when signup link is clicked', () => {
      renderLogin();
      
      const signupLink = screen.getByText(/sign up/i);
      fireEvent.click(signupLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('✅ should navigate to forgot password page when link is clicked', () => {
      renderLogin();
      
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      fireEvent.click(forgotPasswordLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('✅ should redirect to dashboard if already authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: '1', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: mockLogin,
        clearError: mockClearError
      });
      
      renderLogin();
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('User Experience', () => {
    it('✅ should focus email input on component mount', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();
    });

    it('✅ should allow form submission with Enter key', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit with Enter key on password input
      fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it('✅ should show password visibility toggle', () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      
      expect(toggleButton).toBeInTheDocument();
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('✅ should remember email in localStorage if remember me is checked', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(rememberMeCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        // Check if email was saved to localStorage
        expect(localStorage.setItem).toHaveBeenCalledWith('rememberedEmail', 'test@example.com');
      });
    });

    it('✅ should auto-fill email if previously remembered', () => {
      // Mock localStorage with remembered email
      localStorage.getItem.mockReturnValue('test@example.com');
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Accessibility', () => {
    it('✅ should have proper ARIA labels and roles', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveAttribute('type', 'submit');
    });

    it('✅ should have proper form structure', () => {
      renderLogin();
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(form).toContainElement(emailInput);
      expect(form).toContainElement(passwordInput);
    });

    it('✅ should support keyboard navigation', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Tab navigation
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(passwordInput).toHaveFocus();
      
      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('✅ should handle very long email addresses', async () => {
      renderLogin();
      
      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: longEmail,
          password: 'password123'
        });
      });
    });

    it('✅ should handle special characters in password', async () => {
      renderLogin();
      
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: specialPassword
        });
      });
    });

    it('✅ should handle rapid form submissions', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Rapid clicks on submit button
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Should only call login once despite multiple clicks
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('✅ should handle network errors gracefully', async () => {
      // Mock network error
      mockLogin.mockRejectedValueOnce(new Error('Network error'));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Performance', () => {
    it('✅ should render quickly', () => {
      const startTime = performance.now();
      renderLogin();
      const endTime = performance.now();
      
      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('✅ should handle large amounts of input efficiently', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      const startTime = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } });
        fireEvent.change(passwordInput, { target: { value: `password${i}` } });
      }
      
      const endTime = performance.now();
      
      // Should handle rapid input changes efficiently
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
