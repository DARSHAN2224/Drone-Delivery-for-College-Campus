import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import QRScanner from '../common/QRScanner';
import notificationService from '../../utils/notificationService';
import { api } from '../../stores/api.js';
const QRValidation = () => {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  
  const navigate = useNavigate();

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      if (notificationService.isNotificationSupported()) {
        await notificationService.initializePushNotifications();
        setNotificationPermission(notificationService.getNotificationPermission());
      }
    };

    initializeNotifications();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleQRSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      let response;
      
      if (isOnline) {
        // Online verification
        response = await api.post('/drone/verify-qr', {
          qrCode: qrCode.trim()
        });
      } else {
        // Offline verification
        response = await notificationService.handleOfflineQRVerification(qrCode.trim());
      }

      if (response.success) {
        setResult({
          success: true,
          message: isOnline ? 'Delivery verified successfully!' : response.message,
          orderDetails: response.data?.droneOrder
        });
        
        // Redirect to order history after a short delay
        setTimeout(() => {
          navigate('/order-history');
        }, 3000);
      }
    } catch (error) {
      console.error('QR verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = (e) => {
    setQrCode(e.target.value);
    setError('');
    setResult(null);
  };

  const toggleScanner = () => {
    setShowScanner(!showScanner);
    setError('');
    setResult(null);
  };

  const onScanSuccess = (scannedCode) => {
    setQrCode(scannedCode);
    setShowScanner(false);
    setError('');
    setResult(null);
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    setNotificationPermission(notificationService.getNotificationPermission());
    return granted;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Drone Delivery Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Scan or enter the QR code from your drone delivery to verify receipt
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Connection Status */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>
            {!isOnline && (
              <span className="text-xs text-gray-500">
                Verifications will be queued for when you're back online
              </span>
            )}
          </div>

          {/* Success Result */}
          {result?.success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{result.message}</p>
                  {result.orderDetails && (
                    <div className="mt-2 text-xs text-green-700">
                      <p>Order ID: {result.orderDetails.orderId}</p>
                      <p>Delivery Time: {new Date(result.orderDetails.actualDeliveryTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Input Form */}
          <form onSubmit={handleQRSubmit} className="space-y-4">
            <div>
              <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code
              </label>
              <div className="flex space-x-2">
                <input
                  id="qrCode"
                  type="text"
                  value={qrCode}
                  onChange={handleManualInput}
                  placeholder="Enter QR code manually"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleScanner}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !qrCode.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Delivery'}
            </button>
          </form>

          {/* Scanner Toggle */}
          {showScanner && (
            <QRScanner
              isOpen={showScanner}
              onClose={toggleScanner}
              onScan={onScanSuccess}
            />
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">How to verify delivery:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Wait for the drone to arrive at your location</li>
                    <li>Scan the QR code displayed on the drone or delivery package</li>
                    <li>Or manually enter the QR code if scanning isn't available</li>
                    <li>Click "Verify Delivery" to confirm receipt</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          {notificationService.isNotificationSupported() && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Push Notifications</h3>
                    <p className="text-xs text-yellow-700">
                      Get notified when your drone is nearby with QR codes
                    </p>
                  </div>
                </div>
                {notificationPermission === 'granted' ? (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Enabled</span>
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRValidation;
