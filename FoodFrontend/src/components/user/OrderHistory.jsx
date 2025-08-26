import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const OrderHistory = () => {
  const { getOrderHistory, orderHistory, isLoading, error } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    console.log('🔄 OrderHistory component: Calling getOrderHistory...');
    getOrderHistory();
  }, [getOrderHistory]);

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    if (!debugMode) {
      document.body.classList.add('debug');
      console.log('🔍 Debug mode enabled - all elements will have visible borders');
    } else {
      document.body.classList.remove('debug');
      console.log('🔍 Debug mode disabled');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = (() => {
    // Safety check: ensure orderHistory is an array
    if (!Array.isArray(orderHistory)) {
      console.warn('⚠️ OrderHistory: orderHistory is not an array:', typeof orderHistory, orderHistory);
      return [];
    }
    
    return orderHistory.filter(order => {
      if (filter === 'all') return true;
      // Handle both order.status and order.deliveryStatus
      const orderStatus = order.status || order.deliveryStatus || 'pending';
      return orderStatus.toLowerCase() === filter;
    });
  })();

  // Debug logging
  useEffect(() => {
    console.log('🔍 OrderHistory component: orderHistory changed:', orderHistory);
    console.log('🔍 OrderHistory component: filteredOrders:', filteredOrders);
    
    // Debug: Show detailed order structure
    if (Array.isArray(orderHistory) && orderHistory.length > 0) {
      console.log('📋 Detailed order structure:');
      orderHistory.forEach((order, index) => {
        console.log(`  Order ${index}:`, {
          id: order._id,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          shops: order.shops,
          items: order.items,
          totalPrice: order.totalPrice,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          deliveryLocation: order.deliveryLocation
        });
        
        // Show shop details if available
        if (order.shops && order.shops.length > 0) {
          console.log(`    Shops in order ${index}:`);
          order.shops.forEach((shop, shopIndex) => {
            console.log(`      Shop ${shopIndex}:`, {
              shopId: shop.shopId,
              shopIdType: typeof shop.shopId,
              status: shop.status,
              products: shop.products
            });
          });
        }
      });
    } else {
      console.log('❌ OrderHistory: No orders found in orderHistory');
      console.log('🔍 orderHistory type:', typeof orderHistory);
      console.log('🔍 orderHistory length:', Array.isArray(orderHistory) ? orderHistory.length : 'N/A');
      console.log('🔍 orderHistory value:', orderHistory);
      console.log('🔍 orderHistory isArray:', Array.isArray(orderHistory));
    }
  }, [orderHistory, filteredOrders]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <div className="flex items-center space-x-2">
              {/* Debug Mode Toggle */}
              <button
                onClick={toggleDebugMode}
                className={`debug-button px-3 py-2 rounded text-sm font-medium ${
                  debugMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {debugMode ? '🔍 Debug ON' : '🔍 Debug OFF'}
              </button>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
                                {/* Debug: Show raw order data */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Debug Info:</h4>
              <p className="text-sm text-blue-700">
                orderHistory length: {orderHistory?.length || 0} | 
                filteredOrders length: {filteredOrders?.length || 0} | 
                isLoading: {isLoading.toString()} | 
                Error: {error || 'None'}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Note:</strong> This page shows only OrderHistory model data (completed/archived orders)
              </p>
              
              {/* CSS Test Section */}
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                <h5 className="font-medium text-purple-900 mb-2">🧪 CSS Test Buttons:</h5>
                                 <div className="flex flex-wrap gap-2">
                   <button 
                     className="test-button px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                   >
                     🔵 Blue Test Button
                   </button>
                   <button 
                     className="test-button px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                   >
                     🔴 Red Test Button
                   </button>
                   <button 
                     className="test-button px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                   >
                     🟢 Green Test Button
                   </button>
                 </div>
                <p className="text-xs text-purple-700 mt-2">
                  If you can see these colored buttons, CSS is working correctly
                </p>
              </div>
              
              {/* Test Archive Button */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/v1/users/orders/archive-completed', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                      });
                      const result = await response.json();
                      console.log('📦 Archive result:', result);
                      if (result.success) {
                        alert(`Archived ${result.data.archivedCount} orders successfully!`);
                        // Refresh the order history
                        getOrderHistory();
                      } else {
                        alert('Archive failed: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Archive error:', error);
                      alert('Archive failed: ' + error.message);
                    }
                  }}
                  className="test-button px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  🔄 Test Archive Completed Orders
                </button>
                <p className="text-xs text-yellow-700 mt-2">
                  This will move completed orders from Order model to OrderHistory model
                </p>
              </div>
              
              {/* Test Complete Order Button */}
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <button 
                  onClick={async () => {
                    try {
                      // Get the first order ID from userOrders (we need to fetch this first)
                      const ordersResponse = await fetch('/api/v1/users/orders', {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                      });
                      const ordersData = await ordersResponse.json();
                      
                      if (ordersData.data && ordersData.data.length > 0) {
                        const orderId = ordersData.data[0]._id;
                        const response = await fetch(`/api/v1/users/orders/${orderId}/test-complete`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                          }
                        });
                        const result = await response.json();
                        console.log('✅ Test complete result:', result);
                        if (result.success) {
                          alert('Order marked as completed! Now try archiving it.');
                        } else {
                          alert('Mark as completed failed: ' + result.message);
                        }
                      } else {
                        alert('No orders found to mark as completed');
                      }
                    } catch (error) {
                      console.error('Test complete error:', error);
                      alert('Test complete failed: ' + error.message);
                    }
                  }}
                  className="test-button px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  ✅ Test Mark Order as Completed
                </button>
                <p className="text-xs text-green-700 mt-2">
                  This will mark an order as completed so it can be archived
                </p>
              </div>
              
              {Array.isArray(orderHistory) && orderHistory.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  <p>First order ID: {orderHistory[0]?._id}</p>
                  <p>First order status: {orderHistory[0]?.status || 'undefined'}</p>
                  <p>First order deliveryStatus: {orderHistory[0]?.deliveryStatus || 'undefined'}</p>
                </div>
              )}
            </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No ${filter} orders found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status || order.deliveryStatus)}
                      <div>
                        <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || order.deliveryStatus)}`}>
                      {order.status || order.deliveryStatus || 'pending'}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3">
                    {/* Shop Information */}
                    {order.shops && order.shops.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Shop Details:</h4>
                        {order.shops.map((shop, shopIndex) => (
                          <div key={shopIndex} className="mb-2 last:mb-0">
                            <p className="text-sm text-gray-600">
                              <strong>Shop ID:</strong> {typeof shop.shopId === 'object' ? shop.shopId.toString() : shop.shopId}
                              {shop.status && (
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(shop.status)}`}>
                                  {shop.status}
                                </span>
                              )}
                            </p>
                            
                            {/* Products in this shop */}
                            {shop.products && shop.products.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {shop.products.map((product, productIndex) => (
                                  <div key={productIndex} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">
                                      Product ID: {typeof product.productId === 'object' ? product.productId.toString() : product.productId} (Qty: {product.quantity})
                                    </span>
                                    <span className="text-gray-600">₹{product.price}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Legacy items support */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-600">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-primary-600">
                        ₹{order.totalPrice || order.totalAmount || 0}
                      </span>
                    </div>
                  </div>

                  {order.deliveryLocation?.address && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Delivery Address:</strong> {order.deliveryLocation.address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
