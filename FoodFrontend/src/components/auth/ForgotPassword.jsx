import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const { forgotPassword } = useAuthStore();

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds
  const RESEND_COOLDOWN = 5 * 60; // 5 minutes cooldown

  const roles = [
    { value: 'user', label: 'User', icon: '👤', description: 'Regular customer account' },
    { value: 'seller', label: 'Seller', icon: '🏪', description: 'Shop owner account' },
    { value: 'admin', label: 'Admin', icon: '🛡️', description: 'Platform administrator' }
  ];

  useEffect(() => {
    // Check if user is locked out
    const lockoutEnd = localStorage.getItem('forgotPasswordLockout');
    if (lockoutEnd) {
      const remaining = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem('forgotPasswordLockout');
      }
    }

    // Start resend countdown
    const lastResend = localStorage.getItem('lastForgotPasswordResend');
    if (lastResend) {
      const elapsed = Math.ceil((Date.now() - parseInt(lastResend)) / 1000);
      if (elapsed < RESEND_COOLDOWN) {
        setResendCountdown(RESEND_COOLDOWN - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    if (lockoutTime > 0) {
      timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, lockoutTime]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(email, role);
      
      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email!');
        setAttempts(0);
        
        // Start resend countdown
        setResendCountdown(RESEND_COOLDOWN);
        localStorage.setItem('lastForgotPasswordResend', Date.now().toString());
      } else {
        handleFailure();
      }
    } catch (error) {
      handleFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailure = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock out user
      const lockoutEnd = Date.now() + (LOCKOUT_DURATION * 1000);
      localStorage.setItem('forgotPasswordLockout', lockoutEnd.toString());
      setIsLocked(true);
      setLockoutTime(LOCKOUT_DURATION);
      setError(`Too many failed attempts. Please wait ${Math.ceil(LOCKOUT_DURATION / 60)} minutes before trying again.`);
    } else {
      setError(`Invalid email or role. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending || isLocked) return;
    
    setIsResending(true);
    setError('');
    
    try {
      const result = await forgotPassword(email, role);
      
      if (result.success) {
        setSuccess('Password reset instructions resent successfully!');
        setResendCountdown(RESEND_COOLDOWN);
        localStorage.setItem('lastForgotPasswordResend', Date.now().toString());
        
        // Reset attempts on resend
        setAttempts(0);
        setIsLocked(false);
        setLockoutTime(0);
        localStorage.removeItem('forgotPasswordLockout');
      } else {
        setError(result.error || 'Failed to resend password reset instructions');
      }
    } catch (error) {
      setError('Failed to resend password reset instructions. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and role to receive password reset instructions
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((roleOption) => {
                const isSelected = role === roleOption.value;
                
                return (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() => setRole(roleOption.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{roleOption.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{roleOption.label}</div>
                        <div className="text-sm text-gray-500">{roleOption.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    isLocked 
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Lockout Warning */}
            {isLocked && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">
                    Account temporarily locked. Try again in {formatTime(lockoutTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Attempts Warning */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm text-orange-800">
                    {MAX_ATTEMPTS - attempts} attempts remaining
                  </span>
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLocked || !email.trim()}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Sending Instructions...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          {/* Resend Instructions */}
          {success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResend}
                disabled={resendCountdown > 0 || isResending || isLocked}
                className="text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Sending...
                  </div>
                ) : resendCountdown > 0 ? (
                  `Resend in ${formatTime(resendCountdown)}`
                ) : (
                  'Resend Instructions'
                )}
              </button>
            </div>
          )}

          {/* Security Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">🔒 Your security is our priority</p>
              <p>Password reset links expire after 1 hour</p>
              <p>Check your spam folder if you don't see the email</p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
