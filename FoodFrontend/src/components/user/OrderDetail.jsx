import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  MessageSquare,
  QrCode,
  Navigation,
  Calendar,
  DollarSign,
  ShoppingBag,
  User,
  Store
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../stores/api';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getUserOrder } = useAppStore();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/users/orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Order Ready';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Order Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return status;
    }
  };

  const getDeliveryTypeIcon = (type) => {
    return type === 'drone' ? (
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
        <Navigation className="w-4 h-4 text-blue-600" />
      </div>
    ) : (
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <Truck className="w-4 h-4 text-green-600" />
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!order) return 0;
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = order.deliveryFee || 0;
    const tax = order.tax || 0;
    const discount = order.discount || 0;
    return subtotal + deliveryFee + tax - discount;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Order</h3>
          <p className="text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-2">{getStatusText(order.status)}</span>
              </span>
            </div>
            
            {/* Status Timeline */}
            <div className="space-y-4">
              {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status, index) => (
                <div key={status} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === status ? 'bg-primary-600 text-white' : 
                    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      order.status === status ? 'text-primary-600' : 
                      ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {getStatusText(status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || '/imagesStore/image.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/imagesStore/image.png';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm">
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-gray-500">Price: {formatCurrency(item.price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900 font-medium">{order.deliveryAddress.name}</p>
                  <p className="text-gray-600">{order.deliveryAddress.street}</p>
                  <p className="text-gray-600">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  <p className="text-gray-600">{order.deliveryAddress.pincode}</p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-gray-500 text-sm">Landmark: {order.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  {getDeliveryTypeIcon(order.deliveryType)}
                  <span className="ml-2">Delivery Type</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900 font-medium capitalize">
                    {order.deliveryType === 'drone' ? 'Drone Delivery' : 'Regular Delivery'}
                  </p>
                  {order.deliveryType === 'drone' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Estimated Delivery: {order.estimatedDeliveryTime}</p>
                      {order.droneId && (
                        <p className="text-sm text-gray-600">Drone ID: {order.droneId}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code for Drone Delivery */}
          {order.deliveryType === 'drone' && order.status === 'out_for_delivery' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery QR Code</h2>
              <div className="text-center">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                </button>
                
                {showQRCode && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-48 h-48 bg-white mx-auto p-4 rounded-lg border-2 border-gray-200">
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">QR Code</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Show this QR code to the drone for order verification
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Store className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{order.shop.name}</p>
                  <p className="text-sm text-gray-600">{order.shop.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{order.shop.address}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{order.shop.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{order.shop.email}</span>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Phone className="w-4 h-4 mr-2" />
                Call Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


