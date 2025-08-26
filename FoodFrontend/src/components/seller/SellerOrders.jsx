import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';

const SellerOrders = ({ loading, ordersByStatus, onAccept, onProcess, onReady, onDeliver, onCancel, submittingId, submittingAction }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'items'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  const totalOrders = ordersByStatus.arrived.length + ordersByStatus.preparing.length + ordersByStatus.ready.length + (ordersByStatus.delivered?.length || 0);
  
  if (totalOrders === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-600">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'arrived':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'preparing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'arrived':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'arrived':
        return 'New Order';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const ActionButtons = ({ order, status }) => {
    const isSubmitting = submittingId === order._id;
    const isDroneDelivery = order.deliveryType === 'drone';
    
    return (
    <div className="flex items-center gap-2">
        {status === 'arrived' && (
      <button
        onClick={() => onAccept(order._id)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && submittingAction === 'accept' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Accepting...
              </div>
            ) : (
              'Accept'
            )}
          </button>
        )}
        
        {status === 'arrived' && (
      <button
        onClick={() => onProcess(order._id)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && submittingAction === 'process' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Processing...
              </div>
            ) : (
              'Start Prep'
            )}
          </button>
        )}
        
        {status === 'preparing' && (
      <button
        onClick={() => onReady(order._id)}
            disabled={isSubmitting}
            className={`px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isDroneDelivery ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting && submittingAction === 'ready' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                {isDroneDelivery ? 'Calling Drone...' : 'Updating...'}
              </div>
            ) : (
              isDroneDelivery ? 'Call Drone' : 'Mark Ready'
            )}
          </button>
        )}
        
        {status === 'ready' && (
          <button
            onClick={() => onDeliver(order._id)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && submittingAction === 'deliver' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Delivering...
              </div>
            ) : (
              'Mark Delivered'
            )}
          </button>
        )}
        
        {(status === 'arrived' || status === 'preparing') && (
      <button
        onClick={() => onCancel(order._id)}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && submittingAction === 'cancel' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Cancelling...
              </div>
            ) : (
              'Cancel'
            )}
          </button>
        )}
    </div>
  );
  };

  const OrderRow = ({ order, status }) => {
    const isExpanded = expandedOrders.has(order._id);
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Extract seller's shop from the order
    const sellerShop = order.shops?.find(shop => shop.shopId?._id || shop.shopId);
    const shopProducts = sellerShop?.products || [];

  return (
      <>
        {/* Order Row */}
        <div className="bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(status)}
                <div>
                  <h4 className="font-medium text-gray-900">
                    #{order.orderToken || order._id?.slice(-8)}
                  </h4>
                  <p className="text-sm text-gray-600">{orderDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-medium text-gray-900">{order.totalQuantity || shopProducts.length}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-primary-600">₹{order.totalPrice || order.totalAmount || 0}</p>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
                
                <ActionButtons order={order} status={status} />
                
                <button
                  onClick={() => toggleOrderExpansion(order._id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Customer Information */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {order.user?.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {order.user?.mobile || 'N/A'}</p>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Order Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Order ID:</span> {order._id}</p>
                    <p><span className="font-medium">Delivery Type:</span> {order.deliveryType || 'Regular'}</p>
                    <p><span className="font-medium">Payment Status:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="mt-4">
                <h5 className="font-semibold text-gray-900 mb-3">Order Items</h5>
                <div className="space-y-2">
                  {shopProducts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.productId?.image ? (
                            <img 
                              src={item.productId.image} 
                              alt={item.productId.name} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.productId?.name || 'Product'}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                </div>
                <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">₹{item.price}</p>
                        <p className="text-xs text-gray-600">Total: ₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const OrderTable = ({ orders, status, title }) => {
    if (orders.length === 0) return null;

    // Filter and sort orders
    let filteredOrders = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const orderId = (order.orderToken || order._id?.slice(-8)).toLowerCase();
      const customerName = (order.user?.name || '').toLowerCase();
      const customerEmail = (order.user?.email || '').toLowerCase();
      
      return orderId.includes(searchLower) || 
             customerName.includes(searchLower) || 
             customerEmail.includes(searchLower);
    });

    // Sort orders
    filteredOrders.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'amount':
          aValue = a.totalPrice || a.totalAmount || 0;
          bValue = b.totalPrice || b.totalAmount || 0;
          break;
        case 'items':
          const aShop = a.shops?.find(shop => shop.shopId?._id || shop.shopId);
          const bShop = b.shops?.find(shop => shop.shopId?._id || shop.shopId);
          aValue = a.totalQuantity || aShop?.products?.length || 0;
          bValue = b.totalQuantity || bShop?.products?.length || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {getStatusIcon(status)}
            <span className="ml-2">{title}</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {filteredOrders.length}
            </span>
          </h3>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-1 text-center">Items</div>
            <div className="col-span-2 text-center">Total Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3 text-center">Actions</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <OrderRow key={order._id} order={order} status={status} />
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: totalOrders, icon: Package },
    { id: 'arrived', label: 'New Orders', count: ordersByStatus.arrived.length, icon: Clock },
    { id: 'preparing', label: 'Preparing', count: ordersByStatus.preparing.length, icon: Package },
    { id: 'ready', label: 'Ready', count: ordersByStatus.ready.length, icon: CheckCircle },
    { id: 'delivered', label: 'Delivered', count: ordersByStatus.delivered?.length || 0, icon: CheckCircle },
  ];

  const getOrdersForTab = (tabId) => {
    switch (tabId) {
      case 'arrived':
        return ordersByStatus.arrived;
      case 'preparing':
        return ordersByStatus.preparing;
      case 'ready':
        return ordersByStatus.ready;
      case 'delivered':
        return ordersByStatus.delivered || [];
      case 'all':
      default:
        return [
          ...ordersByStatus.arrived,
          ...ordersByStatus.preparing,
          ...ordersByStatus.ready,
          ...(ordersByStatus.delivered || [])
        ];
    }
  };

  const getStatusForTab = (tabId) => {
    switch (tabId) {
      case 'arrived':
        return 'arrived';
      case 'preparing':
        return 'preparing';
      case 'ready':
        return 'ready';
      case 'delivered':
        return 'delivered';
      default:
        return 'all';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">New Orders</p>
              <p className="text-xl font-bold text-orange-900">{ordersByStatus.arrived.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Preparing</p>
              <p className="text-xl font-bold text-blue-900">{ordersByStatus.preparing.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Ready</p>
              <p className="text-xl font-bold text-green-900">{ordersByStatus.ready.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="items">Sort by Items</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable 
        orders={getOrdersForTab(activeTab)}
        status={getStatusForTab(activeTab)}
        title={tabs.find(tab => tab.id === activeTab)?.label || 'Orders'}
      />
    </div>
  );
};

export default SellerOrders;


