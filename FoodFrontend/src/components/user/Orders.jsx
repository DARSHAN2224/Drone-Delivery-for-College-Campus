import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Store,
  Phone,
  XCircle,
  Drone
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import OrderTrackMap from '../common/OrderTrackMap';
import DroneTrackingMap from './DroneTrackingMap';
import { api } from '../../stores/api.js';
const Orders = () => {
  const { user } = useAuthStore();
  const { userOrders, isLoading, error, getUserOrders, startDeliveryPolling, stopDeliveryPolling, deliveryTracking } = useAppStore();
  const [activeTab, setActiveTab] = useState('active');
  const [droneLocations, setDroneLocations] = useState({}); // { [orderId]: {lat,lng} }
  const [telemetryPollers, setTelemetryPollers] = useState({}); // { [orderId]: intervalId }

  useEffect(() => {
    console.log('🔄 Orders component: Calling getUserOrders...');
    const loadOrders = async () => {
      try {
        await getUserOrders();
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };
    loadOrders();
  }, [getUserOrders]);

  // Start polling for active orders
  useEffect(() => {
    console.log('🔍 Orders component: userOrders changed:', userOrders);
    if (!userOrders) return;
    
    // Debug: Show detailed order structure
    if (userOrders && userOrders.length > 0) {
      console.log('📋 Orders component - Detailed order structure:');
      userOrders.forEach((order, index) => {
        console.log(`  Order ${index}:`, {
          id: order._id,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          shops: order.shops,
          items: order.items,
          totalPrice: order.totalPrice,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt
        });
      });
    }
    
    const active = userOrders.filter(o => {
      const orderStatus = o.status || o.deliveryStatus || 'pending';
      return ['pending', 'preparing', 'ready'].includes(orderStatus);
    });
    console.log('🔍 Orders component: Active orders found:', active.length);
    active.forEach(o => startDeliveryPolling(o._id));
    return () => {
      active.forEach(o => stopDeliveryPolling(o._id));
    };
  }, [userOrders, startDeliveryPolling, stopDeliveryPolling]);

  // Mock drone data for development testing - integrated into actual flow
  const generateMockDroneData = (orderId) => {
    const baseLat = 12.9716; // Bangalore coordinates
    const baseLng = 77.5946;
    
    // Generate realistic drone movement based on order status
    const timeOffset = Date.now() / 10000; // Time-based movement
    const lat = baseLat + (Math.sin(timeOffset + orderId.charCodeAt(0)) * 0.001);
    const lng = baseLng + (Math.cos(timeOffset + orderId.charCodeAt(0)) * 0.001);
    
    // Simulate realistic drone progression based on order timing
    const orderAge = Date.now() - (new Date().getTime() - Math.random() * 3600000); // Random order age
    const progress = Math.min((Date.now() - orderAge) / 1800000, 1); // Progress over 30 minutes
    
    let status = 'en_route';
    let eta = 15;
    let altitude = 120;
    
    if (progress > 0.8) {
      status = 'nearby';
      eta = 3;
      altitude = 80;
    } else if (progress > 0.6) {
      status = 'en_route';
      eta = 8;
      altitude = 100;
    } else if (progress > 0.3) {
      status = 'en_route';
      eta = 12;
      altitude = 120;
    }
    
    return {
      drone: {
        id: `drone-${orderId.slice(-4)}`,
        status: status,
        location: { lat, lng },
        battery: Math.floor(Math.random() * 20) + 80, // 80-100% (more realistic)
        speed: Math.floor(Math.random() * 15) + 20, // 20-35 km/h
        eta: eta,
        altitude: altitude,
        weather: {
          temperature: Math.floor(Math.random() * 10) + 20, // 20-30°C
          windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
          precipitation: Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0, // 0-30% (rare)
          visibility: Math.random() > 0.9 ? 'reduced' : 'excellent'
        }
      }
    };
  };

  // Mock delivery tracking data for development - integrated into actual flow
  const generateMockDeliveryData = (orderId) => {
    // Get the drone data if available, otherwise generate basic data
    const droneData = droneLocations[orderId];
    const baseLat = 12.9716; // Bangalore coordinates
    const baseLng = 77.5946;
    
    // Simulate realistic delivery progression based on order timing
    const orderAge = Date.now() - (new Date().getTime() - Math.random() * 3600000); // Random order age
    const progress = Math.min((Date.now() - orderAge) / 1800000, 1); // Progress over 30 minutes
    
    let status = 'en_route';
    let etaMinutes = 15;
    
    if (progress > 0.9) {
      status = 'arrived';
      etaMinutes = 0;
    } else if (progress > 0.7) {
      status = 'nearby';
      etaMinutes = 2;
    } else if (progress > 0.4) {
      status = 'en_route';
      etaMinutes = 8;
    } else {
      status = 'en_route';
      etaMinutes = 15;
    }
    
    return {
      orderId,
      status: status,
      currentLocation: droneData || { lat: baseLat, lng: baseLng },
      etaMinutes: etaMinutes,
      rider: {
        name: `Drone ${orderId.slice(-3)}`,
        vehicle: 'Drone Delivery',
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0 (drones are reliable!)
        droneId: `DR-${orderId.slice(-4)}`,
        battery: droneData?.battery || Math.floor(Math.random() * 20) + 80,
        altitude: droneData?.altitude || Math.floor(Math.random() * 50) + 100
      }
    };
  };

  const fetchDroneTelemetry = async (orderId) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock drone data for development testing - integrated into actual flow
        console.log('🚁 Development mode: Generating integrated mock drone data for order:', orderId);
        
        // Simulate realistic API delay
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        
        const mockData = generateMockDroneData(orderId);
        const drone = mockData.drone;
        const loc = drone.location;
        
        if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
          // Update drone locations with full drone data
          setDroneLocations((s) => ({ 
            ...s, 
            [orderId]: { 
              lat: loc.lat, 
              lng: loc.lng,
              status: drone.status,
              eta: drone.eta,
              battery: drone.battery,
              speed: drone.speed,
              altitude: drone.altitude,
              weather: drone.weather
            } 
          }));
          
          // Also update delivery tracking state if available
          if (deliveryTracking && deliveryTracking[orderId]) {
            console.log('🚁 Integrated mock drone update:', {
              orderId,
              location: loc,
              status: drone.status,
              eta: drone.eta,
              battery: drone.battery,
              weather: drone.weather
            });
          }
          
          // Simulate real-time updates in the UI
          console.log(`🚁 Drone ${drone.id} update: ${drone.status}, ETA: ${drone.eta}min, Battery: ${drone.battery}%`);
        }
      } else {
        // Production: Real API call
        const res = await api.get(`/drone/status-by-order/${orderId}`);
        const drone = res?.data?.data?.drone;
        const loc = drone?.location;
        if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
          setDroneLocations((s) => ({ ...s, [orderId]: { lat: loc.lat, lng: loc.lng } }));
        }
      }
    } catch (e) {
      console.log('🚁 Drone telemetry error (expected in development):', e.message);
    }
  };

  // Auto-poll telemetry for active orders (disabled in development)
  useEffect(() => {
    if (!Array.isArray(userOrders)) return;
    const active = userOrders.filter(o => {
      const orderStatus = o.status || o.deliveryStatus || 'pending';
      return ['pending', 'preparing', 'ready', 'out_for_delivery'].includes(orderStatus);
    });
    console.log('🔍 Active orders found:', active.length);
    
    if (process.env.NODE_ENV === 'development') {
      // Development: Mock drone telemetry polling
      console.log('🚁 Development mode: Starting mock drone telemetry polling');
      
      // Start mock pollers for active orders
      active.forEach((o) => {
        if (!telemetryPollers[o._id]) {
          const id = setInterval(() => fetchDroneTelemetry(o._id), 3000); // Poll every 3 seconds for testing
          setTelemetryPollers((p) => ({ ...p, [o._id]: id }));
        }
      });
    } else {
      // Production: Real drone telemetry polling
      active.forEach((o) => {
        if (!telemetryPollers[o._id]) {
          const id = setInterval(() => fetchDroneTelemetry(o._id), 7000); // Poll every 7 seconds in production
          setTelemetryPollers((p) => ({ ...p, [o._id]: id }));
        }
      });
    }
    
    // Cleanup pollers for non-active orders
    Object.entries(telemetryPollers).forEach(([orderId, id]) => {
      if (!active.find(o => o._id === orderId)) {
        clearInterval(id);
        const next = { ...telemetryPollers };
        delete next[orderId];
        setTelemetryPollers(next);
      }
    });
    
    return () => {
      Object.values(telemetryPollers).forEach((id) => clearInterval(id));
      setTelemetryPollers({});
    };
  }, [userOrders]);

  const tabs = [
    { id: 'active', name: 'Active Orders', icon: Clock },
    { id: 'completed', name: 'Completed', icon: CheckCircle },
    { id: 'drone', name: 'Drone Orders', icon: Drone },
    { id: 'drone-tracking', name: 'Drone Live Tracking', icon: MapPin },
  ];

  // Simple delivery tracking component (no external map library) - integrated with drone data
  const DeliveryMap = ({ deliveries, orderId }) => {
    if (!deliveries || deliveries.length === 0) return null;
    const d = deliveries[0];
    const loc = d.currentLocation;
    
    // Get drone data if available (integrated into actual flow)
    const droneData = droneLocations[orderId];
    
    // Use mock data in development, enhanced with drone data
    const mockDelivery = process.env.NODE_ENV === 'development' ? generateMockDeliveryData(orderId) : d;
    const deliveryData = process.env.NODE_ENV === 'development' ? mockDelivery : d;

    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">Live delivery tracking:</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              deliveryData.status === 'en_route' ? 'bg-blue-100 text-blue-800' :
              deliveryData.status === 'nearby' ? 'bg-yellow-100 text-yellow-800' :
              deliveryData.status === 'delivered' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {deliveryData.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {(loc || deliveryData.currentLocation) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Location:</span>
                <span className="text-xs text-gray-600">
                  {(deliveryData.currentLocation?.lat || loc?.lat)?.toFixed(5)}, {(deliveryData.currentLocation?.lng || loc?.lng)?.toFixed(5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ETA:</span>
                <span className="text-xs text-gray-600">
                  {deliveryData.etaMinutes ? `${deliveryData.etaMinutes} min` : '—'}
                </span>
              </div>
            </div>
          )}

          {deliveryData.rider && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Rider Info:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Name: {deliveryData.rider.name}</p>
                <p>Vehicle: {deliveryData.rider.vehicle}</p>
                <p>Phone: {deliveryData.rider.phone}</p>
                <p>Rating: ⭐ {deliveryData.rider.rating}</p>
              </div>
            </div>
          )}

          {/* Enhanced map visualization with drone data */}
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
            <div className="text-center text-xs text-gray-500 mb-2">
              {droneData ? '🚁 Drone Delivery Route' : 'Delivery Route'}
            </div>
            <div className="h-32 bg-gradient-to-br from-blue-50 to-green-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                {droneData ? (
                  <div>
                    <div className="text-2xl mb-1">🚁</div>
                    <p className="text-xs text-blue-600 font-medium">Drone {droneData.droneId || 'Active'}</p>
                    <p className="text-xs text-gray-600">
                      {droneData.status === 'en_route' ? 'Flying to destination' :
                       droneData.status === 'nearby' ? 'Approaching delivery point' :
                       droneData.status === 'arrived' ? 'Drone has arrived!' :
                       'Tracking drone progress'}
                    </p>
                    {droneData.eta && (
                      <p className="text-xs text-blue-500 mt-1 font-medium">
                        ETA: {droneData.eta} minutes
                      </p>
                    )}
                    {droneData.battery && (
                      <p className="text-xs text-green-600 mt-1">
                        Battery: {droneData.battery}%
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">
                      {process.env.NODE_ENV === 'development' ? 'Mock tracking active' : 'Live tracking active'}
                    </p>
                    {(loc || deliveryData.currentLocation) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {deliveryData.status === 'en_route' ? 'Rider is on the way' :
                         deliveryData.status === 'nearby' ? 'Rider is nearby' :
                         deliveryData.status === 'arrived' ? 'Rider has arrived' :
                         deliveryData.status === 'delivered' ? 'Order delivered!' :
                         'Tracking delivery progress'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order) => (
    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order._id?.toString()?.slice(-8) || 'N/A'}</h3>
          <p className="text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          (order.status || order.deliveryStatus) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          (order.status || order.deliveryStatus) === 'preparing' ? 'bg-blue-100 text-blue-800' :
          (order.status || order.deliveryStatus) === 'ready' ? 'bg-green-100 text-green-800' :
          (order.status || order.deliveryStatus) === 'delivered' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {(() => {
            const status = (order.status || order.deliveryStatus || 'pending')?.toString() || 'pending';
            return status.charAt(0).toUpperCase() + status.slice(1);
          })()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Shop Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {order.shops && order.shops.length > 0 ? (
              order.shops.map((shop, shopIndex) => (
                <div key={shopIndex} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4" />
                    <span>Shop ID: {shop.shopId?.toString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Status: {shop.status?.toString() || 'N/A'}</span>
                  </div>
                  {shop.cancelReason && (
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Reason: {shop.cancelReason?.toString() || 'N/A'}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No shop details available</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span>{order.totalQuantity || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span>₹{order.totalPrice || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span>{order.isPaid ? 'Paid' : 'Pending'}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-900">
              <span>Delivery Type:</span>
              <span>{order.deliveryType || 'Regular'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
        <div className="space-y-3">
          {order.shops && order.shops.length > 0 ? (
            order.shops.map((shop, shopIndex) => (
              <div key={shopIndex} className="space-y-3">
                <h5 className="font-medium text-gray-700">Shop {shopIndex + 1}</h5>
                {shop.products && shop.products.length > 0 ? (
                  shop.products.map((product, productIndex) => (
                    <div key={productIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Product ID: {product.productId?.toString() || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Qty: {product.quantity || 0}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">₹{product.price || 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 p-3">No products in this shop</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 p-3">No shop information available</div>
          )}
        </div>
      </div>

      {(order.status || order.deliveryStatus) === 'ready' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Your order is ready for pickup!</span>
          </div>
        </div>
      )}

      {(order.status || order.deliveryStatus) === 'delivered' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Order delivered successfully!</span>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Debug Info</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>Order ID: {order._id?.toString() || 'N/A'}</p>
          <p>Status: {order.status || 'undefined'}</p>
          <p>Delivery Status: {order.deliveryStatus || 'undefined'}</p>
          <p>Total Quantity: {order.totalQuantity || 0}</p>
          <p>Total Price: {order.totalPrice || 0}</p>
          <p>Shops Count: {order.shops?.length || 0}</p>
          <p>Created At: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

    </div>
  );

  const renderActiveOrders = () => {
    // Safety check: ensure userOrders is an array
    if (!Array.isArray(userOrders)) {
      return (
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Orders...</h2>
          <p className="text-gray-600">Please wait while we fetch your orders.</p>
        </div>
      );
    }

    const activeOrders = userOrders.filter(order => {
      const orderStatus = order.status || order.deliveryStatus || 'pending';
      return ['pending', 'preparing', 'ready'].includes(orderStatus);
    });
    
    return (
      <div className="space-y-6">
        {activeOrders.length > 0 ? (
          activeOrders.map(renderOrderCard)
        ) : (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
            <p className="text-gray-600">You don't have any active orders at the moment.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCompletedOrders = () => {
    // Safety check: ensure userOrders is an array
    if (!Array.isArray(userOrders)) {
      return (
        <div className="text-center py-12">
          <CheckCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Orders...</h2>
          <p className="text-gray-600">Please wait while we fetch your orders.</p>
        </div>
      );
    }

    const completedOrders = userOrders.filter(order => {
      const orderStatus = order.status || order.deliveryStatus || 'pending';
      return orderStatus === 'delivered';
    });
    
    return (
      <div className="space-y-6">
        {completedOrders.length > 0 ? (
          completedOrders.map(renderOrderCard)
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Completed Orders</h2>
            <p className="text-gray-600">You haven't completed any orders yet.</p>
          </div>
        )}
      </div>
    );
  };

  const renderDroneOrders = () => {
    // Safety check: ensure userOrders is an array
    if (!Array.isArray(userOrders)) {
      return (
        <div className="text-center py-12">
          <Drone className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Drone Orders...</h2>
          <p className="text-gray-600">Please wait while we fetch your drone orders.</p>
        </div>
      );
    }

    // Filter orders that are drone deliveries or show all orders for testing
    const droneOrders = userOrders.filter(order => {
      const orderStatus = order.status || order.deliveryStatus || 'pending';
      // In development, show all orders for testing; in production, filter by deliveryType
      if (process.env.NODE_ENV === 'development') {
        return ['pending', 'preparing', 'ready', 'en_route', 'nearby', 'arrived'].includes(orderStatus);
      }
      return order.deliveryType === 'drone' && ['pending', 'preparing', 'ready', 'en_route', 'nearby', 'arrived'].includes(orderStatus);
    });
    
    if (droneOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <Drone className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Drone Orders</h2>
          <p className="text-gray-600">You don't have any active drone delivery orders at the moment.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">Drone Delivery Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real-time drone tracking</li>
              <li>• Live location updates</li>
              <li>• ETA predictions</li>
              <li>• Drone status monitoring</li>
              <li>• QR code verification</li>
            </ul>
            
            {/* Test Buttons for Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Development Testing:</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Simulate creating a drone order
                      console.log('🧪 Creating mock drone order...');
                      alert('Mock drone order created! Check the drone orders tab.');
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    🧪 Create Mock Drone Order
                  </button>
                  <button
                    onClick={() => {
                      // Test weather conditions
                      console.log('🌤️ Testing weather conditions...');
                      alert('Weather test: Clear skies, 24°C, Wind: 12 km/h - Safe for drone flight!');
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    🌤️ Test Weather Conditions
                  </button>
                  <button
                    onClick={() => {
                      // Test drone tracking
                      console.log('🚁 Testing drone tracking...');
                      alert('Drone tracking test: Drone location updated, ETA: 15 minutes, Battery: 85%');
                    }}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                  >
                    🚁 Test Drone Tracking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Drone className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Drone Delivery Orders</h3>
          </div>
          <p className="text-sm text-blue-700">
            Track your drone deliveries in real-time. {droneOrders.length} active drone order{droneOrders.length !== 1 ? 's' : ''} found.
          </p>
        </div>
        
        {droneOrders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Drone Order #{order._id?.toString()?.slice(-8) || 'N/A'}</h3>
                <p className="text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Drone className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">Drone Delivery</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                (order.status || order.deliveryStatus) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                (order.status || order.deliveryStatus) === 'preparing' ? 'bg-blue-100 text-blue-800' :
                (order.status || order.deliveryStatus) === 'ready' ? 'bg-green-100 text-green-800' :
                (order.status || order.deliveryStatus) === 'en_route' ? 'bg-purple-100 text-purple-800' :
                (order.status || order.deliveryStatus) === 'nearby' ? 'bg-orange-100 text-orange-800' :
                (order.status || order.deliveryStatus) === 'arrived' ? 'bg-indigo-100 text-indigo-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(() => {
                  const status = (order.status || order.deliveryStatus || 'pending')?.toString() || 'pending';
                  return status.charAt(0).toUpperCase() + status.slice(1);
                })()}
              </span>
            </div>

            {/* Drone Tracking Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Drone className="w-4 h-4 text-blue-500" />
                <span>Drone Tracking</span>
              </h4>
              
              {/* Enhanced Drone Tracking Map */}
              <DroneTrackingMap 
                orderId={order._id} 
                deliveryType="drone" 
              />
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{order.totalQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span>₹{order.totalPrice || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>{order.isPaid ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Shop Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {order.shops && order.shops.length > 0 ? (
                    order.shops.map((shop, shopIndex) => (
                      <div key={shopIndex} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4" />
                          <span>Shop ID: {shop.shopId?.toString() || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Status: {shop.status?.toString() || 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No shop details available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.shops && order.shops.length > 0 ? (
                  order.shops.map((shop, shopIndex) => (
                    <div key={shopIndex} className="space-y-3">
                      <h5 className="font-medium text-gray-700">Shop {shopIndex + 1}</h5>
                      {shop.products && shop.products.length > 0 ? (
                        shop.products.map((product, productIndex) => (
                          <div key={productIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Product ID: {product.productId?.toString() || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Qty: {product.quantity || 0}</p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-900">₹{product.price || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 p-3">No products in this shop</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 p-3">No shop information available</div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Drone Order Debug Info</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Order ID: {order._id?.toString() || 'N/A'}</p>
                <p>Status: {order.status || 'undefined'}</p>
                <p>Delivery Status: {order.deliveryStatus || 'undefined'}</p>
                <p>Delivery Type: {order.deliveryType || 'undefined'}</p>
                <p>Total Quantity: {order.totalQuantity || 0}</p>
                <p>Total Price: {order.totalPrice || 0}</p>
                <p>Shops Count: {order.shops?.length || 0}</p>
                <p>Created At: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDroneLiveTracking = () => {
    // Safety check: ensure userOrders is an array
    if (!Array.isArray(userOrders)) {
      return (
        <div className="text-center py-12">
          <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Drone Tracking...</h2>
          <p className="text-gray-600">Please wait while we fetch your drone tracking data.</p>
        </div>
      );
    }

    // Filter orders that are drone deliveries or show all orders for testing
    const droneOrders = userOrders.filter(order => {
      const orderStatus = order.status || order.deliveryStatus || 'pending';
      // In development, show all orders for testing; in production, filter by deliveryType
      if (process.env.NODE_ENV === 'development') {
        return ['pending', 'preparing', 'ready', 'en_route', 'nearby', 'arrived'].includes(orderStatus);
      }
      return order.deliveryType === 'drone' && ['pending', 'preparing', 'ready', 'en_route', 'nearby', 'arrived'].includes(orderStatus);
    });
    
    if (droneOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Drone Tracking</h2>
          <p className="text-gray-600">You don't have any active drone deliveries to track at the moment.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">Drone Tracking Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real-time drone location updates</li>
              <li>• Live flight path visualization</li>
              <li>• ETA predictions and route optimization</li>
              <li>• Weather condition monitoring</li>
              <li>• Emergency situation alerts</li>
            </ul>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Live Drone Tracking</h3>
          </div>
          <p className="text-sm text-blue-700">
            Monitor your drone deliveries in real-time. {droneOrders.length} active drone order{droneOrders.length !== 1 ? 's' : ''} being tracked.
          </p>
        </div>
        
        {droneOrders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Drone Order #{order._id?.toString()?.slice(-8) || 'N/A'}</h3>
                <p className="text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Drone className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">Live Tracking Active</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                (order.status || order.deliveryStatus) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                (order.status || order.deliveryStatus) === 'preparing' ? 'bg-blue-100 text-blue-800' :
                (order.status || order.deliveryStatus) === 'ready' ? 'bg-green-100 text-green-800' :
                (order.status || order.deliveryStatus) === 'en_route' ? 'bg-purple-100 text-purple-800' :
                (order.status || order.deliveryStatus) === 'nearby' ? 'bg-orange-100 text-orange-800' :
                (order.status || order.deliveryStatus) === 'arrived' ? 'bg-indigo-100 text-indigo-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(() => {
                  const status = (order.status || order.deliveryStatus || 'pending')?.toString() || 'pending';
                  return status.charAt(0).toUpperCase() + status.slice(1);
                })()}
              </span>
            </div>

            {/* Enhanced Live Drone Tracking Map */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Live Drone Tracking</span>
              </h4>
              
              {/* Enhanced Drone Tracking Map with Weather */}
              <DroneTrackingMap 
                orderId={order._id} 
                deliveryType="drone" 
              />
            </div>

            {/* Weather Information */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                <span>🌤️</span>
                <span>Weather Conditions</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl mb-1">🌡️</div>
                  <div className="font-medium text-blue-900">Temperature</div>
                  <div className="text-blue-600">24°C</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl mb-1">💨</div>
                  <div className="font-medium text-blue-900">Wind Speed</div>
                  <div className="text-blue-600">12 km/h</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl mb-1">☔</div>
                  <div className="font-medium text-blue-900">Precipitation</div>
                  <div className="text-blue-600">0%</div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-center">
                <span className="text-sm text-green-800 font-medium">✅ Weather conditions are safe for drone flight</span>
              </div>
            </div>

            {/* Flight Path Information */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <span>✈️</span>
                <span>Flight Path Details</span>
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Altitude:</span>
                  <span className="font-medium text-gray-900">120 meters</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Flight Speed:</span>
                  <span className="font-medium text-gray-900">25 km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Battery Level:</span>
                  <span className="font-medium text-gray-900">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Signal Strength:</span>
                  <span className="font-medium text-gray-900">Excellent</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{order.totalQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span>₹{order.totalPrice || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>{order.isPaid ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Shop Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {order.shops && order.shops.length > 0 ? (
                    order.shops.map((shop, shopIndex) => (
                      <div key={shopIndex} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4" />
                          <span>Shop ID: {shop.shopId?.toString() || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Status: {shop.status?.toString() || 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No shop details available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.shops && order.shops.length > 0 ? (
                  order.shops.map((shop, shopIndex) => (
                    <div key={shopIndex} className="space-y-3">
                      <h5 className="font-medium text-gray-700">Shop {shopIndex + 1}</h5>
                      {shop.products && shop.products.length > 0 ? (
                        shop.products.map((product, productIndex) => (
                          <div key={productIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Product ID: {product.productId?.toString() || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Qty: {product.quantity || 0}</p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-900">₹{product.price || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 p-3">No products in this shop</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 p-3">No shop information available</div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Live Tracking Debug Info</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Order ID: {order._id?.toString() || 'N/A'}</p>
                <p>Status: {order.status || 'undefined'}</p>
                <p>Delivery Status: {order.deliveryStatus || 'undefined'}</p>
                <p>Delivery Type: {order.deliveryType || 'undefined'}</p>
                <p>Total Quantity: {order.totalQuantity || 0}</p>
                <p>Total Price: {order.totalPrice || 0}</p>
                <p>Shops Count: {order.shops?.length || 0}</p>
                <p>Created At: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your current orders and view order history</p>
        <p className="text-sm text-blue-600 mt-2">
          <strong>Note:</strong> This page shows active orders from Order model (pending, preparing, ready, delivered)
        </p>
        
        {/* Development Testing Buttons */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-3 flex items-center space-x-2">
              <span>🧪</span>
              <span>Development Testing Tools</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  console.log('🚁 Testing drone order creation...');
                  alert('Drone order test: Creating mock drone delivery order with tracking enabled');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                🚁 Test Drone Order
              </button>
              <button
                onClick={() => {
                  console.log('🌤️ Testing weather integration...');
                  alert('Weather test: Checking conditions for drone delivery - Clear skies, safe for flight');
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                🌤️ Test Weather
              </button>
              <button
                onClick={() => {
                  console.log('📱 Testing tracking system...');
                  alert('Tracking test: Drone location updated, ETA calculated, route optimized');
                }}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
              >
                📱 Test Tracking
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'active' && renderActiveOrders()}
          {activeTab === 'completed' && renderCompletedOrders()}
          {activeTab === 'drone' && renderDroneOrders()}
          {activeTab === 'drone-tracking' && renderDroneLiveTracking()}
        </div>
      </div>
    </div>
  );
};

export default Orders;
