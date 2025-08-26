import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Truck, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = L.divIcon({
  className: 'custom-drone-icon',
  html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to update map view when drone location changes
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
}

const DroneTracking = ({ orderId }) => {
  const [droneLocation, setDroneLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchDroneLocation();
      // Simulate real-time updates every 10 seconds
      const interval = setInterval(fetchDroneLocation, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchDroneLocation = async () => {
    try {
      // In a real implementation, this would fetch from your drone tracking API
      // For now, we'll simulate with mock data
      const mockDroneLocation = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.01, // Delhi coordinates with some randomness
        lng: 77.2090 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date()
      };

      const mockDeliveryLocation = {
        lat: 28.6139 + 0.005,
        lng: 77.2090 + 0.005,
        address: '123 Main Street, Delhi'
      };

      const mockPickupLocation = {
        lat: 28.6139 - 0.005,
        lng: 77.2090 - 0.005,
        address: '456 Restaurant Lane, Delhi'
      };

      setDroneLocation(mockDroneLocation);
      setDeliveryLocation(mockDeliveryLocation);
      setPickupLocation(mockPickupLocation);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch drone location:', error);
      setError('Failed to load drone tracking information');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading drone location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchDroneLocation}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!droneLocation || !deliveryLocation || !pickupLocation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No tracking information available</p>
      </div>
    );
  }

  const mapCenter = droneLocation;

  return (
    <div className="space-y-4">
      {/* Status Information */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Drone in Transit</h3>
              <p className="text-sm text-gray-500">
                Estimated arrival: {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {droneLocation.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Live Tracking</h3>
          <p className="text-sm text-gray-500">Real-time drone location and delivery route</p>
        </div>
        
        <div className="h-96 relative">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Pickup Location Marker */}
            <Marker position={pickupLocation} icon={L.Icon.Default()}>
              <Popup>
                <div className="text-center">
                  <MapPin className="h-4 w-4 text-green-600 mx-auto mb-1" />
                  <p className="font-medium">Pickup Location</p>
                  <p className="text-sm text-gray-600">{pickupLocation.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* Delivery Location Marker */}
            <Marker position={deliveryLocation} icon={L.Icon.Default()}>
              <Popup>
                <div className="text-center">
                  <MapPin className="h-4 w-4 text-red-600 mx-auto mb-1" />
                  <p className="font-medium">Delivery Location</p>
                  <p className="text-sm text-gray-600">{deliveryLocation.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* Drone Location Marker */}
            <Marker position={droneLocation} icon={droneIcon}>
              <Popup>
                <div className="text-center">
                  <Truck className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium">Drone Location</p>
                  <p className="text-sm text-gray-600">
                    Last updated: {droneLocation.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>

            <MapUpdater center={mapCenter} />
          </MapContainer>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Pickup Location</h4>
          </div>
          <p className="text-sm text-gray-600">{pickupLocation.address}</p>
          <p className="text-xs text-gray-400 mt-1">
            Coordinates: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-red-100 rounded-full">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900">Delivery Location</h4>
          </div>
          <p className="text-sm text-gray-600">{deliveryLocation.address}</p>
          <p className="text-xs text-gray-400 mt-1">
            Coordinates: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Delivery Instructions</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• The drone will arrive at your specified delivery location</li>
              <li>• Please be available to receive your order</li>
              <li>• Scan the QR code on the drone or package to confirm delivery</li>
              <li>• Keep a safe distance while the drone is landing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneTracking;
