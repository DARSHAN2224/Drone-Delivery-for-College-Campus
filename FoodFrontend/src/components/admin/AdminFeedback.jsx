import { useState, useEffect } from 'react';
import { Star, Heart, MessageCircle, Users, Store, Package } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { api } from '../../stores/api.js';
const AdminFeedback = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeTab, setActiveTab] = useState('feedback');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month

  useEffect(() => {
    fetchFeedbackData();
  }, [selectedTimeframe]);

  const fetchFeedbackData = async () => {
    try {
      setIsLoading(true);
      const resp = await api.get('/feedback', { params: { page: 1, limit: 50 } });
      const items = resp.data?.data?.feedback || [];
      setFeedbackList(items);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeframeFilter = () => {
    const now = new Date();
    switch (selectedTimeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const filterByTimeframe = (items) => {
    if (selectedTimeframe === 'all') return items;
    const cutoffDate = getTimeframeFilter();
    return items.filter(item => {
      const lastActivity = item.lastRatingDate || item.lastLikeDate || item.lastCommentDate;
      return lastActivity && new Date(lastActivity) >= cutoffDate;
    });
  };

  const renderFeedbackTab = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        {feedbackList.map((fb) => (
          <div key={fb._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-600">{new Date(fb.createdAt).toLocaleString()}</div>
                <div className="font-medium text-gray-900">{fb.subject}</div>
                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{fb.message}</div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{fb.name || 'User'}</div>
                <div>{fb.email || ''}</div>
                <div className="mt-2">
                  <select
                    value={fb.status}
                    onChange={async (e) => {
                      const status = e.target.value;
                      try {
                        await api.patch(`/feedback/${fb._id}/status`, { status });
                        setFeedbackList((prev) => prev.map((x) => x._id === fb._id ? { ...x, status } : x));
                      } catch (err) {
                        console.error('Failed to update status', err);
                      }
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="new">new</option>
                    <option value="read">read</option>
                    <option value="resolved">resolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
        {feedbackList.length === 0 && (
          <div className="text-gray-500">No feedback yet.</div>
        )}
      </div>
    </div>
  );

  const renderSellersTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {feedbackData.sellers.length}
          </div>
          <div className="text-sm text-blue-600">Total Sellers</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {feedbackData.sellers.filter(s => s.averageRating >= 4).length}
          </div>
          <div className="text-sm text-green-600">High Rated (4+ stars)</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {feedbackData.sellers.filter(s => s.averageRating >= 3 && s.averageRating < 4).length}
          </div>
          <div className="text-sm text-yellow-600">Medium Rated (3-4 stars)</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {feedbackData.sellers.filter(s => s.averageRating < 3).length}
          </div>
          <div className="text-sm text-red-600">Low Rated (&lt;3 stars)</div>
        </div>
      </div>

      <div className="space-y-3">
        {filterByTimeframe(feedbackData.sellers).map((seller) => (
          <div key={seller._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Users className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{seller.name}</h4>
                  <p className="text-sm text-gray-600">{seller.email}</p>
                  <p className="text-xs text-gray-500">Shop: {seller.shopName || 'N/A'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(seller.averageRating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  {seller.averageRating ? `${(seller.averageRating).toFixed(1)} (${seller.totalRatings || 0})` : 'No ratings'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {seller.totalLikes || 0} likes • {seller.totalComments || 0} comments • {seller.totalFavorites || 0} favorites
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {feedbackData.products.length}
          </div>
          <div className="text-sm text-blue-600">Total Products</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {feedbackData.products.filter(p => p.averageRating >= 4).length}
          </div>
          <div className="text-sm text-green-600">High Rated (4+ stars)</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {feedbackData.products.filter(p => p.averageRating >= 3 && p.averageRating < 4).length}
          </div>
          <div className="text-sm text-yellow-600">Medium Rated (3-4 stars)</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {feedbackData.products.filter(p => p.averageRating < 3).length}
          </div>
          <div className="text-sm text-red-600">Low Rated (&lt;3 stars)</div>
        </div>
      </div>

      <div className="space-y-3">
        {filterByTimeframe(feedbackData.products).map((product) => (
          <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">₹{product.price}</p>
                  <p className="text-xs text-gray-500">Shop: {product.shopName || 'N/A'}</p>
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
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Feedback & Engagement</h3>
          <p className="text-sm text-gray-600 mt-1">Monitor ratings, likes, and comments across all shops, sellers, and products</p>
        </div>
        
        <div className="p-6">
          {renderFeedbackTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
