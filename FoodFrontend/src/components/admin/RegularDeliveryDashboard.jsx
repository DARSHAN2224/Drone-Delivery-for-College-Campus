import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit,
  Filter,
  Search,
  User,
  Store,
  Route
} from 'lucide-react';

const RegularDeliveryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/delivery/admin/all');
      const deliveryList = res?.data?.data?.deliveries || [];
      setDeliveries(deliveryList);
      setFilteredDeliveries(deliveryList);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  useEffect(() => {
    // Filter deliveries based on status and search
    let filtered = deliveries;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(d => d.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.orderId?._id?.includes(searchTerm) ||
        d.shopId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.rider?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDeliveries(filtered);
  }, [deliveries, selectedStatus, searchTerm]);

  const markAsDelivered = async (deliveryId, notes = '') => {
    try {
      setError(null);
      await api.put(`/delivery/admin/complete/${deliveryId}`, { notes });
      await loadData(); // Refresh data
    } catch (e) {
      const message = e?.response?.data?.message || 'Action failed';
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'text-gray-600 bg-gray-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'picked_up': return 'text-purple-600 bg-purple-50';
      case 'en_route': return 'text-indigo-600 bg-indigo-50';
      case 'nearby': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unassigned': return <Package className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'picked_up': return <Truck className="w-4 h-4" />;
      case 'en_route': return <Route className="w-4 h-4" />;
      case 'nearby': return <MapPin className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getETA = (etaMinutes) => {
    if (!etaMinutes) return 'N/A';
    const now = new Date();
    const eta = new Date(now.getTime() + etaMinutes * 60000);
    return eta.toLocaleTimeString();
  };

  const DeliveryDetails = ({ delivery, onClose }) => {
    if (!delivery) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Delivery Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Order ID</label>
                <p className="text-sm">{delivery.orderId?._id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Shop</label>
                <p className="text-sm">{delivery.shopId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                  {getStatusIcon(delivery.status)}
                  <span className="ml-1">{delivery.status.replace('_', ' ').toUpperCase()}</span>
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Mode</label>
                <p className="text-sm capitalize">{delivery.deliveryMode || 'N/A'}</p>
              </div>
            </div>

            {/* Rider Info */}
            {delivery.rider && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Delivery Partner</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Name</label>
                    <p>{delivery.rider.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Phone</label>
                    <p>{delivery.rider.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Vehicle</label>
                    <p>{delivery.rider.vehicle || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Info */}
            {delivery.currentLocation && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Current Location</h3>
                <div className="text-sm">
                  <p>Lat: {delivery.currentLocation.lat?.toFixed(6)}</p>
                  <p>Lng: {delivery.currentLocation.lng?.toFixed(6)}</p>
                  <p>Updated: {formatTime(delivery.currentLocation.timestamp)}</p>
                </div>
              </div>
            )}

            {/* Route History */}
            {delivery.route && delivery.route.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Route History</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {delivery.route.map((point, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      {idx + 1}. {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)} - {formatTime(point.timestamp)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status History */}
            {delivery.statusHistory && delivery.statusHistory.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Status History</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {delivery.statusHistory.map((status, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-medium">{status.status.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-gray-600 ml-2">{formatTime(status.timestamp)}</span>
                      {status.notes && <span className="text-gray-500 ml-2">- {status.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Actions</h3>
                <button
                  onClick={() => {
                    markAsDelivered(delivery._id, 'Marked as delivered from admin panel');
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Delivered
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regular Delivery Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage all regular delivery operations</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Order ID, Shop, or Rider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="en_route">En Route</option>
            <option value="nearby">Nearby</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Found</h3>
              <p className="text-gray-600">
                {deliveries.length === 0 ? 'There are currently no deliveries.' : 'No deliveries match your filters.'}
              </p>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <div key={delivery._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{delivery.orderId?._id?.slice(-8) || 'N/A'}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{delivery.status.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>{delivery.shopId?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Rider: {delivery.rider?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>ETA: {getETA(delivery.etaMinutes)}</span>
                      </div>
                    </div>

                    {/* Current Location */}
                    {delivery.currentLocation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Current Location</span>
                        </div>
                        <div className="text-xs text-blue-800">
                          {delivery.currentLocation.lat?.toFixed(4)}, {delivery.currentLocation.lng?.toFixed(4)}
                          <span className="ml-2">• Updated: {formatTime(delivery.currentLocation.timestamp)}</span>
                        </div>
                      </div>
                    )}

                    {/* Delivery Notes */}
                    {delivery.deliveryNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {delivery.deliveryNotes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowDetails(true);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View Details
                    </button>
                    
                    {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                      <button
                        onClick={() => markAsDelivered(delivery._id)}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delivery Details Modal */}
      {showDetails && (
        <DeliveryDetails 
          delivery={selectedDelivery} 
          onClose={() => {
            setShowDetails(false);
            setSelectedDelivery(null);
          }} 
        />
      )}
    </div>
  );
};

export default RegularDeliveryDashboard;
