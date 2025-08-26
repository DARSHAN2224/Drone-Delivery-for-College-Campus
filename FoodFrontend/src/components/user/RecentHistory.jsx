import { useState, useEffect } from 'react';
import { useAuthStore} from '../../stores/authStore';
import { api } from '../../stores/api.js';
import { 
  Clock, 
  Eye, 
  ShoppingCart, 
  Star, 
  Heart, 
  Package, 
  Store, 
  User,
  Trash2,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const RecentHistory = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, filter, currentPage]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (filter !== 'all') {
        params.append('actionType', filter);
      }

      const response = await api.get('/history/user', { params: Object.fromEntries(params) });
      const data = response.data?.data;
      setHistory(data?.history || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      setError(error?.response?.data?.message || error.message || 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async (actionType = null) => {
    try {
      const params = actionType ? { actionType } : undefined;
      await api.delete('/history/clear', { params });
      fetchHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      view_product: Eye,
      view_shop: Store,
      add_to_cart: ShoppingCart,
      place_order: Package,
      rate_product: Star,
      like_product: Heart,
      favorite_product: Heart
    };
    return icons[actionType] || Clock;
  };

  const getActionColor = (actionType) => {
    const colors = {
      view_product: 'text-blue-500',
      view_shop: 'text-green-500',
      add_to_cart: 'text-orange-500',
      place_order: 'text-purple-500',
      rate_product: 'text-yellow-500',
      like_product: 'text-red-500',
      favorite_product: 'text-pink-500'
    };
    return colors[actionType] || 'text-gray-500';
  };

  const getActionLabel = (actionType) => {
    const labels = {
      view_product: 'Viewed Product',
      view_shop: 'Viewed Shop',
      add_to_cart: 'Added to Cart',
      place_order: 'Placed Order',
      rate_product: 'Rated Product',
      like_product: 'Liked Product',
      favorite_product: 'Favorited Product'
    };
    return labels[actionType] || actionType;
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTargetName = (item) => {
    if (!item.targetId) return 'Unknown';
    
    if (item.targetType === 'product') {
      return item.targetId.name || 'Product';
    } else if (item.targetType === 'shop') {
      return item.targetId.name || 'Shop';
    } else if (item.targetType === 'seller') {
      return item.targetId.name || 'Seller';
    }
    
    return 'Unknown';
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={fetchHistory}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
        <p className="text-gray-600 mt-2">Track your recent interactions and activities</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="view_product">Product Views</option>
              <option value="view_shop">Shop Views</option>
              <option value="add_to_cart">Cart Actions</option>
              <option value="place_order">Orders</option>
              <option value="rate_product">Ratings</option>
              <option value="like_product">Likes</option>
              <option value="favorite_product">Favorites</option>
            </select>
          </div>

          {/* Clear Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => clearHistory(filter !== 'all' ? filter : null)}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear {filter !== 'all' ? filter.replace('_', ' ') : 'All'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500">
              {filter !== 'all' 
                ? `No ${filter.replace('_', ' ')} activities found`
                : 'Start browsing products and shops to see your activity here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {history.map((item) => {
              const Icon = getActionIcon(item.actionType);
              const iconColor = getActionColor(item.actionType);
              
              return (
                <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-gray-100 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {getActionLabel(item.actionType)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {getTargetName(item)}
                      </p>
                      
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(item.metadata).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === index + 1
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default RecentHistory;
