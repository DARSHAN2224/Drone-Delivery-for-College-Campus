import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Percent, 
  DollarSign, 
  Gift,
  Calendar,
  Store,
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminPendingOffers = () => {
  const { user } = useAuthStore();
  const { getPendingOffers, approveOffer } = useAppStore();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    loadPendingOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, discountTypeFilter]);

  const loadPendingOffers = async () => {
    setIsLoading(true);
    try {
      const result = await getPendingOffers();
      if (result.success) {
        setOffers(result.offers || []);
      }
    } catch (error) {
      console.error('Failed to load pending offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = [...offers];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.title?.toLowerCase().includes(searchLower) ||
        offer.description?.toLowerCase().includes(searchLower) ||
        offer.shopId?.name?.toLowerCase().includes(searchLower) ||
        offer.shopId?.city?.toLowerCase().includes(searchLower) ||
        offer.shopId?.state?.toLowerCase().includes(searchLower)
      );
    }

    // Discount type filter
    if (discountTypeFilter !== 'all') {
      filtered = filtered.filter(offer => offer.discountType === discountTypeFilter);
    }

    setFilteredOffers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleApprove = async (offerId) => {
    if (!confirm('Are you sure you want to approve this offer?')) return;

    setIsLoading(true);
    try {
      const result = await approveOffer(offerId);
      if (result.success) {
        loadPendingOffers();
        alert('Offer approved successfully!');
      } else {
        alert(result.error || 'Failed to approve offer');
      }
    } catch (error) {
      console.error('Error approving offer:', error);
      alert('Failed to approve offer');
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

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffers = filteredOffers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading && offers.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Offers Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve offers from sellers</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search offers by title, description, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter by Discount Type */}
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={discountTypeFilter}
                onChange={(e) => setDiscountTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Discount Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="buy_one_get_one">Buy 1 Get 1</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredOffers.length)} of {filteredOffers.length} offers
          </span>
          {searchTerm || discountTypeFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setDiscountTypeFilter('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filteredOffers.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          {offers.length === 0 ? (
            <>
              <CheckCircle className="w-24 h-24 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending offers</h3>
              <p className="text-gray-600">All offers have been reviewed and approved!</p>
            </>
          ) : (
            <>
              <Search className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentOffers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-lg shadow-md p-6 border border-yellow-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getDiscountIcon(offer.discountType)}
                    <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
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
                    <span className="text-green-600 font-bold">
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(offer._id)}
                    disabled={isLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    disabled={isLoading}
                    className="btn-secondary flex items-center justify-center gap-2 px-3"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(offer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPendingOffers;
