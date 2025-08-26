import React, { useState, useEffect } from 'react';
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Shield, 
  ShieldOff,
  TrendingUp,
  Package,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { api } from '../../stores/api.js';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const pageSize = 9;

  useEffect(() => {
    loadSellers();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm, shopFilter]);

  const loadSellers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const response = await api.get('/admin/sellers', {
        params: filters
      });

      if (response.data.success) {
        const data = response.data.data || { sellers: [], pagination: {} };
        setSellers(data.sellers || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      } else {
        setError('Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError(error.response?.data?.message || 'Failed to fetch sellers');
      setSellers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = [...sellers];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(seller => 
        seller.name?.toLowerCase().includes(searchLower) ||
        seller.email?.toLowerCase().includes(searchLower) ||
        seller.mobile?.includes(searchLower) ||
        seller.shops?.some(shop => shop.name?.toLowerCase().includes(searchLower))
      );
    }

    // Shop filter
    if (shopFilter === 'with_shops') {
      filtered = filtered.filter(seller => seller.shops && seller.shops.length > 0);
    } else if (shopFilter === 'without_shops') {
      filtered = filtered.filter(seller => !seller.shops || seller.shops.length === 0);
    }

    setFilteredSellers(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSellers();
  };

  const handleStatusUpdate = async (sellerId, action) => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/admin/sellers/${sellerId}/status`, {
        action
      });

      if (response.data.success) {
        loadSellers(); // Reload the current page
        alert(`Seller ${action}d successfully!`);
      } else {
        alert(`Failed to ${action} seller`);
      }
    } catch (error) {
      console.error(`Error ${action}ing seller:`, error);
      alert(`Failed to ${action} seller`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openSellerModal = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  const closeSellerModal = () => {
    setShowModal(false);
    setSelectedSeller(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const getStatusFilterTitle = () => {
    switch (statusFilter) {
      case 'pending': return 'Pending Sellers';
      case 'approved': return 'Approved Sellers';
      case 'rejected': return 'Rejected Sellers';
      default: return 'All Sellers';
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  if (isLoading && sellers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getStatusFilterTitle()}</h2>
          <p className="text-gray-600">Manage seller accounts and their shops</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredSellers.length} of {totalItems} seller{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sellers by name, email, or shop..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* Shop Filter */}
          <div className="lg:w-48">
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Sellers</option>
                <option value="with_shops">With Shops</option>
                <option value="without_shops">Without Shops</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredSellers.length} of {totalItems} sellers
          </span>
          {searchTerm || shopFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setShopFilter('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Sellers List */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registered Sellers</h3>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Sellers</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadSellers}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-12">
              {sellers.length === 0 ? (
                <>
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
                  <p className="text-gray-500">No sellers match your current criteria.</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSellers.map((seller) => (
                  <div key={seller._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start space-x-4">
                      {/* Seller Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-primary-600" />
                        </div>
                      </div>

                      {/* Seller Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {seller.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <Mail className="w-3 h-3 inline mr-1" />
                              {seller.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {seller.mobile}
                            </p>
                            
                            <div className="flex items-center space-x-2 mt-3">
                              {getStatusBadge(seller.status)}
                              <span className="text-xs text-gray-500">
                                {seller.shops?.length || 0} shop{seller.shops?.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {seller.shops && seller.shops.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Shops:</p>
                                <div className="flex flex-wrap gap-1">
                                  {seller.shops.slice(0, 2).map((shop, index) => (
                                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                      {shop.name}
                                    </span>
                                  ))}
                                  {seller.shops.length > 2 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                      +{seller.shops.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {seller.createdAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                <Calendar className="w-3 h-3" />
                                <span>Joined: {new Date(seller.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => openSellerModal(seller)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {seller.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(seller._id, 'approve')}
                                disabled={isProcessing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Approve Seller"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {seller.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(seller._id, 'reject')}
                                disabled={isProcessing}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Reject Seller"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
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
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
      </div>

      {/* Seller Detail Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Seller Details</h3>
                <button
                  onClick={closeSellerModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedSeller.name}</h4>
                    <p className="text-gray-600">{selectedSeller.email}</p>
                    <p className="text-gray-600">{selectedSeller.mobile}</p>
                    {getStatusBadge(selectedSeller.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Email</h5>
                    <p className="text-gray-600">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Mobile</h5>
                    <p className="text-gray-600">{selectedSeller.mobile}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Status</h5>
                    <p className="text-gray-600">{selectedSeller.status || 'Pending'}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Joined</h5>
                    <p className="text-gray-600">
                      {selectedSeller.createdAt ? new Date(selectedSeller.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedSeller.shops && selectedSeller.shops.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Shops ({selectedSeller.shops.length})</h5>
                    <div className="space-y-2">
                      {selectedSeller.shops.map((shop, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{shop.name}</p>
                              <p className="text-sm text-gray-600">
                                Status: {shop.isApproved ? 'Approved' : 'Pending'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {shop.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {selectedSeller.status !== 'approved' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedSeller._id, 'approve');
                        closeSellerModal();
                      }}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Seller
                    </button>
                  )}
                  
                  {selectedSeller.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedSeller._id, 'reject');
                        closeSellerModal();
                      }}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Seller
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;


