import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Truck, 
  Navigation,
  Package,
  Users,
  TrendingUp,
  Heart,
  HeartOff,
  Phone
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

const Shops = () => {
  const { getShops, toggleFavoriteShop, checkFavoriteStatus } = useAppStore();
  const { user } = useAuthStore();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'all',
    'Pizza',
    'Burger',
    'Pasta',
    'Salad',
    'Dessert',
    'Beverage',
    'Appetizer',
    'Main Course',
    'Fast Food',
    'Healthy',
    'Vegetarian',
    'Non-Vegetarian',
    'Seafood',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks'
  ];

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchShops();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch shops when page changes
  useEffect(() => {
    fetchShops();
  }, [currentPage]);

  useEffect(() => {
    filterAndSortShops();
  }, [shops, searchTerm, selectedCategory, sortBy]);

  const fetchShops = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getShops({ 
        page: currentPage, 
        limit: 12,
        search: searchTerm 
      });
      if (result.success) {
        console.log('🔍 Raw shops data:', result.shops);
        
        const shopsWithFavorites = await Promise.all(
          (result.shops || []).map(async (shop) => {
            try {
              const favoriteResult = await checkFavoriteStatus('shop', shop._id);
              const shopWithFavorites = {
                ...shop,
                isFavorite: favoriteResult.success ? favoriteResult.isFavorited : false
              };
              console.log('🔍 Shop data:', {
                id: shopWithFavorites._id,
                name: shopWithFavorites.name,
                isActive: shopWithFavorites.isActive,
                isApproved: shopWithFavorites.isApproved,
                totalProducts: shopWithFavorites.totalProducts,
                averageRating: shopWithFavorites.averageRating,
                totalRatings: shopWithFavorites.totalRatings
              });
              return shopWithFavorites;
            } catch (error) {
              return {
                ...shop,
                isFavorite: false
              };
            }
          })
        );
        setShops(shopsWithFavorites);
        setTotalPages(result.totalPages || 1);
      } else {
        setError('Failed to fetch shops');
        setShops([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError('Failed to fetch shops');
      setShops([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortShops = () => {
    let filtered = [...shops];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shop => 
        shop.cuisineType === selectedCategory || 
        shop.categories?.includes(selectedCategory)
      );
    }

    // Sort shops
      switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'deliveryTime':
        filtered.sort((a, b) => (a.averageDeliveryTime || 0) - (b.averageDeliveryTime || 0));
        break;
        case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
        default:
        break;
    }

    setFilteredShops(filtered);
  };

  const handleFavoriteToggle = async (shopId) => {
    try {
      const result = await toggleFavoriteShop(shopId);
      if (result.success) {
        // Update the shop in the list with the actual response
        setShops(prev => 
          prev.map(shop => 
            shop._id === shopId 
              ? { ...shop, isFavorite: result.data.isFavorited }
              : shop
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-current text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
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

  const getStatusBadge = (shop) => {
    // Check if shop is active and approved
    if (shop.isActive && shop.isApproved) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Clock className="w-3 h-3 mr-1" />
          Open
        </span>
      );
    } else if (!shop.isApproved) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          Closed
        </span>
      );
    }
  };

  if (isLoading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Amazing Food</h1>
        <p className="text-lg text-gray-600">Explore restaurants, cafes, and food joints near you</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shops, cuisines, or dishes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            </div>
            
          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="rating">Sort by Rating</option>
              <option value="distance">Sort by Distance</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
            </div>
            
      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
            </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Shops Grid */}
      {error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Shops</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchShops}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Shop Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={shop.image || '/imagesStore/image.png'}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/imagesStore/image.png';
                  }}
                />
                
                {/* Favorite Button */}
                {user && (
                  <button
                    onClick={() => handleFavoriteToggle(shop._id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    {shop.isFavorite ? (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    ) : (
                      <HeartOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(shop)}
                </div>

                {/* Delivery Type */}
                <div className="absolute bottom-3 left-3">
                  {getDeliveryTypeIcon(shop.deliveryType || 'regular')}
                </div>
              </div>

              {/* Shop Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                    {shop.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {shop.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {getRatingStars(shop.averageRating || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({shop.totalRatings || 0} reviews)
                  </span>
                </div>

                {/* Shop Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shop.location || `${shop.city}, ${shop.state}`}</span>
                  </div>
                  
                  {shop.openingHours && shop.closingHours && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{shop.openingHours} - {shop.closingHours}</span>
                    </div>
                  )}

                  {shop.contactNumber && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{shop.contactNumber}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-500">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{shop.totalProducts || 0}</div>
                    <div>Products</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{shop.totalOrders || 0}</div>
                    <div>Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{shop.totalCustomers || 0}</div>
                    <div>Customers</div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/shop/${shop._id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm border border-red-500"
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                >
                  View Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;
