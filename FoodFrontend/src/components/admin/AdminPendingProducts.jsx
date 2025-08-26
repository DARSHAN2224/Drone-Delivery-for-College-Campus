import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Package,
  Search,
  Filter,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
  User
} from 'lucide-react';
import { api } from '../../stores/api.js';

const AdminPendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const pageSize = 9;

  useEffect(() => {
    loadProducts();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const response = await api.get('/admin/products', {
        params: filters
      });

      if (response.data.success) {
        const data = response.data.data || { products: [], pagination: {} };
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.shopId?.name?.toLowerCase().includes(searchLower) ||
        product.shopId?.sellerId?.name?.toLowerCase().includes(searchLower) ||
        product.shopId?.sellerId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleStatusUpdate = async (productId, action, reason = '') => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/admin/products/${productId}/approve`, {
        isApproved: action === 'approve',
        rejectionReason: action === 'reject' ? reason : undefined
      });

      if (response.data.success) {
        loadProducts(); // Reload the current page
        alert(`Product ${action}d successfully!`);
      } else {
        alert(`Failed to ${action} product`);
      }
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      alert(`Failed to ${action} product`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeProductModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else if (isApproved === false) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Pizza': 'bg-red-100 text-red-800',
      'Burger': 'bg-orange-100 text-orange-800',
      'Pasta': 'bg-yellow-100 text-yellow-800',
      'Salad': 'bg-green-100 text-green-800',
      'Dessert': 'bg-pink-100 text-pink-800',
      'Beverage': 'bg-blue-100 text-blue-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  // Get unique categories for filter
  const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))].sort();

  const getStatusFilterTitle = () => {
    switch (statusFilter) {
      case 'pending': return 'Pending Products';
      case 'approved': return 'Approved Products';
      case 'rejected': return 'Rejected Products';
      default: return 'All Products';
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  if (isLoading && products.length === 0) {
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
          <p className="text-gray-600">Review and moderate products</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredProducts.length} of {totalItems} product{totalItems !== 1 ? 's' : ''}
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
                placeholder="Search products by name, description, or seller..."
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

          {/* Category Filter */}
          <div className="lg:w-48">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredProducts.length} of {totalItems} products
          </span>
          {searchTerm || categoryFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products for Review</h3>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadProducts}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              {products.length === 0 ? (
                <>
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">No products match your current criteria.</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.image || '/imagesStore/image.png'}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/imagesStore/image.png';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-3 text-sm">
                              <span className="text-gray-500">
                                <Store className="w-3 h-3 inline mr-1" />
                                {product.shopId?.name || 'Unknown Shop'}
                              </span>
                              <span className="text-gray-500">
                                <User className="w-3 h-3 inline mr-1" />
                                {product.shopId?.sellerId?.name || 'Unknown Seller'}
                              </span>
                              <span className="text-gray-500">
                                ₹{product.price}
                              </span>
                              <span className="text-gray-500">
                                Stock: {product.stock}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                                {product.category}
                              </span>
                              {getStatusBadge(product.isApproved)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => openProductModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {product.isApproved !== true && (
                              <button
                                onClick={() => handleStatusUpdate(product._id, 'approve')}
                                disabled={isProcessing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Approve Product"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            )}
                            
                            {product.isApproved !== false && (
                              <button
                                onClick={() => handleStatusUpdate(product._id, 'reject')}
                                disabled={isProcessing}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Reject Product"
                              >
                                <ThumbsDown className="w-4 h-4" />
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

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={closeProductModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedProduct.image || '/imagesStore/image.png'}
                    alt={selectedProduct.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/imagesStore/image.png';
                    }}
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-gray-600">{selectedProduct.category}</p>
                    <p className="text-lg font-bold text-green-600">₹{selectedProduct.price}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Stock</h5>
                    <p className="text-gray-600">{selectedProduct.stock} units</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Preparation Time</h5>
                    <p className="text-gray-600">{selectedProduct.preparationTime || 'N/A'} mins</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Allergens</h5>
                    <p className="text-gray-600">{selectedProduct.allergens || 'None specified'}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Nutritional Info</h5>
                    <p className="text-gray-600">{selectedProduct.nutritionalInfo || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Shop & Seller Information</h5>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600">
                      <span className="font-medium">Shop Name:</span> {selectedProduct.shopId?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Seller Name:</span> {selectedProduct.shopId?.sellerId?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Seller Email:</span> {selectedProduct.shopId?.sellerId?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {selectedProduct.isApproved !== true && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedProduct._id, 'approve');
                        closeProductModal();
                      }}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Product
                    </button>
                  )}
                  
                  {selectedProduct.isApproved !== false && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedProduct._id, 'reject');
                        closeProductModal();
                      }}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Product
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

export default AdminPendingProducts;


