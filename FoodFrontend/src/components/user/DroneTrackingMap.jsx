import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plane, 
  Truck, 
  Clock, 
  Navigation, 
  Battery, 
  Zap,
  RefreshCw,
  Play,
  Square
} from 'lucide-react';

const DroneTrackingMap = ({ orderId, deliveryType = 'drone' }) => {
  const [droneLocation, setDroneLocation] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('en_route');
  const [eta, setEta] = useState(15);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [mockMode, setMockMode] = useState(process.env.NODE_ENV === 'development');
  const trackingInterval = useRef(null);

  // Initialize tracking data
  useEffect(() => {
    if (orderId) {
      initializeTracking();
    }
    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, [orderId]);

  const initializeTracking = async () => {
    if (mockMode) {
      // Development: Generate mock drone data
      console.log('🚁 Development mode: Initializing mock drone tracking');
      
      const mockLocation = {
        lat: 12.9716 + (Math.random() - 0.5) * 0.01,
        lng: 77.5946 + (Math.random() - 0.5) * 0.01
      };
      
      setDroneLocation(mockLocation);
      setDeliveryStatus(['en_route', 'nearby', 'arrived'][Math.floor(Math.random() * 3)]);
      setEta(Math.floor(Math.random() * 20) + 5);
      
      // Generate mock tracking history
      const history = [];
      for (let i = 0; i < 10; i++) {
        history.push({
          timestamp: new Date(Date.now() - (10 - i) * 60000),
          location: {
            lat: mockLocation.lat + (Math.random() - 0.5) * 0.002,
            lng: mockLocation.lng + (Math.random() - 0.5) * 0.002
          },
          status: ['en_route', 'nearby', 'arrived'][Math.floor(Math.random() * 3)]
        });
      }
      setTrackingHistory(history);
    } else {
      // Production: Fetch real drone data
      try {
        // This would be your real API call
        const response = await fetch(`/api/drone/track/${orderId}`);
        const data = await response.json();
        setDroneLocation(data.location);
        setDeliveryStatus(data.status);
        setEta(data.eta);
      } catch (error) {
        console.error('Failed to fetch drone tracking data:', error);
      }
    }
  };

  const startLiveTracking = () => {
    setIsLiveTracking(true);
    
    if (mockMode) {
      // Development: Simulate live tracking updates
      trackingInterval.current = setInterval(() => {
        setDroneLocation(prev => {
          if (!prev) return prev;
          
          const newLocation = {
            lat: prev.lat + (Math.random() - 0.5) * 0.0005,
            lng: prev.lng + (Math.random() - 0.5) * 0.0005
          };
          
          // Add to tracking history
          setTrackingHistory(prev => [
            ...prev.slice(-9), // Keep last 9
            {
              timestamp: new Date(),
              location: newLocation,
              status: deliveryStatus
            }
          ]);
          
          return newLocation;
        });
        
        // Update ETA
        setEta(prev => Math.max(1, prev - 1));
        
        // Randomly change status
        if (Math.random() < 0.1) {
          const statuses = ['en_route', 'nearby', 'arrived'];
          const currentIndex = statuses.indexOf(deliveryStatus);
          if (currentIndex < statuses.length - 1) {
            setDeliveryStatus(statuses[currentIndex + 1]);
          }
        }
      }, 3000); // Update every 3 seconds
    } else {
      // Production: Real-time API polling
      trackingInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/drone/track/${orderId}`);
          const data = await response.json();
          setDroneLocation(data.location);
          setDeliveryStatus(data.status);
          setEta(data.eta);
        } catch (error) {
          console.error('Live tracking update failed:', error);
        }
      }, 5000); // Update every 5 seconds
    }
  };

  const stopLiveTracking = () => {
    setIsLiveTracking(false);
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_route': return 'text-blue-600 bg-blue-50';
      case 'nearby': return 'text-yellow-600 bg-yellow-50';
      case 'arrived': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_route': return <Plane className="w-4 h-4" />;
      case 'nearby': return <Navigation className="w-4 h-4" />;
      case 'arrived': return <MapPin className="w-4 h-4" />;
      default: return <Truck className="w-4 h-4" />;
    }
  };

  if (!droneLocation) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading drone tracking...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-500" />
            Live Drone Tracking
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Order #{orderId?.slice(-8)} • {deliveryType} Delivery
          </p>
        </div>
        
        {/* Live Tracking Controls */}
        <div className="flex items-center gap-3">
          {mockMode && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border">
              🚁 Mock Mode
            </span>
          )}
          
          {!isLiveTracking ? (
            <button
              onClick={startLiveTracking}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Live Tracking
            </button>
          ) : (
            <button
              onClick={stopLiveTracking}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deliveryStatus)}`}>
              {getStatusIcon(deliveryStatus)}
              <span className="ml-1">{deliveryStatus.replace('_', ' ').toUpperCase()}</span>
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {deliveryStatus === 'en_route' && 'Drone is on the way to your location'}
            {deliveryStatus === 'nearby' && 'Drone is approaching your delivery point'}
            {deliveryStatus === 'arrived' && 'Drone has arrived at your location'}
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Estimated Arrival</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{eta} min</p>
          <p className="text-xs text-green-600">ETA updates in real-time</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Current Location</span>
          </div>
          <p className="text-xs text-purple-700 font-mono">
            Lat: {droneLocation.lat.toFixed(6)}
          </p>
          <p className="text-xs text-purple-700 font-mono">
            Lng: {droneLocation.lng.toFixed(6)}
          </p>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Drone Location Map</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Drone</span>
            <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
            <span>Your Location</span>
          </div>
        </div>
        
        {/* Simplified Map Visualization */}
        <div className="relative bg-gray-100 rounded-lg h-64 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Drone Position */}
          {droneLocation && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${(droneLocation.lng - 77.5946) * 10000}px, ${(droneLocation.lat - 12.9716) * 10000}px)`
              }}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <Plane className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Drone
                </div>
              </div>
            </div>
          )}
          
          {/* Your Location (Center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              You
            </div>
          </div>
          
          {/* Tracking Path */}
          {trackingHistory.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={trackingHistory.map(point => 
                  `${50 + (point.location.lng - 77.5946) * 10000},${50 + (point.location.lat - 12.9716) * 10000}`
                ).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          {mockMode ? 'Mock map showing simulated drone movement' : 'Real-time drone location tracking'}
        </p>
      </div>

      {/* Tracking History */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Tracking History</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {trackingHistory.slice().reverse().map((point, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">
                {point.timestamp.toLocaleTimeString()}
              </span>
              <span className="text-gray-500">
                ({point.location.lat.toFixed(4)}, {point.location.lng.toFixed(4)})
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(point.status)}`}>
                {point.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Updates Info */}
      {isLiveTracking && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Tracking Active</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {mockMode 
              ? 'Mock drone location updates every 3 seconds'
              : 'Real drone location updates every 5 seconds'
            }
          </p>
        </div>
      )}

      {/* Development Mode Info */}
      {mockMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            🚁 <strong>Development Mode:</strong> This is simulated drone tracking data. 
            In production, you'll see real drone locations and live updates.
          </p>
        </div>
      )}
    </div>
  );
};

export default DroneTrackingMap;
