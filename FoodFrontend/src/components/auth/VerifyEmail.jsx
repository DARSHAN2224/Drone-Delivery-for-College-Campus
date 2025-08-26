import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationHelpers } from '../../utils/notificationHelpers';
import { Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const { verifyEmail, resendVerificationCode } = useAuthStore();
  const { onSuccess, onError, onInfo } = useNotificationHelpers();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const role = searchParams.get('role') || 'user';

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
  const RESEND_COOLDOWN = 60; // 1 minute cooldown

  useEffect(() => {
    // Check if user is locked out
    const lockoutEnd = localStorage.getItem('verificationLockout');
    if (lockoutEnd) {
      const remaining = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem('verificationLockout');
      }
    }

    // Start resend countdown
    const lastResend = localStorage.getItem('lastVerificationResend');
    if (lastResend) {
      const elapsed = Math.ceil((Date.now() - parseInt(lastResend)) / 1000);
      if (elapsed < RESEND_COOLDOWN) {
        setResendCountdown(RESEND_COOLDOWN - elapsed);
      }
    }

    // Auto-focus first input
    const firstInput = document.getElementById('verification-0');
    if (firstInput) firstInput.focus();
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

  const handleInputChange = (index, value) => {
    if (isLocked) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`verification-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all digits are filled
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify();
      }
    }
  };

  const handlePaste = (startIndex, e) => {
    if (isLocked) return;
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || window.clipboardData?.getData('Text') || '').replace(/\D/g, '');
    if (!pasted) return;

    const newCode = [...verificationCode];
    for (let i = 0; i < 6 - startIndex && i < pasted.length; i++) {
      newCode[startIndex + i] = pasted[i];
    }
    setVerificationCode(newCode);

    const lastFilled = Math.min(startIndex + pasted.length - 1, 5);
    const nextIndex = Math.min(lastFilled + 1, 5);
    setTimeout(() => {
      const nextInput = document.getElementById(`verification-${nextIndex}`);
      nextInput?.focus();
    }, 0);

    const full = newCode.join('');
    if (full.length === 6 && !full.includes('')) {
      setTimeout(() => handleVerify(), 0);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    if (isLocked) return;
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    console.log('Attempting to verify email:', { email, code, role });

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await verifyEmail(email, code, role);
      console.log('Verification result:', result);
      
      if (result.success) {
        setSuccess('Email verified successfully! Redirecting...');
        onSuccess('Email Verified', 'Your email has been verified successfully.');
        setAttempts(0);
        
        // After verification, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        console.log('Verification failed:', result.error);
        onError('Verification Failed', result.error || 'Invalid verification code.');
        handleVerificationFailure();
      }
    } catch (error) {
      console.error('Verification error:', error);
      onError('Verification Failed', 'An unexpected error occurred.');
      handleVerificationFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationFailure = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock out user
      const lockoutEnd = Date.now() + (LOCKOUT_DURATION * 1000);
      localStorage.setItem('verificationLockout', lockoutEnd.toString());
      setIsLocked(true);
      setLockoutTime(LOCKOUT_DURATION);
      setError(`Too many failed attempts. Please wait ${Math.ceil(LOCKOUT_DURATION / 60)} minutes before trying again.`);
    } else {
      setError(`Invalid verification code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      // Clear the form
      setVerificationCode(['', '', '', '', '', '']);
      document.getElementById('verification-0')?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;
    
    setIsResending(true);
    setError('');
    
    console.log('Attempting to resend verification code:', { email, role });
    
    try {
      const result = await resendVerificationCode(email, role);
      console.log('Resend result:', result);
      
      if (result.success) {
        setSuccess('Verification code resent successfully! Check your email.');
        onInfo('Code Sent', 'A new verification code has been sent to your email.');
        setResendCountdown(RESEND_COOLDOWN);
        localStorage.setItem('lastVerificationResend', Date.now().toString());
        
        // Reset attempts on resend
        setAttempts(0);
        setIsLocked(false);
        setLockoutTime(0);
        localStorage.removeItem('verificationLockout');
      } else {
        console.log('Resend failed:', result.error);
        onError('Resend Failed', result.error || 'Failed to resend verification code');
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      onError('Resend Failed', 'Failed to resend verification code. Please try again.');
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h2>
            <p className="text-gray-600 mb-6">Email verification requires a valid email address.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-6 py-2"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>

          {/* Verification Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-2 mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`verification-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                  disabled={isLocked}
                  className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    isLocked 
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>
            
            {/* Attempts Warning */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div className="text-center mb-4">
                <p className="text-sm text-orange-600">
                  {MAX_ATTEMPTS - attempts} attempts remaining
                </p>
              </div>
            )}

            {/* Lockout Warning */}
            {isLocked && (
              <div className="text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="w-5 h-5 text-red-600 inline mr-2" />
                <span className="text-sm text-red-800">
                  Account temporarily locked. Try again in {formatTime(lockoutTime)}
                </span>
              </div>
            )}
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || isLocked || verificationCode.join('').length !== 6}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
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
                'Resend Code'
              )}
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">Check your spam folder if you don't see the email</p>
              <p>Verification codes expire after 10 minutes</p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
