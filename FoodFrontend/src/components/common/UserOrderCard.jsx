import { Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

const UserOrderCard = ({ order, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <Package className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
            </span>
            <span className="text-sm text-gray-500">
              #{order._id?.slice(-8)}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${order.totalAmount?.toFixed(2)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Shop:</span>
            <span className="text-sm font-medium text-gray-900">{order.shopId?.name || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Items:</span>
            <span className="text-sm font-medium text-gray-900">{order.items?.length || 0} items</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ordered:</span>
            <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
          
          {order.deliveryAddress && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Delivery:</span>
              <span className="text-sm text-gray-900 max-w-xs truncate">
                {order.deliveryAddress}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onViewDetails(order._id)}
            className="text-primary-600 hover:text-primary-800 font-medium text-sm"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderCard;
