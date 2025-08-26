import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Package, 
  Star, 
  ShoppingCart,
  Clock,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import RatingComponent from '../common/RatingComponent';

const UserHome = () => {
  const { user } = useAuthStore();
  const { 
    getHomeData, 
    homeData, 
    isLoading, 
    error 
  } = useAppStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('shops');

  // Memoize the getHomeData call to prevent infinite re-renders
  const fetchHomeData = useCallback(async () => {
    if (user?.role === 'user') {
      await getHomeData();
    }
  }, [user, getHomeData]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    { id: 'shops', name: 'Nearby Shops', icon: Store },
    { id: 'offers', name: 'Special Offers', icon: Star },
    { id: 'topProducts', name: 'Top Products', icon: Package },
  ];

  const renderShops = () => {
    if (!homeData?.shops || homeData.shops.length === 0) {
      return (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops available</h3>
          <p className="text-gray-500">Check back later for available shops</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {homeData.shops.map((shop) => (
          <div key={shop._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="h-36 sm:h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
              {shop.image ? (
                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Store className="w-12 h-12 mb-2" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                  shop.isApproved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}>
                  {shop.isApproved ? 'Open' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{shop.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{shop.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{shop.city}, {shop.state}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{shop.openingHours || 'N/A'} - {shop.closingHours || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  {shop.productCount || 0} products
                </span>
                <button 
                  className="btn-primary text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  onClick={() => navigate(`/shop/${shop._id}`)}
                >
                  View Menu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOffers = () => {
    // Ensure offers is always an array
    const offers = Array.isArray(homeData?.offers) ? homeData.offers : [];
    
    if (!offers || offers.length === 0) {
      return (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No special offers available</h3>
          <p className="text-gray-500">Check back later for amazing deals and discounts</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer._id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {offer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h4>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
            
            {/* Shop info */}
            {offer.shopId && (
              <div className="flex items-center space-x-2 mb-3">
                <Store className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{offer.shopId.name}</span>
              </div>
            )}
            
            {/* Validity */}
            {offer.validUntil && (
              <div className="text-xs text-gray-500 mb-3">
                Valid until: {new Date(offer.validUntil).toLocaleDateString()}
              </div>
            )}
            
            {/* Minimum order */}
            {offer.minimumOrderAmount && offer.minimumOrderAmount > 0 && (
              <div className="text-xs text-gray-600 mb-3">
                Min. order: ₹{offer.minimumOrderAmount}
              </div>
            )}
            
            {/* Applicable products */}
            {offer.applicableProducts && offer.applicableProducts.length > 0 && (
              <div className="text-xs text-gray-600">
                Applicable to: {offer.applicableProducts.length} product(s)
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTopProducts = () => {
    // Ensure topProducts is always an array
    const topProducts = Array.isArray(homeData?.topProducts) ? homeData.topProducts : [];
    
    if (!topProducts || topProducts.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No top products available</h3>
          <p className="text-gray-500">Popular products will appear here based on sales data</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {topProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-10 h-10 mb-1" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              
              {/* Sales badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full shadow-sm">
                  Top Seller
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 truncate leading-relaxed">{product.description}</p>
              
              {/* Shop name */}
              {product.shopName && (
                <p className="text-xs text-gray-500 mb-2">From: {product.shopName}</p>
              )}
              
              {/* Rating Component */}
              <div className="mb-3">
                <RatingComponent
                  targetType="product"
                  targetId={product._id}
                  currentRating={product.averageRating || 0}
                  totalRatings={product.totalRatings || 0}
                  totalLikes={product.totalLikes || 0}
                  totalFavorites={product.totalFavorites || 0}
                  totalComments={product.totalComments || 0}
                  showActions={false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                  {product.totalOrders && (
                    <span className="text-xs text-gray-500 ml-2">({product.totalOrders} orders)</span>
                  )}
                </div>
                <button className="btn-primary text-sm px-3 py-1 rounded-lg hover:bg-primary-600 transition-colors duration-200">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Discover amazing food from the best restaurants</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'shops' && renderShops()}
          {activeTab === 'offers' && renderOffers()}
          {activeTab === 'topProducts' && renderTopProducts()}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UserHome;
