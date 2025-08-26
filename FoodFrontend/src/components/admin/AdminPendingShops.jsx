import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { 
  Search, 
  Filter, 
  MapPin, 
  Store, 
  User, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const AdminPendingShops = () => {
  const { getAllShops, approveShop } = useAppStore();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 9;

  useEffect(() => {
    loadShops();
  }, [page, statusFilter]);

  useEffect(() => {
    filterShops();
  }, [items, search, locationFilter]);

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const filters = {
        page,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const result = await getAllShops(filters);
      if (result.success) {
        setItems(result.shops || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = [...items];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name?.toLowerCase().includes(searchLower) ||
        shop.city?.toLowerCase().includes(searchLower) ||
        shop.state?.toLowerCase().includes(searchLower) ||
        shop.location?.toLowerCase().includes(searchLower) ||
        shop.sellerId?.name?.toLowerCase().includes(searchLower) ||
        shop.sellerId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(shop => shop.state === locationFilter);
    }

    setFilteredItems(filtered);
  };

  // Get unique states for location filter
  const uniqueStates = [...new Set(items.map(shop => shop.state).filter(Boolean))].sort();

  const handleApprove = async (id, isApproved) => {
    const res = await approveShop(id, isApproved);
    if (res?.success) {
      loadShops(); // Reload the current page
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page when changing status filter
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
  };

  const getStatusFilterTitle = () => {
    switch (statusFilter) {
      case 'pending': return 'Pending Shops';
      case 'approved': return 'Approved Shops';
      default: return 'All Shops';
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex">
      <div className="hidden md:block"><div /></div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">{getStatusFilterTitle()}</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shops by name, location, or seller..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Shops</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Only</option>
                </select>
              </div>
            </div>

            {/* Location Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Locations</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredItems.length} of {totalItems} shops
            </span>
            {search || locationFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setLocationFilter('all');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shops...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            {items.length === 0 ? (
              <>
                <Store className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops found</h3>
                <p className="text-gray-600">No shops match your current criteria.</p>
              </>
            ) : (
              <>
                <Search className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((s) => (
                <div key={s._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-gray-500" />
                      <div className="font-semibold text-gray-900">{s.name}</div>
                    </div>
                    {getStatusBadge(s.isApproved)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{s.city}, {s.state}</span>
                    </div>
                    
                    {s.location && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {s.location}
                      </div>
                    )}
                    
                    {s.sellerId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{s.sellerId.name}</span>
                      </div>
                    )}
                    
                    {s.contactNumber && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Contact:</span> {s.contactNumber}
                      </div>
                    )}
                    
                    {s.openingHours && s.closingHours && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Hours:</span> {s.openingHours} - {s.closingHours}
                      </div>
                    )}
                    
                    {s.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {!s.isApproved && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleApprove(s._id, true)} 
                        className="btn-primary px-3 py-1 text-sm flex-1 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleApprove(s._id, false)} 
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex-1 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handlePageChange(Math.max(1, page - 1))} 
                    disabled={page === 1} 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        page === pageNum
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))} 
                    disabled={page === totalPages} 
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
  );
};

export default AdminPendingShops;


