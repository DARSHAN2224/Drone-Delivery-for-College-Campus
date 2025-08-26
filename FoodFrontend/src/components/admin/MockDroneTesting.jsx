import { useState, useEffect } from 'react';
import { 
  Plane, 
  QrCode, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  Home,
  AlertTriangle,
  Package,
  Truck,
  User,
  Store,
  Zap,
  Battery,
  Wifi,
  WifiOff
} from 'lucide-react';

const MockDroneTesting = () => {
  const [mockDrones, setMockDrones] = useState([]);
  const [mockOrders, setMockOrders] = useState([]);
  const [mockDeliveries, setMockDeliveries] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(3000); // 3 seconds

  // Initialize mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Generate mock drones
    const drones = [];
    for (let i = 1; i <= 5; i++) {
      drones.push({
        id: `drone-${i}`,
        name: `Drone ${i}`,
        status: ['available', 'busy', 'charging', 'maintenance'][Math.floor(Math.random() * 4)],
        battery: Math.floor(Math.random() * 40) + 60,
        location: {
          lat: 12.9716 + (Math.random() - 0.5) * 0.01,
          lng: 77.5946 + (Math.random() - 0.5) * 0.01
        },
        altitude: Math.floor(Math.random() * 50) + 100,
        speed: Math.floor(Math.random() * 20) + 15,
        totalDeliveries: Math.floor(Math.random() * 100) + 10,
        currentOrder: null
      });
    }
    setMockDrones(drones);

    // Generate mock orders
    const orders = [];
    for (let i = 1; i <= 8; i++) {
      orders.push({
        id: `order-${i}`,
        orderId: `ORD-${String(i).padStart(4, '0')}`,
        customerName: `Customer ${i}`,
        deliveryAddress: `Address ${i}, City ${i}`,
        status: ['pending', 'assigned', 'preparing', 'drone_dispatched', 'out_for_delivery', 'delivered'][Math.floor(Math.random() * 6)],
        droneId: null,
        totalAmount: Math.floor(Math.random() * 500) + 100,
        items: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(Date.now() - Math.random() * 86400000),
        estimatedDelivery: new Date(Date.now() + Math.random() * 3600000)
      });
    }
    setMockOrders(orders);

    // Generate mock deliveries
    const deliveries = [];
    for (let i = 1; i <= 5; i++) {
      deliveries.push({
        id: `delivery-${i}`,
        orderId: `ORD-${String(i).padStart(4, '0')}`,
        status: ['en_route', 'nearby', 'arrived', 'delivered'][Math.floor(Math.random() * 4)],
        qrCode: `DRONE-${String(i).padStart(4, '0')}-${Date.now().toString(36)}`,
        currentLocation: {
          lat: 12.9716 + (Math.random() - 0.5) * 0.01,
          lng: 77.5946 + (Math.random() - 0.5) * 0.01
        },
        etaMinutes: Math.floor(Math.random() * 15) + 5,
        rider: {
          name: `Pilot ${i}`,
          vehicle: 'Drone Delivery',
          phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          rating: (Math.random() * 2 + 3).toFixed(1)
        }
      });
    }
    setMockDeliveries(deliveries);
  };

  // Simulate drone movement and status changes
  const startSimulation = () => {
    setIsSimulating(true);
    const interval = setInterval(() => {
      if (!isSimulating) {
        clearInterval(interval);
        return;
      }

      // Update drone locations
      setMockDrones(prev => prev.map(drone => ({
        ...drone,
        location: {
          lat: drone.location.lat + (Math.random() - 0.5) * 0.001,
          lng: drone.location.lng + (Math.random() - 0.5) * 0.001
        },
        battery: Math.max(20, drone.battery - Math.random() * 2),
        altitude: Math.max(50, drone.altitude + (Math.random() - 0.5) * 10),
        speed: Math.max(10, drone.speed + (Math.random() - 0.5) * 5)
      })));

      // Update delivery ETAs
      setMockDeliveries(prev => prev.map(delivery => ({
        ...delivery,
        etaMinutes: Math.max(1, delivery.etaMinutes - 1),
        currentLocation: {
          lat: delivery.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: delivery.currentLocation.lng + (Math.random() - 0.5) * 0.001
        }
      })));

      // Randomly change some order statuses
      setMockOrders(prev => prev.map(order => {
        if (Math.random() < 0.1) { // 10% chance to change status
          const statuses = ['pending', 'assigned', 'preparing', 'drone_dispatched', 'out_for_delivery', 'delivered'];
          const currentIndex = statuses.indexOf(order.status);
          const nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
          return { ...order, status: statuses[nextIndex] };
        }
        return order;
      }));

    }, simulationSpeed);

    return () => clearInterval(interval);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const assignDroneToOrder = (droneId, orderId) => {
    setMockDrones(prev => prev.map(drone => 
      drone.id === droneId 
        ? { ...drone, status: 'busy', currentOrder: orderId }
        : drone
    ));
    
    setMockOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'assigned', droneId }
        : order
    ));
  };

  const generateNewQRCode = (deliveryId) => {
    setMockDeliveries(prev => prev.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, qrCode: `DRONE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}` }
        : delivery
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚁 Mock Drone Testing Dashboard</h1>
            <p className="text-gray-600 mt-1">Complete development testing environment for drone delivery system</p>
          </div>
          
          {/* Simulation Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speed:</span>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={1000}>Fast (1s)</option>
                <option value={3000}>Normal (3s)</option>
                <option value={5000}>Slow (5s)</option>
              </select>
            </div>
            
            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Play className="w-4 h-4" />
                Start Simulation
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Square className="w-4 h-4" />
                Stop Simulation
              </button>
            )}
            
            <button
              onClick={initializeMockData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Data
            </button>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSimulating ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>Simulation: {isSimulating ? 'Running' : 'Stopped'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-500" />
            <span>Active Drones: {mockDrones.filter(d => d.status === 'busy').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span>Pending Orders: {mockOrders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-green-500" />
            <span>Active Deliveries: {mockDeliveries.filter(d => d.status !== 'delivered').length}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drone Fleet Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-500" />
            Drone Fleet Status
          </h2>
          
          <div className="space-y-3">
            {mockDrones.map(drone => (
              <div key={drone.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{drone.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    drone.status === 'available' ? 'bg-green-100 text-green-800' :
                    drone.status === 'busy' ? 'bg-blue-100 text-blue-800' :
                    drone.status === 'charging' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {drone.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    <span>{drone.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{drone.altitude}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{drone.speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{drone.totalDeliveries}</span>
                  </div>
                </div>
                
                {drone.currentOrder && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    📦 Order: {drone.currentOrder}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Order Management
          </h2>
          
          <div className="space-y-3">
            {mockOrders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{order.orderId}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'drone_dispatched' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'out_for_delivery' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <p>Customer: {order.customerName}</p>
                  <p>Amount: ₹{order.totalAmount}</p>
                  <p>Items: {order.items}</p>
                </div>
                
                {!order.droneId && order.status === 'pending' && (
                  <div className="flex gap-2">
                    {mockDrones.filter(d => d.status === 'available').map(drone => (
                      <button
                        key={drone.id}
                        onClick={() => assignDroneToOrder(drone.id, order.id)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Assign {drone.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Tracking */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-500" />
            Delivery Tracking
          </h2>
          
          <div className="space-y-3">
            {mockDeliveries.map(delivery => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{delivery.orderId}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    delivery.status === 'en_route' ? 'bg-blue-100 text-blue-800' :
                    delivery.status === 'nearby' ? 'bg-yellow-100 text-yellow-800' :
                    delivery.status === 'arrived' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <p>ETA: {delivery.etaMinutes} minutes</p>
                  <p>Pilot: {delivery.rider.name} ⭐{delivery.rider.rating}</p>
                  <p>Phone: {delivery.rider.phone}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateNewQRCode(delivery.id)}
                    className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    <QrCode className="w-3 h-3 inline mr-1" />
                    New QR
                  </button>
                  <span className="text-xs text-gray-500">
                    QR: {delivery.qrCode.slice(0, 12)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Monitoring */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-purple-500" />
            Real-time Monitoring
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-900 mb-2">Live Updates</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Drone locations update every {simulationSpeed / 1000}s</p>
                <p>• Battery levels decrease gradually</p>
                <p>• ETA counts down in real-time</p>
                <p>• Order statuses change randomly</p>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-900 mb-2">Testing Features</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Assign drones to orders</p>
                <p>• Generate new QR codes</p>
                <p>• Monitor delivery progress</p>
                <p>• Test status transitions</p>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-900 mb-2">Development Mode</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• All data is simulated</p>
                <p>• No real API calls</p>
                <p>• Perfect for testing UI</p>
                <p>• Easy to reset and restart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockDroneTesting;
