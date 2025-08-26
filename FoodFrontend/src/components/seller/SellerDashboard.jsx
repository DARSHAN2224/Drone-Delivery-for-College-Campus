import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notificationHelpers } from '../../utils/notificationHelpers';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../stores/api.js';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  BarChart3,
  Store,
  Star,
  Drone
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import SellerProductGrid from './SellerProductGrid';
import SellerOrders from './SellerOrders';
import SellerAnalytics from './SellerAnalytics';
import SellerShopTab from './SellerShopTab';
import SellerOffers from './SellerOffers';
import PageHeader from '../common/PageHeader';
import { useNotificationStore } from '../../stores/notificationStore';

 

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current tab from URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/seller') return 'overview';
    if (path === '/seller/products') return 'products';
    if (path === '/seller/orders') return 'orders';
    if (path === '/seller/shop') return 'shop';
    if (path === '/seller/offers') return 'offers';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [offers, setOffers] = useState([]);
  const [deleteInProgress, setDeleteInProgress] = useState(new Set());
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [orderSubmittingId, setOrderSubmittingId] = useState(null);
  const [orderSubmittingAction, setOrderSubmittingAction] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  // Drone delivery state - integrated into actual workflow
  const [droneOrders, setDroneOrders] = useState([]);
  const [droneNotifications, setDroneNotifications] = useState([]);
  const [weatherConditions, setWeatherConditions] = useState({
    temperature: 24,
    windSpeed: 12,
    precipitation: 0,
    visibility: 'excellent',
    droneFlightSafe: true
  });

  // Generate mock drone notifications integrated into actual workflow
  const generateDroneNotifications = () => {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const notifications = [];
    const currentTime = Date.now();
    
    // Generate notifications based on actual orders
    orders.forEach((order, index) => {
      if (Math.random() > 0.3) { // 70% chance an order has drone delivery
        const droneId = `DR-${String(index + 1).padStart(3, '0')}`;
        const orderAge = currentTime - new Date(order.createdAt || Date.now()).getTime();
        const minutesAgo = Math.floor(orderAge / 60000);
        
        let status, bgColor, textColor, borderColor, timeText;
        
        if (minutesAgo < 2) {
          status = 'Drone Arrived for Delivery';
          bgColor = 'bg-green-50';
          textColor = 'text-green-800';
          borderColor = 'border-green-200';
          timeText = 'Just Now';
        } else if (minutesAgo < 5) {
          status = 'Drone En Route';
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
          id: `notification-${order._id || index}`,
          orderId: order._id || `order-${index}`,
          droneId,
          status,
          message: `Drone ${droneId} - ${status.toLowerCase()}`,
          bgColor,
          textColor,
          borderColor,
          timeText,
          orderDetails: {
            items: order.totalQuantity || Math.floor(Math.random() * 5) + 1,
            amount: order.totalPrice || Math.floor(Math.random() * 400) + 100,
            customer: `Customer ${index + 1}`,
            battery: Math.floor(Math.random() * 30) + 70
          }
        });
      }
    });
    
    return notifications.slice(0, 3); // Show max 3 notifications
  };

  // Update weather conditions dynamically
  const updateWeatherConditions = () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const conditions = {
      temperature: Math.floor(Math.random() * 15) + 18, // 18-33°C
      windSpeed: Math.floor(Math.random() * 25) + 5, // 5-30 km/h
      precipitation: Math.random() > 0.8 ? Math.floor(Math.random() * 40) : 0, // 0-40%
      visibility: Math.random() > 0.9 ? 'reduced' : 'excellent'
    };
    
    // Determine if drone flight is safe
    conditions.droneFlightSafe = conditions.windSpeed < 25 && 
                                 conditions.precipitation < 20 && 
                                 conditions.visibility === 'excellent';
    
    setWeatherConditions(conditions);
  };

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);

  // Auto-update drone notifications and weather conditions
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && orders.length > 0) {
      const notifications = generateDroneNotifications();
      setDroneNotifications(notifications);
      
      // Update weather every 30 seconds
      updateWeatherConditions();
      const weatherInterval = setInterval(updateWeatherConditions, 30000);
      
      return () => clearInterval(weatherInterval);
    }
  }, [orders]);

  // Handle tab change by navigating to the appropriate route
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'overview':
        navigate('/seller');
        break;
      case 'products':
        navigate('/seller/products');
        break;
      case 'orders':
        navigate('/seller/orders');
        break;
      case 'shop':
        navigate('/seller/shop');
        break;
      case 'offers':
        navigate('/seller/offers');
        break;
      default:
        navigate('/seller');
    }
  };

  // Shop profile state
  const [shop, setShop] = useState(null);
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    state: '',
    city: '',
    location: '',
    FSSAI_license: '',
    Eating_house_license: '',
    Healt_or_trade_license: '',
    Liquior_license: '',
    Gst_registration: '',
    Environmental_clearance_license: '',
    Fire_safety_license: '',
    Signage_license: '',
    Shop_act: '',
    Insurance: '',
    contactNumber: '',
    openingHours: '',
    closingHours: '',
    isActive: 'yes', // 'yes' | 'no'
    image: null,
  });

  const [dynamicTabs] = useState([
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      component: 'overview'
    },
    {
      id: 'products',
      label: 'Products',
      icon: '🍕',
      component: 'products'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📦',
      component: 'orders'
    },
    {
      id: 'shop',
      label: 'Shop Profile',
      icon: '🏪',
      component: 'shop'
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: '🎯',
      component: 'offers'
    }
  ]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all | available | out
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 10;

  // Product add form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    discount: '',
    image: null,
  });

  const fetchAll = async () => {
    let mounted = true;
    try {
      // Try multiple endpoints to get complete shop data
      const [homeRes, prodRes, ordersRes, offersRes] = await Promise.all([
        api.get('/seller/home'),
        api.get('/seller/products'),
        api.get('/seller/orders'),
        api.get('/seller/offers'),
      ]);
      
      // Try to get shop data from different endpoints
      let shopRes = null;
      try {
        shopRes = await api.get('/seller/shop');
      } catch (error) {
        try {
          shopRes = await api.get('/seller/shops');
        } catch (error2) {
          // Silently fail if both endpoints fail
        }
      }
      if (!mounted) return;
        
        const homeData = homeRes?.data?.data || {};
        
        setStats({
          productCount: homeData.productCount || 0,
          offerCount: homeData.offerCount || 0,
          orderCount: homeData.orderCount || 0,
          shop: homeData.shop || null,
          orderChangePct: typeof homeData.orderChangePct === 'number' ? homeData.orderChangePct : undefined,
          productChangePct: typeof homeData.productChangePct === 'number' ? homeData.productChangePct : undefined,
        });
        
        // Get shop data - prioritize direct shop endpoint if home endpoint is incomplete
        let shopData = null;
        
        // Check home endpoint shop data
        if (homeData.shop) {
          shopData = homeData.shop;
        }
        
        // Check direct shop endpoint data
        if (shopRes?.data?.data) {
          const directShopData = Array.isArray(shopRes.data.data) ? shopRes.data.data[0] : shopRes.data.data;
          if (directShopData) {
            // Use direct shop data if it has more complete information
            if (directShopData.contactNumber || directShopData.openingHours || directShopData.closingHours) {
              shopData = directShopData;
            }
          }
        }
        
        if (shopData) {
          setShop(shopData);
          setShopForm({
            name: shopData.name || '',
            description: shopData.description || '',
            state: shopData.state || '',
            city: shopData.city || '',
            location: shopData.location || '',
            FSSAI_license: shopData.FSSAI_license || '',
            Gst_registration: shopData.Gst_registration || '',
            Shop_act: shopData.Shop_act || '',
            contactNumber: shopData.contactNumber || '',
            openingHours: shopData.openingHours || '',
            closingHours: shopData.closingHours || '',
            isActive: shopData.isActive ? 'yes' : 'no',
            image: null,
          });
        } else {
          // No shop exists - set shop to null and reset form
          console.log('No shop found - setting shop to null');
          setShop(null);
          setShopForm({
            name: '',
            description: '',
            state: '',
            city: '',
            location: '',
            FSSAI_license: '',
            Eating_house_license: '',
            Healt_or_trade_license: '',
            Liquior_license: '',
            Gst_registration: '',
            Environmental_clearance_license: '',
            Fire_safety_license: '',
            Signage_license: '',
            Shop_act: '',
            Insurance: '',
            contactNumber: '',
            openingHours: '',
            closingHours: '',
            isActive: 'yes',
            image: null,
          });
        }
        
        // Set products from the products endpoint - handle different data structures
        let productsData = [];
        
        if (prodRes?.data?.data?.products) {
          // Structure: { data: { data: { products: [...] } } }
          productsData = prodRes.data.data.products;
        } else if (Array.isArray(prodRes?.data?.data)) {
          // Structure: { data: { data: [...] } } - direct array
          productsData = prodRes.data.data;
        } else if (Array.isArray(prodRes?.data)) {
          // Structure: { data: [...] } - direct array
          productsData = prodRes.data;
        } else if (prodRes?.data?.data) {
          // Try to extract any array-like structure
          const dataObj = prodRes.data.data;
          if (Array.isArray(dataObj)) {
            productsData = dataObj;
          } else {
            // Look for any array property in the object
            const arrayProps = Object.keys(dataObj).filter(key => Array.isArray(dataObj[key]));
            if (arrayProps.length > 0) {
              productsData = dataObj[arrayProps[0]];
            }
          }
        }
        setProducts(productsData);
        
        // Set orders from the orders endpoint
        const ordersData = ordersRes?.data?.data || {};
        
        // Handle different possible order data structures
        let arrived = [];
        let processing = [];
        let ready = [];
        
        if (Array.isArray(ordersData)) {
          // If ordersData is an array, categorize by status
          ordersData.forEach(order => {
            if (order.status === 'arrived' || order.status === 'pending') {
              arrived.push(order);
            } else if (order.status === 'processing' || order.status === 'preparing') {
              processing.push(order);
            } else if (order.status === 'ready' || order.status === 'completed') {
              ready.push(order);
            }
          });
        } else {
          // If ordersData is an object with categorized orders
          arrived = ordersData.arrivedOrders || ordersData.pendingOrders || [];
          processing = ordersData.processingOrders || ordersData.preparingOrders || [];
          ready = ordersData.readyOrders || ordersData.completedOrders || [];
        }
        setOrders([...arrived, ...processing, ...ready]);
        setOrdersByStatus({ arrived, preparing: processing, ready });
        
        // Set offers from the offers endpoint
        const offersData = offersRes?.data?.data || [];
        // Extract offers array if it's wrapped in an object
        const offersArray = Array.isArray(offersData) ? offersData : (offersData.offers || []);
        setOffers(offersArray);
      } catch (e) {
        console.error('Failed to load seller dashboard data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    useEffect(() => {
      fetchAll();
    }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const allowed = ['overview','shop','products','orders','analytics'];
    if (tab && allowed.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Shop data is now loaded from the home endpoint in the main useEffect above

  // Derived metrics from orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? o.totalAmount ?? 0), 0);
  const avgOrderValue = orders.length ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0;

  // Tabs are dynamic based on fetched data

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Orders This Month"
          value={`${stats.orderCount}`}
          icon={ShoppingCart}
          change={typeof stats.orderChangePct === 'number' ? `${Math.abs(stats.orderChangePct)}%` : undefined}
          changeType={(typeof stats.orderChangePct === 'number' && stats.orderChangePct < 0) ? 'negative' : 'positive'}
        />
        <StatCard
          title="Active Products"
          value={`${stats.productCount}`}
          icon={Package}
          change={typeof stats.productChangePct === 'number' ? `${Math.abs(stats.productChangePct)}%` : undefined}
          changeType={(typeof stats.productChangePct === 'number' && stats.productChangePct < 0) ? 'negative' : 'positive'}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          icon={DollarSign}
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${avgOrderValue}`}
          icon={TrendingUp}
        />
      </div>

      {/* Shop Products Overview */}
      {shop && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Shop Overview</h3>
            <Link to="/seller?tab=shop" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Shop Details →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{shop.productId?.length || 0}</div>
              <div className="text-sm text-gray-600">Products Linked</div>
              <div className="text-xs text-gray-500 mt-1">to your shop</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.productCount}</div>
              <div className="text-sm text-gray-600">Active Products</div>
              <div className="text-xs text-gray-500 mt-1">currently available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.orderCount}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
          </div>
          {shop.productId && shop.productId.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">No products linked to shop</p>
                  <p className="text-sm text-yellow-700">Add products to start selling and see them appear in your shop's product list.</p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                if (!confirm('Delete seller account? This will remove your access.')) return;
                try {
                  await api.delete('/seller/delete-account');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('deviceId');
                  window.location.href = '/login';
                } catch (e) {
                  alert(e?.response?.data?.message || 'Failed to delete account');
                }
              }}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded"
            >
              Delete Seller Account
            </button>
          </div>
        </div>
      )}

      {/* Drone Notifications Section */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center space-x-2">
            <Drone className="w-5 h-5 text-blue-600" />
            <span>Drone Delivery Notifications</span>
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh →
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Integrated drone notifications based on actual orders */}
          {process.env.NODE_ENV === 'development' && droneNotifications.length > 0 ? (
            <div className="space-y-3">
              {droneNotifications.map((notification) => (
                <div key={notification.id} className={`p-4 ${notification.bgColor} border ${notification.borderColor} rounded-lg`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Drone className={`w-4 h-4 ${notification.textColor.replace('text-', 'text-')}`} />
                    <span className={`font-medium ${notification.textColor}`}>{notification.status}</span>
                    <span className={`text-xs ${notification.textColor} ${notification.bgColor.replace('50', '100')} px-2 py-1 rounded-full`}>
                      {notification.timeText}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.textColor.replace('800', '700')} mb-2`}>
                    Drone {notification.droneId} - {notification.status.toLowerCase()} for order #{notification.orderId.slice(-8)}
                  </p>
                  <div className={`text-xs ${notification.textColor.replace('800', '600')} space-y-1`}>
                    <p><strong>Order:</strong> #{notification.orderId.slice(-8)} • {notification.orderDetails.items} items • ₹{notification.orderDetails.amount}</p>
                    <p><strong>Customer:</strong> {notification.orderDetails.customer} • Weather: {weatherConditions.droneFlightSafe ? 'Safe' : 'Caution'}</p>
                    <p><strong>Drone Status:</strong> {notification.status.includes('Arrived') ? 'Ready for pickup' : notification.status.includes('En Route') ? 'In flight' : 'Preparing'} • Battery: {notification.orderDetails.battery}%</p>
                  </div>
                </div>
              ))}
              
              {/* Weather Status Alert */}
              <div className={`p-3 ${weatherConditions.droneFlightSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{weatherConditions.droneFlightSafe ? '✅' : '⚠️'}</span>
                  <span className={`font-medium ${weatherConditions.droneFlightSafe ? 'text-green-800' : 'text-red-800'}`}>
                    Weather Status: {weatherConditions.droneFlightSafe ? 'Safe for Drone Flight' : 'Drone Flight Restricted'}
                  </span>
                </div>
                <div className={`text-xs ${weatherConditions.droneFlightSafe ? 'text-green-600' : 'text-red-600'} grid grid-cols-2 md:grid-cols-4 gap-2`}>
                  <span>🌡️ {weatherConditions.temperature}°C</span>
                  <span>💨 {weatherConditions.windSpeed} km/h</span>
                  <span>☔ {weatherConditions.precipitation}%</span>
                  <span>👁️ {weatherConditions.visibility}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Drone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">No Active Drone Notifications</div>
              <p className="text-sm">Drone delivery notifications will appear here when drones are assigned to your orders</p>
            </div>
          )}
          
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Drone Delivery Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time drone arrival notifications</li>
                <li>• Live tracking of drone locations</li>
                <li>• Order pickup confirmations</li>
                <li>• Weather condition updates</li>
                <li>• Emergency stop notifications</li>
              </ul>
              
              {/* Weather Testing for Development - Integrated with actual state */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Weather Testing - Integrated Controls:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        console.log('🌤️ Setting clear weather conditions...');
                        setWeatherConditions({
                          temperature: 25,
                          windSpeed: 8,
                          precipitation: 0,
                          visibility: 'excellent',
                          droneFlightSafe: true
                        });
                        console.log('Weather updated: Clear skies, perfect for drone delivery!');
                      }}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      🌤️ Set Clear Weather
                    </button>
                    <button
                      onClick={() => {
                        console.log('🌧️ Setting rainy weather conditions...');
                        setWeatherConditions({
                          temperature: 18,
                          windSpeed: 25,
                          precipitation: 30,
                          visibility: 'reduced',
                          droneFlightSafe: false
                        });
                        console.log('Weather updated: Rainy conditions, drone delivery restricted!');
                      }}
                      className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                    >
                      🌧️ Set Rainy Weather
                    </button>
                    <button
                      onClick={() => {
                        console.log('💨 Setting windy weather conditions...');
                        setWeatherConditions({
                          temperature: 22,
                          windSpeed: 45,
                          precipitation: 0,
                          visibility: 'excellent',
                          droneFlightSafe: false
                        });
                        console.log('Weather updated: Strong winds, drone delivery blocked!');
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      💨 Set Windy Weather
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );

  const refreshOrders = async () => {
    try {
      const ordersRes = await api.get('/seller/orders');
      const ordersData = ordersRes?.data?.data || {};
      const arrived = ordersData.arrivedOrders || [];
      const processing = ordersData.processingOrders || [];
      const ready = ordersData.readyOrders || [];
      setOrders([...(arrived || []), ...(processing || []), ...(ready || [])]);
      setOrdersByStatus({ arrived, preparing: processing, ready });
    } catch (e) {
      console.error('Failed to refresh orders:', e);
    }
  };

  const refreshProducts = async () => {
    try {
      const prodRes = await api.get('/seller/products');
      setProducts(prodRes?.data?.data?.products || []);
    } catch (e) {
      console.error('Failed to refresh products:', e);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    if (deleteInProgress.has(productId)) return; // Prevent duplicate calls
    
    // Add confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!isConfirmed) return;
    
    setDeleteInProgress(prev => new Set(prev).add(productId));
    setDeletingProductId(productId);
    
    try {
      await api.delete(`/seller/products/${productId}`);
      await refreshProducts();
      notificationHelpers.onSuccess('Deleted', 'Product deleted successfully');
    } catch (e) {
      const resp = e?.response?.data;
      const message = resp?.message || e?.message || 'Failed to delete product';
      notificationHelpers.onError('Delete Failed', message);
    } finally {
      setDeleteInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      setDeletingProductId(null);
    }
  };

  const handleProductChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      setProductForm((prev) => ({ ...prev, [name]: files && files[0] ? files[0] : null }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (productSubmitting) return;
    
    // Check if shop exists
    if (!shop?._id) {
      notificationHelpers.onError('No Shop', 'Please create a shop first before adding products.');
      return;
    }
    
    setProductSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      });
      
      // Add shopId to the form data
      formData.append('shopId', shop._id);
      
      // Log the data being sent for debugging
      console.log('Product data being sent:', Object.fromEntries(formData));
      console.log('Shop ID being used:', shop._id);
      
      await api.post('/seller/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshProducts();
      setShowAddProduct(false);
      setProductForm({ name: '', price: '', description: '', category: '', stock: '', discount: '', image: null });
      notificationHelpers.onSuccess('Success', 'Product added successfully!');
    } catch (err) {
      console.error('Failed to add product:', err);
      
      // Enhanced error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      }
      
      // Log the product data that was sent
      console.error('Product data that was sent:', productForm);
      console.error('Shop data:', shop);
      
      // Get specific error message from backend if available
      let errorMessage = 'Failed to add product';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      notificationHelpers.onError('Add Product Failed', errorMessage);
    } finally {
      setProductSubmitting(false);
    }
  };

  const callOrderAction = async (orderId, action, payload) => {
    if (!orderId) return;
    setOrderSubmittingId(orderId);
    setOrderSubmittingAction(action);
    try {
      // Map frontend actions to backend status values
      let status = '';
      if (action === 'accept') status = 'arrived';
      if (action === 'process') status = 'preparing';
      if (action === 'ready') status = 'ready';
      if (action === 'deliver') status = 'delivered';
      if (action === 'cancel') status = 'cancelled';

      // Get the shop ID from the first order's shops array
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const shopId = order.shops?.[0]?.shopId?._id || order.shops?.[0]?.shopId;
      if (!shopId) {
        throw new Error('Shop not found in order');
      }

      const requestPayload = {
        orderId,
        shopId,
        status,
        ...(payload || {})
      };

      // Handle drone delivery when marking ready
      if (action === 'ready' && order.deliveryType === 'drone') {
        try {
          // Call drone to shop
          await api.post('/drone/call-to-shop', {
            orderId,
            shopId,
            shopLocation: shop?.location || 'Shop Location'
          });
          notificationHelpers.onSuccess('Drone Called', 'Drone has been called to your shop for pickup');
        } catch (droneError) {
          console.error('Drone call failed:', droneError);
          notificationHelpers.onWarning('Drone Call Failed', 'Order marked ready but drone call failed. Please contact admin.');
        }
      }

      await api.patch('/seller/orders/status', requestPayload);
      await refreshOrders();
      
      const successText = action === 'accept' ? 'Order accepted' : 
                         action === 'process' ? 'Order marked as preparing' : 
                         action === 'ready' ? (order.deliveryType === 'drone' ? 'Order ready - Drone called' : 'Order marked as ready') : 
                         action === 'deliver' ? 'Order marked as delivered' :
                         'Order cancelled';
      notificationHelpers.onSuccess('Success', successText);
    } catch (e) {
      const resp = e?.response?.data;
      const message = resp?.message || e?.message || 'Request failed';
      notificationHelpers.onError('Action Failed', message);
    } finally {
      setOrderSubmittingId(null);
      setOrderSubmittingAction('');
    }
  };

  const handleAcceptOrder = (orderId) => callOrderAction(orderId, 'accept');
  const handleProcessOrder = (orderId) => callOrderAction(orderId, 'process');
  const handleMarkReady = (orderId) => callOrderAction(orderId, 'ready');
  const handleDeliverOrder = (orderId) => callOrderAction(orderId, 'deliver');
  const handleCancelOrder = (orderId) => {
    const reason = window.prompt('Enter cancel reason (optional):') || '';
    return callOrderAction(orderId, 'cancel', { cancelReason: reason });
  };

  // Enhanced cancel order with better UI
  const handleCancelOrderWithDialog = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    const orderNumber = order?.orderToken || order?._id?.slice(-8);
    
    const reason = window.prompt(
      `Cancel Order #${orderNumber}?\n\nPlease enter a reason for cancellation (optional):\n\nThis will notify the customer that their order has been cancelled.`,
      ''
    );
    
    if (reason !== null) { // User didn't click Cancel
      return callOrderAction(orderId, 'cancel', { cancelReason: reason });
    }
  };

  const handleShopInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      setShopForm((prev) => ({ ...prev, [name]: files && files[0] ? files[0] : null }));
    } else {
      setShopForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitShop = async (e) => {
    e.preventDefault();
    if (shopSubmitting) return;
    setShopSubmitting(true);
    try {
      // Normalize defaults for required time fields to satisfy validator
      const normalized = {
        ...shopForm,
        openingHours: shopForm.openingHours && shopForm.openingHours.length >= 2 ? shopForm.openingHours : '09:00',
        closingHours: shopForm.closingHours && shopForm.closingHours.length >= 2 ? shopForm.closingHours : '21:00',
      };
      const formData = new FormData();
      Object.entries(normalized).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      });

      const endpoint = shop ? `/seller/shops/${shop._id}` : '/seller/shops';
      const method = shop ? 'patch' : 'post';
      console.log('Submitting shop data:', { endpoint, method, formData: Object.fromEntries(formData) });
      
      const response = await api[method](endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      console.log('Shop submission response:', response);

      // Reload to reflect saved values
      const refreshed = await api.get('/seller/home');
      const homeData = refreshed?.data?.data || {};
      if (homeData.shop) {
        console.log('Updated shop data:', homeData.shop);
        setShop(homeData.shop);
      }
      notificationHelpers.onSuccess('Shop Saved', shop ? 'Your shop profile has been updated.' : 'Your shop has been created.');
    } catch (err) {
      const resp = err?.response?.data;
      const errorsArr = Array.isArray(resp?.errors) ? resp.errors.map(e => e?.msg).filter(Boolean).join(' ') : '';
      const message = resp?.message || err?.message || 'Failed to save shop profile';
      notificationHelpers.onError('Shop Save Failed', `${message}${errorsArr ? `: ${errorsArr}` : ''}`);
    } finally {
      setShopSubmitting(false);
    }
  };

  const renderShop = () => (
    <div className="space-y-6">
      <SellerShopTab
        shopData={shop}
        onUpdate={(updatedShop) => {
          setShop(updatedShop);
          // Refresh shop data
          fetchAll();
        }}
      />
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-6">
      <SellerOffers 
        offers={offers}
        onUpdate={(updatedOffers) => {
          setOffers(updatedOffers);
          // Refresh offers data
          fetchAll();
        }}
      />
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="btn-primary px-4 py-2 text-sm"
              >
                {showAddProduct ? 'Cancel' : 'Add Product'}
              </button>
            </div>
        </div>
        <div className="p-6">
          {showAddProduct && (
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-3">New Product</h4>
              <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input name="name" value={productForm.name} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input name="price" type="number" step="0.01" value={productForm.price} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input name="category" value={productForm.category} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., Pizza, Burger, Dessert" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" value={productForm.description} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows="2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input name="stock" type="number" value={productForm.stock} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                  <input name="discount" type="number" step="0.01" value={productForm.discount} onChange={handleProductChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input type="file" name="image" accept="image/*" onChange={handleProductChange} className="mt-1 w-full" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" disabled={productSubmitting} className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {productSubmitting ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">No products found</div>
              <div className="text-gray-600 mb-4">You haven't added any products yet.</div>
              <button
                onClick={() => setShowAddProduct(true)}
                className="btn-primary px-6 py-3"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <SellerProductGrid
              products={products}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              productPage={productPage}
              setProductPage={setProductPage}
              pageSize={productPageSize}
              onDelete={handleDeleteProduct}
              deleteInProgress={deleteInProgress}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
                      <SellerOrders
            loading={loading}
            ordersByStatus={ordersByStatus}
            onAccept={handleAcceptOrder}
            onProcess={handleProcessOrder}
            onReady={handleMarkReady}
            onDeliver={handleDeliverOrder}
            onCancel={handleCancelOrderWithDialog}
            submittingId={orderSubmittingId}
            submittingAction={orderSubmittingAction}
          />
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <SellerAnalytics
        totalRevenue={totalRevenue}
        avgOrderValue={avgOrderValue}
        orders={orders}
      />
    </div>
  );



  const renderFeedback = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Feedback & Engagement</h3>
          <p className="text-sm text-gray-600 mt-1">Monitor ratings, comments, and customer engagement for your products and shop</p>
        </div>
        <div className="p-6">
          {/* Shop Rating Summary */}
          {shop && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Shop Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {shop.averageRating ? shop.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {shop.totalRatings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Ratings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {shop.totalLikes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {shop.totalFavorites || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Favorites</div>
                </div>
              </div>
            </div>
          )}

          {/* Product Ratings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Product Ratings</h4>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{product.name}</h5>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>₹{product.price}</span>
                        <span>•</span>
                        <span>Stock: {product.stock || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(product.averageRating || 0) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.averageRating ? `${(product.averageRating).toFixed(1)} (${product.totalRatings || 0})` : 'No ratings'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {product.totalLikes || 0} likes • {product.totalComments || 0} comments • {product.totalFavorites || 0} favorites
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Delivery Management</h3>
          <p className="text-sm text-gray-600 mt-1">Track delivery status and manage outgoing orders</p>
        </div>
        <div className="p-6">
          {/* Delivery Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'ready').length}
              </div>
              <div className="text-sm text-blue-600">Ready for Delivery</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'out_for_delivery').length}
              </div>
              <div className="text-sm text-yellow-600">Out for Delivery</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-green-600">Delivered Today</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <div className="text-sm text-purple-600">Cancelled</div>
            </div>
          </div>

          {/* Active Deliveries */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Active Deliveries</h4>
            <div className="space-y-3">
              {orders
                .filter(order => ['ready', 'out_for_delivery'].includes(order.status))
                .map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">Order #{order._id.slice(-6)}</h5>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items • ₹{order.totalAmount || 0}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        order.status === 'ready' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'ready' ? 'Ready' : 'Out for Delivery'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Customer:</span>
                        <span className="ml-2 text-gray-600">{order.customerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Delivery Address:</span>
                        <span className="ml-2 text-gray-600">{order.deliveryAddress || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Order Time:</span>
                        <span className="ml-2 text-gray-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Estimated Delivery:</span>
                        <span className="ml-2 text-gray-600">
                          {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {order.status === 'ready' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleProcessOrder(order._id)}
                          disabled={orderSubmittingId === order._id && orderSubmittingAction === 'process'}
                          className="btn-primary text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                        >
                          {orderSubmittingId === order._id && orderSubmittingAction === 'process' ? 'Processing...' : 'Start Delivery'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              
              {orders.filter(order => ['ready', 'out_for_delivery'].includes(order.status)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium mb-2">No active deliveries</div>
                  <p className="text-sm">Orders will appear here when they're ready for delivery</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Seller Dashboard"
        subtitle="Manage your shop, products, and orders"
        breadcrumbs={[
          { name: 'Dashboard', href: '/seller' },
          { name: 'Seller Panel', href: '/seller' }
        ]}
      />

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">
          {activeTab === 'overview' && 'Dashboard Overview'}
          {activeTab === 'products' && 'Product Management'}
          {activeTab === 'orders' && 'Order Management'}
          {activeTab === 'shop' && 'Shop Profile'}
          {activeTab === 'offers' && 'Offer Management'}
        </h2>
        <p className="text-gray-600 mt-2">
          {activeTab === 'overview' && 'Monitor your shop performance and key metrics'}
          {activeTab === 'products' && 'Manage your product catalog and inventory'}
          {activeTab === 'orders' && 'Track and manage customer orders'}
          {activeTab === 'shop' && 'Update your shop information and settings'}
          {activeTab === 'offers' && 'Create and manage promotional offers'}
        </p>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'offers' && renderOffers()}
      </div>
    </div>
  );
};

export default SellerDashboard;
