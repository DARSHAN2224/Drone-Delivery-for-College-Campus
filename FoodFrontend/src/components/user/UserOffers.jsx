import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { 
  Percent, 
  DollarSign, 
  Gift,
  Calendar,
  Store,
  Package,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const UserOffers = () => {
  const { getActiveOffers } = useAppStore();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setIsLoading(true);
    try {
      const result = await getActiveOffers();
      if (result.success) {
        setOffers(result.offers || []);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiscountIcon = (type) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'buy_one_get_one': return <Gift className="w-4 h-4" />;
      default: return <Percent className="w-4 h-4" />;
    }
  };

  const getDiscountText = (offer) => {
    switch (offer.discountType) {
      case 'percentage': return `${offer.discountValue}% Off`;
      case 'fixed': return `$${offer.discountValue} Off`;
      case 'buy_one_get_one': return 'Buy 1 Get 1';
      default: return `${offer.discountValue}% Off`;
    }
  };

  const getFilteredOffers = () => {
    if (filterType === 'all') return offers;
    return offers.filter(offer => offer.discountType === filterType);
  };

  const getTimeRemaining = (validUntil) => {
    const now = new Date();
    const endDate = new Date(validUntil);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  };

  if (isLoading && offers.length === 0) return <LoadingSpinner />;

  const filteredOffers = getFilteredOffers();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Active Offers</h1>
        <p className="text-gray-600 mt-2">Discover great deals from your favorite shops</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All Offers', icon: <Gift className="w-4 h-4" /> },
            { id: 'percentage', label: 'Percentage', icon: <Percent className="w-4 h-4" /> },
            { id: 'fixed', label: 'Fixed Amount', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'buy_one_get_one', label: 'Buy 1 Get 1', icon: <Gift className="w-4 h-4" /> }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === filter.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOffers.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <Gift className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers available</h3>
          <p className="text-gray-600">Check back later for new promotions!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <div key={offer._id} className="bg-white rounded-lg shadow-md p-6 border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getDiscountIcon(offer.discountType)}
                  <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>

              <p className="text-gray-600 mb-4">{offer.description}</p>

              {/* Shop Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm text-gray-700">
                    {offer.shopId?.name || 'Unknown Shop'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {offer.shopId?.city}, {offer.shopId?.state}
                </div>
              </div>

              {/* Offer Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Discount:</span>
                  <span className="text-green-600 font-bold text-lg">
                    {getDiscountText(offer)}
                  </span>
                </div>

                {offer.minimumOrderAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Min. Order:</span>
                    <span className="font-medium">${offer.minimumOrderAmount}</span>
                  </div>
                )}

                {offer.maximumDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max. Discount:</span>
                    <span className="font-medium">${offer.maximumDiscount}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{getTimeRemaining(offer.validUntil)}</span>
                </div>

                {offer.usageLimit > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>Usage Limit: {offer.usageLimit}</span>
                  </div>
                )}
              </div>

              {/* Applicable Products */}
              {offer.applicableProducts && offer.applicableProducts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Applicable Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {offer.applicableProducts.map((product, index) => (
                      <span
                        key={product._id || index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {product.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicable Categories */}
              {offer.applicableCategories && offer.applicableCategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Applicable Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {offer.applicableCategories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms */}
              {offer.terms && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {offer.terms}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button className="w-full btn-primary">
                Shop Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOffers;
