import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  DollarSign,
  Tag
} from 'lucide-react';
import { api } from '../../stores/api.js';

const SellerProductGrid = ({ products, onDelete, deleteInProgress, onEdit }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setDeletingId(productId);
      try {
        const response = await api.delete(`/seller/products/${productId}`);
        if (response.data.success) {
          onDelete(productId);
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h2>
        <p className="text-gray-600 mb-6">Start building your product catalog by adding your first product.</p>
        <Link
          to="/seller/addproducts"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200"
        >
          <Package className="w-5 h-5 mr-2" />
          Add Your First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <Link
          to="/seller/addproducts"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200"
        >
          <Package className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden hover:shadow-medium transition-all duration-300">
            {/* Product Image */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : product.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status?.charAt(0).toUpperCase() + product.status?.slice(1) || 'Draft'}
                </span>
              </div>

              {/* Discount Badge */}
              {product.discountPercentage && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Product Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description || 'No description available'}
              </p>

              {/* Product Meta */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-900 font-medium">{product.category || 'Uncategorized'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Stock:</span>
                  <span className={`font-medium ${
                    (product.stock || 0) > 10 ? 'text-green-600' : 
                    (product.stock || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.stock || 0} units
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <div className="flex items-center space-x-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(product._id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                >
                  {deletingId === product._id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {deletingId === product._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {/* View Button */}
              <button className="w-full mt-3 flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{products.length}</div>
            <div className="text-sm text-blue-600">Total Products</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Tag className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {products.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-green-600">Active Products</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Package className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">
              {products.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending Review</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              ₹{products.reduce((sum, p) => sum + (p.price || 0), 0)}
            </div>
            <div className="text-sm text-purple-600">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductGrid;


