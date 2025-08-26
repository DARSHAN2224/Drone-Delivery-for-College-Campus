import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../stores/api.js';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Plane,
  User,
  Store,
  Route,
  Phone,
  Car
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import QRScanner from '../common/QRScanner';
import DroneTrackingMap from './DroneTrackingMap';
import notificationService from '../../utils/notificationService';

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mockMode, setMockMode] = useState(process.env.NODE_ENV === 'development');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mockMode) {
        // Development: Use mock data
        console.log('🚁 Development mode: Loading mock delivery data');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockOrder = generateMockOrder();
        const mockDelivery = generateMockDelivery();
        
        setOrder(mockOrder);
        setDelivery(mockDelivery);
        setQrCode(mockDelivery.qrCode);
        
        console.log('🚁 Mock delivery data loaded:', { order: mockOrder, delivery: mockDelivery });
      } else {
        // Production: Real API calls
        const orderRes = await api.get(`/orders/${orderId}`);
        const orderData = orderRes?.data?.data?.order;
        setOrder(orderData);

        const deliveryRes = await api.get(`/delivery/track/${orderId}`);
        const deliveryData = deliveryRes?.data?.data?.deliveries?.[0];
        setDelivery(deliveryData);

        // If it's a drone delivery, get the QR code
        if (orderData?.deliveryType === 'drone' && deliveryData?.qrCode) {
          setQrCode(deliveryData.qrCode);
        }
      }
    } catch (e) {
      if (mockMode) {
        console.log('🚁 Mock mode: Simulating error for testing');
        setError('Mock error simulation for testing');
      } else {
        setError(e?.response?.data?.message || 'Failed to load delivery information');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (orderId) {
      loadData();
    }
  }, [orderId]);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock data generation for development testing
  const generateMockOrder = () => ({
    _id: orderId || 'mock-order-123',
    orderId: orderId || 'ORD-0123',
    customerName: 'Mock Customer',
    deliveryType: 'drone',
    totalAmount: 299.99,
    status: 'out_for_delivery',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1800000).toISOString(),
    items: [
      { name: 'Mock Product 1', quantity: 2, price: 149.99 },
      { name: 'Mock Product 2', quantity: 1, price: 99.99 }
    ]
  });

  const generateMockDelivery = () => ({
    _id: 'mock-delivery-123',
    orderId: orderId || 'ORD-0123',
    status: 'nearby',
    qrCode: `DRONE-${orderId?.slice(-4) || 'TEST'}-${Date.now().toString(36)}`,
    currentLocation: {
      lat: 12.9716 + (Math.random() - 0.5) * 0.01,
      lng: 77.5946 + (Math.random() - 0.5) * 0.01
    },
    etaMinutes: Math.floor(Math.random() * 15) + 5,
    rider: {
      name: 'Mock Drone Pilot',
      vehicle: 'Drone Delivery',
      phone: '+91 9876543210',
      rating: 4.8
    },
    lastUpdated: new Date().toISOString()
  });

  const verifyQRCode = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    try {
      setError(null);
      
      if (isOnline) {
        // Online verification
        await api.post('/delivery/verify-qr', {
          qrCode: qrCode.trim(),
          orderId
        });
      } else {
        // Offline verification
        await notificationService.handleOfflineQRVerification(qrCode.trim(), orderId);
      }
      
      // Refresh data after successful verification
      await loadData();
      setQrCode('');
      setShowQRScanner(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'QR verification failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'text-gray-600 bg-gray-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'picked_up': return 'text-purple-600 bg-purple-50';
      case 'en_route': return 'text-indigo-600 bg-indigo-50';
      case 'nearby': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unassigned': return <Package className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'picked_up': return <Truck className="w-4 h-4" />;
      case 'en_route': return <Route className="w-4 h-4" />;
      case 'nearby': return <MapPin className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getDeliveryModeIcon = (mode) => {
    return mode === 'drone' ? <Plane className="w-5 h-5" /> : <Truck className="w-5 h-5" />;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getETA = (etaMinutes) => {
    if (!etaMinutes) return 'N/A';
    const now = new Date();
    const eta = new Date(now.getTime() + etaMinutes * 60000);
    return eta.toLocaleTimeString();
  };

  const getTimelineSteps = () => {
    const steps = [
      { key: 'unassigned', label: 'Order Placed', description: 'Your order has been confirmed' },
      { key: 'assigned', label: 'Assigned', description: 'Delivery partner assigned' },
      { key: 'picked_up', label: 'Picked Up', description: 'Order picked up from shop' },
      { key: 'en_route', label: 'En Route', description: 'On the way to you' },
      { key: 'nearby', label: 'Nearby', description: 'Almost at your location' },
      { key: 'delivered', label: 'Delivered', description: 'Order received successfully' }
    ];

    const currentIndex = steps.findIndex(step => step.key === delivery?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading delivery information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Delivery</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Tracking</h1>
            <p className="text-gray-600">Track your order #{orderId?.slice(-8)}</p>
          </div>
          
          {/* Mock Mode Toggle */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Mock Mode:</span>
              <button
                onClick={() => setMockMode(!mockMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mockMode 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {mockMode ? '🚁 Mock ON' : '🚁 Mock OFF'}
              </button>
              {mockMode && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Using mock data
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="flex items-center gap-2">
            {getDeliveryModeIcon(order.deliveryType)}
            <span className="text-sm font-medium capitalize">{order.deliveryType} Delivery</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-600">Total Amount</label>
            <p className="font-medium">${order.totalPrice}</p>
          </div>
          <div>
            <label className="text-gray-600">Items</label>
            <p className="font-medium">{order.totalQuantity}</p>
          </div>
          <div>
            <label className="text-gray-600">Order Date</label>
            <p className="font-medium">{formatTime(order.createdAt)}</p>
          </div>
          <div>
            <label className="text-gray-600">Delivery Status</label>
            <p className="font-medium capitalize">{order.deliveryStatus || 'pending'}</p>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Delivery Progress</h2>
        
        <div className="space-y-4">
          {getTimelineSteps().map((step, index) => (
            <div key={step.key} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-medium ${
                  step.completed ? 'text-green-700' : step.current ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                
                {/* Show current status details */}
                {step.current && delivery && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    {delivery.rider && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {delivery.rider.name}
                        </span>
                        {delivery.rider.phone && (
                          <a 
                            href={`tel:${delivery.rider.phone}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Phone className="w-4 h-4 inline mr-1" />
                            {delivery.rider.phone}
                          </a>
                        )}
                      </div>
                    )}
                    
                    {delivery.currentLocation && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900">
                          Current Location: {delivery.currentLocation.lat?.toFixed(4)}, {delivery.currentLocation.lng?.toFixed(4)}
                        </span>
                      </div>
                    )}
                    
                    {delivery.etaMinutes && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900">
                          Estimated arrival: {getETA(delivery.etaMinutes)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Display for Drone Delivery */}
      {order.deliveryType === 'drone' && delivery?.qrCode && (
        <div className="mb-6">
          <QRCodeDisplay 
            qrCode={delivery.qrCode} 
            orderId={orderId}
            onCopy={() => setQrCode(delivery.qrCode)}
          />
        </div>
      )}

      {/* QR Code Scanner for Drone Delivery */}
      {order.deliveryType === 'drone' && delivery?.status === 'nearby' && delivery?.status !== 'delivered' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {/* Connection Status */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Drone Delivery Confirmation</h2>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Your drone is nearby! Enter the QR code from your drone to confirm delivery.
            {!isOnline && (
              <span className="text-orange-600 text-sm block mt-1">
                ⚠️ You're offline. Verification will be queued for when you're back online.
              </span>
            )}
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Enter the QR code from your drone"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowQRScanner(!showQRScanner)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 inline mr-1" />
                  {showQRScanner ? 'Hide' : 'Show'} Scanner
                </button>
              </div>
            </div>
            
            {showQRScanner && (
              <QRScanner
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={(scannedCode) => {
                  setQrCode(scannedCode);
                  setShowQRScanner(false);
                }}
              />
            )}
            
            {/* QR Code Display (if available) */}
            {delivery?.qrCode && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm font-medium">Your QR Code:</span>
                  <code className="text-xs bg-green-100 px-2 py-1 rounded">{delivery.qrCode}</code>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Use this code to confirm delivery when your drone arrives.
                </p>
              </div>
            )}
            
            <button
              onClick={verifyQRCode}
              disabled={!qrCode.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Confirm Delivery
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Drone Tracking Map */}
      {order.deliveryType === 'drone' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <DroneTrackingMap 
            orderId={orderId} 
            deliveryType="drone" 
          />
        </div>
      )}

      {/* Delivery Details */}
      {delivery && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Status Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {getStatusIcon(delivery.status)}
                    <span className="ml-1">{delivery.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Mode:</span>
                  <span className="font-medium capitalize">{delivery.deliveryMode || 'regular'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatTime(delivery.updatedAt)}</span>
                </div>
              </div>
            </div>
            
            {delivery.rider && (
              <div>
                <h3 className="font-medium mb-3">Delivery Partner</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{delivery.rider.name}</span>
                  </div>
                  {delivery.rider.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <a 
                        href={`tel:${delivery.rider.phone}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {delivery.rider.phone}
                      </a>
                    </div>
                  )}
                  {delivery.rider.vehicle && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{delivery.rider.vehicle}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Route History */}
          {delivery.route && delivery.route.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Route History</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {delivery.route.map((point, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    {idx + 1}. {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)} - {formatTime(point.timestamp)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 text-center space-x-4">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh Status
        </button>
        
        {/* Test QR Generation Button (Development Only) */}
        {process.env.NODE_ENV === 'development' && order?.deliveryType === 'drone' && (
          <button
            onClick={async () => {
              try {
                await api.post(`/delivery/mock-qr/${orderId}`);
                await loadData();
              } catch (e) {
                console.error('Failed to generate test QR:', e);
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            Generate Test QR
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
