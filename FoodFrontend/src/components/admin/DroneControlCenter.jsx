import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
import { 
  Plane, 
  Package, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Square,
  RotateCcw,
  Home,
  RefreshCw,
  User,
  Store
} from 'lucide-react';

const DroneControlCenter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [droneOrders, setDroneOrders] = useState([]);
  const [drones, setDrones] = useState([]);
  const [selectedTab, setSelectedTab] = useState('orders'); // 'orders' or 'drones'
  const [mockMode, setMockMode] = useState(process.env.NODE_ENV === 'development');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mockMode) {
        // Development: Use mock data
        console.log('🚁 Development mode: Loading mock drone data');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockOrders = generateMockDroneOrders();
        const mockDrones = generateMockDrones();
        
        setDroneOrders(mockOrders);
        setDrones(mockDrones);
        
        console.log('🚁 Mock data loaded:', { orders: mockOrders.length, drones: mockDrones.length });
      } else {
        // Production: Real API calls
        const ordersRes = await api.get('/drone/admin/all');
        const orders = ordersRes?.data?.data?.droneOrders || [];
        setDroneOrders(orders);

        const dronesRes = await api.get('/drone/admin/drones');
        const dronesList = dronesRes?.data?.data?.drones || [];
        setDrones(dronesList);
      }
    } catch (e) {
      if (mockMode) {
        console.log('🚁 Mock mode: Simulating error for testing');
        setError('Mock error simulation for testing');
      } else {
        setError(e?.response?.data?.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const executeAction = async (action, id, type = 'order') => {
    try {
      setError(null);
      
      if (mockMode) {
        // Development: Simulate action execution
        console.log('🚁 Development mode: Executing mock action:', action, 'on', id);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update mock data based on action
        if (type === 'order') {
          setDroneOrders(prev => prev.map(order => {
            if (order._id === id) {
              switch (action) {
                case 'assign':
                  return { ...order, status: 'assigned', droneId: `drone-${Math.floor(Math.random() * 8) + 1}` };
                case 'launch':
                  return { ...order, status: 'drone_dispatched' };
                case 'land':
                  return { ...order, status: 'out_for_delivery' };
                case 'return':
                  return { ...order, status: 'delivered' };
                default:
                  return order;
              }
            }
            return order;
          }));
        } else if (type === 'drone') {
          setDrones(prev => prev.map(drone => {
            if (drone._id === id) {
              switch (action) {
                case 'launch':
                  return { ...drone, status: 'busy' };
                case 'land':
                  return { ...drone, status: 'available' };
                case 'return':
                  return { ...drone, status: 'charging' };
                case 'emergency':
                  return { ...drone, status: 'maintenance' };
                default:
                  return drone;
              }
            }
            return drone;
          }));
        }
        
        console.log('🚁 Mock action completed successfully');
        setError(null);
      } else {
        // Production: Real API calls
        let endpoint = '';
        
        switch (action) {
          case 'assign':
            endpoint = `/drone/assign/${id}`;
            break;
          case 'launch':
            endpoint = `/drone/launch/${id}`;
            break;
          case 'land':
            endpoint = `/drone/land/${id}`;
            break;
          case 'return':
            endpoint = `/drone/return/${id}`;
            break;
          case 'emergency':
            endpoint = `/drone/emergency-stop/${id}`;
            break;
          default:
            throw new Error('Invalid action');
        }

        await api.post(endpoint);
        await loadData(); // Refresh data
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Action failed';
      setError(message);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'preparing': return 'text-purple-600 bg-purple-50';
      case 'drone_dispatched': return 'text-indigo-600 bg-indigo-50';
      case 'out_for_delivery': return 'text-green-600 bg-green-50';
      case 'delivered': return 'text-green-700 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'weather_blocked': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Mock data generation for development testing
  const generateMockDroneOrders = () => {
    const mockOrders = [];
    const statuses = ['pending', 'assigned', 'preparing', 'drone_dispatched', 'out_for_delivery', 'delivered'];
    
    for (let i = 1; i <= 5; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      mockOrders.push({
        _id: `mock-order-${i}`,
        orderId: `ORD-${String(i).padStart(4, '0')}`,
        customerName: `Customer ${i}`,
        deliveryAddress: `Address ${i}, City ${i}`,
        status: randomStatus,
        droneId: randomStatus === 'pending' ? null : `drone-${i}`,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() + Math.random() * 3600000).toISOString(),
        totalAmount: Math.floor(Math.random() * 500) + 100,
        items: Math.floor(Math.random() * 5) + 1
      });
    }
    return mockOrders;
  };

  const generateMockDrones = () => {
    const mockDrones = [];
    const statuses = ['available', 'busy', 'maintenance', 'charging'];
    
    for (let i = 1; i <= 8; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      mockDrones.push({
        _id: `mock-drone-${i}`,
        droneId: `DRONE-${String(i).padStart(3, '0')}`,
        name: `Drone ${i}`,
        status: randomStatus,
        battery: Math.floor(Math.random() * 40) + 60, // 60-100%
        location: {
          lat: 12.9716 + (Math.random() - 0.5) * 0.01,
          lng: 77.5946 + (Math.random() - 0.5) * 0.01
        },
        lastMaintenance: new Date(Date.now() - Math.random() * 2592000000).toISOString(), // 0-30 days ago
        totalDeliveries: Math.floor(Math.random() * 100) + 10,
        currentOrder: randomStatus === 'busy' ? `mock-order-${i}` : null
      });
    }
    return mockDrones;
  };

  const getDroneStatusColor = (status) => {
    switch (status) {
      case 'idle': return 'text-gray-600 bg-gray-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'launched': return 'text-green-600 bg-green-50';
      case 'in_flight': return 'text-indigo-600 bg-indigo-50';
      case 'landed': return 'text-purple-600 bg-purple-50';
      case 'returning': return 'text-orange-600 bg-orange-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getWeatherIcon = (weatherCheck) => {
    if (!weatherCheck) return null;
    return weatherCheck.isSafe ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drone Control Center</h1>
          <p className="text-gray-600 mt-1">Manage drone deliveries and monitor fleet status</p>
        </div>
        <div className="flex items-center gap-3">
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
          
          <button 
            onClick={loadData} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('orders')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'orders' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Drone Orders ({droneOrders.length})
          </div>
        </button>
                 <button
           onClick={() => setSelectedTab('drones')}
           className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
             selectedTab === 'drones' 
               ? 'bg-white text-blue-600 shadow-sm' 
               : 'text-gray-600 hover:text-gray-900'
           }`}
         >
           <div className="flex items-center justify-center gap-2">
             <Plane className="w-4 h-4" />
             Fleet Status ({drones.length})
           </div>
         </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <>
          {/* Drone Orders Tab */}
          {selectedTab === 'orders' && (
            <div className="space-y-4">
              {droneOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Drone Orders</h3>
                  <p className="text-gray-600">There are currently no drone delivery orders.</p>
                </div>
              ) : (
                droneOrders.map((order) => (
                  <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderId?.slice(-8) || 'N/A'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{order.userId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            <span>{order.sellerId?.shopName || order.sellerId?.name || 'N/A'}</span>
                          </div>
                                                     <div className="flex items-center gap-2">
                             <Plane className="w-4 h-4" />
                             <span>Drone: {order.droneId || 'Unassigned'}</span>
                           </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Created: {formatTime(order.createdAt)}</span>
                          </div>
                        </div>

                        {/* Weather Information */}
                        {order.weatherCheck && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {getWeatherIcon(order.weatherCheck)}
                              <span className="text-sm font-medium">Weather Conditions</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                              <div>Wind: {order.weatherCheck.windSpeed || 'N/A'} m/s</div>
                              <div>Rain: {order.weatherCheck.rainProbability || 'N/A'} mm</div>
                              <div>Visibility: {order.weatherCheck.visibility || 'N/A'} m</div>
                              <div>Condition: {order.weatherCheck.weatherCondition || 'N/A'}</div>
                            </div>
                          </div>
                        )}

                        {/* Location Information */}
                        {order.location && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Delivery Route</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                              <div>
                                <span className="font-medium">Pickup:</span> {order.location.pickup?.address || 'Coordinates only'}
                              </div>
                              <div>
                                <span className="font-medium">Delivery:</span> {order.location.delivery?.address || 'Coordinates only'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {!order.droneId && order.status === 'pending' && (
                          <button
                            onClick={() => executeAction('assign', order.orderId)}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Assign Drone
                          </button>
                        )}
                        
                        {order.droneId && order.status === 'assigned' && (
                          <button
                            onClick={() => executeAction('launch', order.orderId)}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Play className="w-4 h-4 inline mr-1" />
                            Launch
                          </button>
                        )}

                        {order.droneId && ['drone_dispatched', 'out_for_delivery'].includes(order.status) && (
                          <>
                            <button
                              onClick={() => executeAction('land', order.droneId)}
                              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <Square className="w-4 h-4 inline mr-1" />
                              Land
                            </button>
                            <button
                              onClick={() => executeAction('return', order.droneId)}
                              className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4 inline mr-1" />
                              Return
                            </button>
                          </>
                        )}

                        {order.droneId && (
                          <button
                            onClick={() => executeAction('emergency', order.droneId)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Emergency Stop
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Fleet Status Tab */}
          {selectedTab === 'drones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drones.length === 0 ? (
                                 <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                   <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 mb-2">No Drones Available</h3>
                   <p className="text-gray-600">There are currently no drones in the fleet.</p>
                 </div>
              ) : (
                drones.map((drone) => (
                  <div key={drone.droneId} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h3 className="text-lg font-semibold text-gray-900">{drone.droneId}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDroneStatusColor(drone.status)}`}>
                        {drone.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Battery:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                drone.battery > 50 ? 'bg-green-500' : 
                                drone.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${drone.battery}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{drone.battery}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Altitude:</span>
                        <span className="font-medium">{drone.altitude}m</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Location:</span>
                        <span className="font-medium">
                          {drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Last Updated:</span>
                        <span className="font-medium">{formatTime(drone.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Drone Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        {drone.status === 'idle' && (
                          <button
                            onClick={() => executeAction('assign', drone.droneId, 'drone')}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                        
                        {drone.status === 'assigned' && (
                          <button
                            onClick={() => executeAction('launch', drone.droneId, 'drone')}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Launch
                          </button>
                        )}

                        {['launched', 'in_flight'].includes(drone.status) && (
                          <>
                            <button
                              onClick={() => executeAction('land', drone.droneId, 'drone')}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Land
                            </button>
                            <button
                              onClick={() => executeAction('return', drone.droneId, 'drone')}
                              className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => executeAction('emergency', drone.droneId, 'drone')}
                          className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DroneControlCenter;


