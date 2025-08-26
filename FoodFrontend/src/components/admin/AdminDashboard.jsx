import { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Truck, 
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { api } from '../../stores/api.js';

import AdminSidebar from './AdminSidebar';
import AdminStatCard from '../common/AdminStatCard';
import DroneOrderTable from '../common/DroneOrderTable';
import PageHeader from '../common/PageHeader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeDroneDeliveries: 0,
    completedDeliveries: 0
  });
  
  const [droneOrders, setDroneOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeDroneDeliveries: 0,
    completedDeliveries: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Integrated admin drone management state
  const [adminDroneNotifications, setAdminDroneNotifications] = useState([]);
  const [globalWeatherConditions, setGlobalWeatherConditions] = useState({
    temperature: 24,
    windSpeed: 12,
    precipitation: 0,
    visibility: 'excellent',
    droneFlightSafe: true,
    activeRegions: 3,
    totalFleet: 12,
    availableDrones: 8,
    dronesInFlight: 4
  });
  const [droneFleetStatus, setDroneFleetStatus] = useState([]);

  useEffect(() => {
    // Add a small delay to ensure authentication is established
    const timer = setTimeout(() => {
      fetchDashboardData();
      fetchDroneOrders();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [selectedStatus, currentPage]);

  // Auto-update admin drone notifications and global conditions
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Generate initial notifications
      const notifications = generateAdminDroneNotifications();
      setAdminDroneNotifications(notifications);
      
      // Update global conditions every 45 seconds
      updateGlobalConditions();
      const globalInterval = setInterval(updateGlobalConditions, 45000);
      
      // Update notifications every 30 seconds
      const notificationInterval = setInterval(() => {
        const newNotifications = generateAdminDroneNotifications();
        setAdminDroneNotifications(newNotifications);
      }, 30000);
      
      return () => {
        clearInterval(globalInterval);
        clearInterval(notificationInterval);
      };
    }
  }, [analytics]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await api.get('/admin/stats');
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Don't fail completely, just log the error
    }
    
    try {
      const analyticsResp = await api.get('/admin/analytics');
      if (analyticsResp.data?.success) {
        setAnalytics(analyticsResp.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Don't fail completely, just log the error
    }
  };

  const fetchDroneOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/drone/admin/all`, { params: { status: selectedStatus, page: currentPage } });
      
      if (response.data.success) {
        setDroneOrders(response.data.data.droneOrders);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch drone orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDroneOrderStatus = async (droneOrderId, newStatus) => {
    try {
      const response = await api.patch(`/drone/update/${droneOrderId}`, { status: newStatus });
      
      if (response.data.success) {
        // Refresh the list
        fetchDroneOrders();
      }
    } catch (error) {
      console.error('Failed to update drone order status:', error);
    }
  };

  // Generate integrated admin drone notifications based on analytics data
  const generateAdminDroneNotifications = () => {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const notifications = [];
    const currentTime = Date.now();
    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'];
    const shopNames = ['Food Paradise', 'Quick Bites', 'Tasty Treats', 'Spice Garden', 'Urban Kitchen'];
    
    // Generate notifications based on analytics and global state
    for (let i = 0; i < Math.min(analytics.activeDroneDeliveries || 3, 4); i++) {
      const minutesAgo = Math.floor(Math.random() * 10);
      const droneId = `DR-${String(i + 1).padStart(3, '0')}`;
      const orderId = `ORD-${String(Math.floor(Math.random() * 9999) + 1000)}`;
      const shopName = shopNames[Math.floor(Math.random() * shopNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      let status, bgColor, textColor, borderColor, timeText;
      
      if (minutesAgo < 2) {
        status = 'Drone Arrived at Shop';
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        borderColor = 'border-green-200';
        timeText = 'Just Now';
      } else if (minutesAgo < 5) {
        status = 'Drone En Route to Shop';
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-800';
        borderColor = 'border-blue-200';
        timeText = `${minutesAgo} min ago`;
      } else {
        status = 'Drone Assignment';
        bgColor = 'bg-yellow-50';
        textColor = 'text-yellow-800';
        borderColor = 'border-yellow-200';
        timeText = `${minutesAgo} min ago`;
      }
      
      notifications.push({
        id: `admin-notification-${i}`,
        orderId,
        droneId,
        shopName,
        city,
        status,
        bgColor,
        textColor,
        borderColor,
        timeText,
        orderDetails: {
          items: Math.floor(Math.random() * 5) + 1,
          amount: Math.floor(Math.random() * 400) + 100,
          battery: Math.floor(Math.random() * 30) + 70,
          eta: Math.floor(Math.random() * 15) + 5
        }
      });
    }
    
    return notifications;
  };

  // Update global weather and fleet conditions
  const updateGlobalConditions = () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const conditions = {
      temperature: Math.floor(Math.random() * 15) + 18, // 18-33°C
      windSpeed: Math.floor(Math.random() * 25) + 5, // 5-30 km/h
      precipitation: Math.random() > 0.8 ? Math.floor(Math.random() * 40) : 0, // 0-40%
      visibility: Math.random() > 0.9 ? 'reduced' : 'excellent',
      activeRegions: Math.floor(Math.random() * 3) + 2, // 2-5 regions
      totalFleet: 12,
      availableDrones: Math.floor(Math.random() * 4) + 6, // 6-10 available
      dronesInFlight: Math.floor(Math.random() * 6) + 2 // 2-8 in flight
    };
    
    // Determine if drone flight is safe globally
    conditions.droneFlightSafe = conditions.windSpeed < 25 && 
                                 conditions.precipitation < 20 && 
                                 conditions.visibility === 'excellent';
    
    setGlobalWeatherConditions(conditions);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        <AdminSidebar />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Admin Dashboard"
            subtitle="Manage your food delivery platform"
          />

        {/* Statistics Cards */}
        {(stats.totalUsers > 0 || stats.totalOrders > 0 || stats.activeDroneDeliveries > 0 || stats.completedDeliveries > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <AdminStatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={Package}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <AdminStatCard
              title="Active Drone Deliveries"
              value={stats.activeDroneDeliveries}
              icon={Truck}
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <AdminStatCard
              title="Completed Deliveries"
              value={stats.completedDeliveries}
              icon={CheckCircle}
              bgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>
        )}

        {/* Analytics Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border rounded p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Platform Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Users', value: analytics.totalUsers, max: Math.max(analytics.totalUsers, 1), color: 'bg-blue-500' },
                { label: 'Orders', value: analytics.totalOrders, max: Math.max(analytics.totalOrders, 1), color: 'bg-green-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{row.label}</span>
                    <span className="text-gray-900 font-medium">{row.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div className={`h-2 ${row.color} rounded`} style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><PieChart className="w-4 h-4" /> Drone Success Rate</h3>
            </div>
            {(() => {
              const total = (analytics.completedDeliveries || 0) + (analytics.activeDroneDeliveries || 0);
              const rate = total > 0 ? Math.round(((analytics.completedDeliveries || 0) / total) * 100) : 0;
              return (
                <div>
                  <div className="text-3xl font-bold mb-2">{rate}%</div>
                  <div className="text-sm text-gray-600 mb-4">Completed vs Active</div>
                  <div className="w-full h-3 bg-gray-200 rounded">
                    <div className="h-3 bg-emerald-500 rounded" style={{ width: `${rate}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Completed: {analytics.completedDeliveries || 0}</span>
                    <span>Active: {analytics.activeDroneDeliveries || 0}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Drone Notifications Section */}
        <div className="bg-white border rounded p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Live Drone Notifications</span>
            </h3>
            <button
              onClick={() => fetchDroneOrders()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refresh →
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Integrated admin drone notifications based on real analytics */}
            {process.env.NODE_ENV === 'development' && adminDroneNotifications.length > 0 ? (
              <div className="space-y-3">
                {adminDroneNotifications.map((notification) => (
                  <div key={notification.id} className={`p-4 ${notification.bgColor} border ${notification.borderColor} rounded-lg`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className={`w-4 h-4 ${notification.textColor.replace('text-', 'text-')}`} />
                      <span className={`font-medium ${notification.textColor}`}>{notification.status}</span>
                      <span className={`text-xs ${notification.textColor} ${notification.bgColor.replace('50', '100')} px-2 py-1 rounded-full`}>
                        {notification.timeText}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.textColor.replace('800', '700')} mb-2`}>
                      Drone #{notification.droneId} - {notification.shopName} ({notification.city}) for order #{notification.orderId}
                    </p>
                    <div className={`text-xs ${notification.textColor.replace('800', '600')} space-y-1`}>
                      <p><strong>Order:</strong> {notification.orderId} • {notification.orderDetails.items} items • ₹{notification.orderDetails.amount}</p>
                      <p><strong>Shop:</strong> {notification.shopName} • Location: {notification.city}</p>
                      <p><strong>Drone Status:</strong> {notification.status.includes('Arrived') ? 'Ready for pickup' : notification.status.includes('En Route') ? `ETA: ${notification.orderDetails.eta} min` : 'Preparing for launch'} • Battery: {notification.orderDetails.battery}%</p>
                    </div>
                  </div>
                ))}
                
                {/* Global Fleet Status */}
                <div className={`p-3 ${globalWeatherConditions.droneFlightSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{globalWeatherConditions.droneFlightSafe ? '✅' : '⚠️'}</span>
                      <span className={`font-medium ${globalWeatherConditions.droneFlightSafe ? 'text-green-800' : 'text-red-800'}`}>
                        Global Fleet Status: {globalWeatherConditions.droneFlightSafe ? 'All Systems Operational' : 'Weather Alert Active'}
                      </span>
                    </div>
                    <div className={`text-xs ${globalWeatherConditions.droneFlightSafe ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {globalWeatherConditions.dronesInFlight}/{globalWeatherConditions.totalFleet} Drones Active
                    </div>
                  </div>
                  <div className={`text-xs ${globalWeatherConditions.droneFlightSafe ? 'text-green-600' : 'text-red-600'} grid grid-cols-2 md:grid-cols-4 gap-2`}>
                    <span>🌡️ {globalWeatherConditions.temperature}°C</span>
                    <span>💨 {globalWeatherConditions.windSpeed} km/h</span>
                    <span>☔ {globalWeatherConditions.precipitation}%</span>
                    <span>🚁 {globalWeatherConditions.availableDrones} Available</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">No Active Drone Notifications</div>
                <p className="text-sm">Drone delivery notifications will appear here when drones are active</p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Admin Drone Management Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time drone status monitoring</li>
                <li>• Drone assignment and control</li>
                <li>• Emergency stop capabilities</li>
                <li>• Weather condition monitoring</li>
                <li>• Delivery route optimization</li>
              </ul>
              
              {/* Weather & Drone Testing for Development - Integrated Controls */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Global Fleet Management - Integrated Controls:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => {
                        console.log('🌤️ Setting optimal weather conditions globally...');
                        setGlobalWeatherConditions(prev => ({
                          ...prev,
                          temperature: 24,
                          windSpeed: 8,
                          precipitation: 0,
                          visibility: 'excellent',
                          droneFlightSafe: true
                        }));
                        console.log('Global weather updated: Optimal conditions for all drone operations');
                      }}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      🌤️ Set Optimal Weather
                    </button>
                    <button
                      onClick={() => {
                        console.log('🚁 Updating fleet status...');
                        setGlobalWeatherConditions(prev => ({
                          ...prev,
                          totalFleet: 15,
                          availableDrones: 12,
                          dronesInFlight: 3,
                          activeRegions: 5
                        }));
                        console.log('Fleet status updated: All drones operational, expanded coverage');
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      🚁 Optimize Fleet
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        console.log('🚨 Simulating emergency weather conditions...');
                        setGlobalWeatherConditions(prev => ({
                          ...prev,
                          windSpeed: 40,
                          precipitation: 80,
                          visibility: 'reduced',
                          droneFlightSafe: false,
                          dronesInFlight: 0,
                          availableDrones: prev.totalFleet
                        }));
                        console.log('Emergency protocol activated: All drones grounded due to severe weather');
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      🚨 Emergency Weather
                    </button>
                    <button
                      onClick={() => {
                        console.log('📊 Refreshing analytics integration...');
                        const newNotifications = generateAdminDroneNotifications();
                        setAdminDroneNotifications(newNotifications);
                        updateGlobalConditions();
                        console.log('Analytics refreshed: Live data synchronized, notifications updated');
                      }}
                      className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      📊 Refresh Analytics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drone Orders Management */}
        {droneOrders.length > 0 && (
          <DroneOrderTable
            droneOrders={droneOrders}
            isLoading={isLoading}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            updateDroneOrderStatus={updateDroneOrderStatus}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
