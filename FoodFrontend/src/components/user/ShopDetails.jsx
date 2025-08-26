import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  Store, 
  Package, 
  Star, 
  ShoppingCart,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  Minus,
  Search,
  Filter,
  ChevronRight,
  Home
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import RatingComponent from '../common/RatingComponent';
import { api } from '../../stores/api.js';

const ShopDetails = () => {
  const { shopId } = useParams();
  const { user } = useAuthStore();
  const { 
    getShopById, 
    getProductsByShop,
    getShopOffers,
    shopData,
    shopProducts,
    addToCart,
    isLoading, 
    error 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState({});
  const [cartTotal, setCartTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [shopOffers, setShopOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const fetchShopOffers = async (shopId) => {
    try {
      setOffersLoading(true);
      const result = await getShopOffers(shopId);
      if (result.success) {
        setShopOffers(result.offers || []);
      } else {
        setShopOffers([]);
      }
    } catch (error) {
      setShopOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  // Initialize component state
  useEffect(() => {
    const loadShopData = async () => {
      if (shopId) {
        try {
          console.log('🔄 Loading shop data for shopId:', shopId);
          
          // Load shop data
          const shopResult = await getShopById(shopId);
          console.log('✅ Shop data loaded:', shopResult);
          
          // Load products
          const productsResult = await getProductsByShop(shopId);
          console.log('✅ Products loaded:', productsResult);
          
          // Load offers
          await fetchShopOffers(shopId);
          
          // Set ready after all data is loaded
          setIsReady(true);
        } catch (error) {
          console.error('Error loading shop data:', error);
          setIsReady(true); // Set ready even on error to show error state
        }
      }
    };

    loadShopData();
  }, [shopId, getShopById, getProductsByShop]);

  useEffect(() => {
    const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);

  // Debug: Monitor state changes
  useEffect(() => {
    console.log('🔍 State Update - shopProducts:', {
      length: shopProducts?.length || 0,
      isArray: Array.isArray(shopProducts),
      products: shopProducts
    });
    
    // Check if products belong to the correct shop
    if (shopProducts && Array.isArray(shopProducts)) {
      const wrongShopProducts = shopProducts.filter(product => product.shopId !== shopId);
      if (wrongShopProducts.length > 0) {
        console.error('❌ Found products from wrong shop!', wrongShopProducts);
      }
    }
  }, [shopProducts, shopId]);

  useEffect(() => {
    console.log('🔍 State Update - shopData:', {
      shopId: shopData?._id,
      expectedShopId: shopId,
      name: shopData?.name,
      description: shopData?.description,
      city: shopData?.city,
      state: shopData?.state,
      isActive: shopData?.isActive,
      isApproved: shopData?.isApproved,
      openingHours: shopData?.openingHours,
      closingHours: shopData?.closingHours,
      contactNumber: shopData?.contactNumber,
      image: shopData?.image,
      averageRating: shopData?.averageRating,
      totalRatings: shopData?.totalRatings,
      location: shopData?.location
    });
    
    // Log full shop data for debugging
    if (shopData) {
      console.log('🔍 Full shop data:', JSON.stringify(shopData, null, 2));
    }
    
    // Check if shop data matches expected shop ID
    if (shopData && shopData._id !== shopId) {
      console.error('❌ Shop data mismatch! Expected:', shopId, 'Got:', shopData._id);
    }
  }, [shopData, shopId]);

  const manualRefreshProducts = async () => {
    try {
      console.log('🔄 Manually refreshing products...');
      const result = await getProductsByShop(shopId);
      console.log('✅ Manual refresh result:', result);
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
    }
  };

  const checkOffersStatus = async () => {
    try {
      console.log('🔍 Checking offers status...');
      
      // Check all active offers using the proper API
      const allOffersResponse = await api.get('/users/offers');
      console.log('📊 All active offers:', allOffersResponse.data);
      
      // Check shop-specific offers using the proper API
      const shopOffersResponse = await api.get(`/users/shops/${shopId}/offers`);
      console.log('📊 Shop-specific offers:', shopOffersResponse.data);
      
      // Check if there are any offers for this shop at all
      if (allOffersResponse.data.data?.offers) {
        const shopOffers = allOffersResponse.data.data.offers.filter(offer => 
          offer.shopId === shopId
        );
        console.log('🔍 Offers for this shop from all offers:', shopOffers);
        
        if (shopOffers.length > 0) {
          console.log('📋 Shop offers details:');
          shopOffers.forEach((offer, index) => {
            console.log(`  Offer ${index + 1}:`, {
              id: offer._id,
              title: offer.title,
              isApproved: offer.isApproved,
              isActive: offer.isActive,
              validFrom: offer.validFrom,
              validUntil: offer.validUntil,
              now: new Date()
            });
          });
        } else {
          console.log('❌ No offers found for this shop in all offers');
        }
      }
    } catch (error) {
      console.error('❌ Error checking offers status:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const createTestOffer = async () => {
    try {
      console.log('🧪 Creating test offer...');
      
      // This would normally be done by a seller, but let's test if the API works
      const testOfferData = {
        title: 'Test Offer - 20% Off',
        description: 'This is a test offer to verify the offers system is working',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        shopId: shopId
      };
      
      console.log('📋 Test offer data:', testOfferData);
      console.log('⚠️ Note: This will fail if you\'re not a seller, but it will show us the error');
      
      // Try to create the offer using the proper API
      const response = await api.post('/seller/offers', testOfferData);
      console.log('📊 Create offer result:', response.data);
      
    } catch (error) {
      console.error('❌ Error creating test offer:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const checkDatabaseForOffers = async () => {
    try {
      console.log('🔍 Checking database for offers...');
      
      // Use the test endpoint to see what's in the database
      const response = await api.get('/users/test-shop-info');
      console.log('📊 Database info:', response.data);
      
      // Check if there are any offers in the database
      if (response.data.data?.offers) {
        console.log('📋 Offers in database:', response.data.data.offers);
        
        // Find offers for this shop
        const shopOffers = response.data.data.offers.filter(offer => 
          offer.shopId === shopId
        );
        console.log('🔍 Offers for this shop in database:', shopOffers);
      } else {
        console.log('❌ No offers found in database');
      }
      
    } catch (error) {
      console.error('❌ Error checking database for offers:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const checkAllOffersInSystem = async () => {
    try {
      console.log('🔍 Checking all offers in the system...');
      
      // Check if there are any offers at all
      const response = await api.get('/users/offers');
      console.log('📊 All offers response:', response.data);
      
      if (response.data.data?.offers && response.data.data.offers.length > 0) {
        console.log('✅ Found offers in the system:', response.data.data.offers.length);
        console.log('📋 First few offers:');
        response.data.data.offers.slice(0, 3).forEach((offer, index) => {
          console.log(`  Offer ${index + 1}:`, {
            id: offer._id,
            title: offer.title,
            shopId: offer.shopId,
            isApproved: offer.isApproved,
            isActive: offer.isActive
          });
        });
    } else {
        console.log('❌ No offers found in the entire system');
      }
      
    } catch (error) {
      console.error('❌ Error checking all offers:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const checkOfferDateValidation = () => {
    try {
      console.log('🔍 Checking offer date validation...');
      
      const now = new Date();
      console.log('📅 Current date/time:', now.toISOString());
      console.log('📅 Current date (local):', now.toLocaleDateString());
      console.log('📅 Current time (local):', now.toLocaleTimeString());
      
      // Check the specific offer dates from the database
      const offerValidFrom = new Date('2025-08-24T00:00:00.000Z');
      const offerValidUntil = new Date('2025-08-26T00:00:00.000Z');
      
      console.log('📅 Offer validFrom:', offerValidFrom.toISOString());
      console.log('📅 Offer validUntil:', offerValidUntil.toISOString());
      
      // Check if the offer should be visible
      const isStarted = offerValidFrom <= now;
      const isNotExpired = offerValidUntil >= now;
      const shouldBeVisible = isStarted && isNotExpired;
      
      console.log('🔍 Date validation results:');
      console.log('  - Is offer started?', isStarted, `(${offerValidFrom <= now})`);
      console.log('  - Is offer not expired?', isNotExpired, `(${offerValidUntil >= now})`);
      console.log('  - Should offer be visible?', shouldBeVisible);
      
      if (!shouldBeVisible) {
        if (!isStarted) {
          console.log('❌ Offer is not visible because it hasn\'t started yet');
          console.log('⏰ Offer will become visible on:', offerValidFrom.toLocaleDateString());
        }
        if (!isNotExpired) {
          console.log('❌ Offer is not visible because it has expired');
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking offer date validation:', error);
    }
  };

  const inspectAPIResponses = async () => {
    try {
      console.log('🔍 Inspecting API responses in detail...');
      
      // Check all active offers
      console.log('📊 Checking all active offers...');
      const allOffersResponse = await api.get('/users/offers');
      console.log('📊 All offers - Full response:', JSON.stringify(allOffersResponse.data, null, 2));
      console.log('📊 All offers - Data field:', allOffersResponse.data.data);
      console.log('📊 All offers - Data type:', typeof allOffersResponse.data.data);
      console.log('📊 All offers - Has offers property?', allOffersResponse.data.data?.hasOwnProperty('offers'));
      console.log('📊 All offers - Offers array:', allOffersResponse.data.data?.offers);
      console.log('📊 All offers - Offers length:', allOffersResponse.data.data?.offers?.length);
      
      // Check shop-specific offers
      console.log('\n📊 Checking shop-specific offers...');
      const shopOffersResponse = await api.get(`/users/shops/${shopId}/offers`);
      console.log('📊 Shop offers - Full response:', JSON.stringify(shopOffersResponse.data, null, 2));
      console.log('📊 Shop offers - Data field:', shopOffersResponse.data.data);
      console.log('📊 Shop offers - Data type:', typeof shopOffersResponse.data.data);
      console.log('📊 Shop offers - Has offers property?', shopOffersResponse.data.data?.hasOwnProperty('offers'));
      console.log('📊 Shop offers - Offers array:', shopOffersResponse.data.data?.offers);
      console.log('📊 Shop offers - Offers length:', shopOffersResponse.data.data?.offers?.length);
      
      // Check if the shopId matches
      console.log('\n🔍 Checking shopId matching...');
      console.log('🔍 Current shopId:', shopId);
      console.log('🔍 ShopId type:', typeof shopId);
      console.log('🔍 ShopId from database offer:', '68a856dd71b27705b1561f1e');
      console.log('🔍 ShopId match?', shopId === '68a856dd71b27705b1561f1e');
      
    } catch (error) {
      console.error('❌ Error inspecting API responses:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const testOrderCreation = async () => {
    try {
      console.log('🧪 Testing order creation...');
      
      // Create a test order payload
      const testOrderPayload = {
        shops: [{
          shopId: shopId,
          products: [{
            productId: shopProducts.products[0]?._id || 'test-product-id',
            quantity: 1,
            price: 100
          }]
        }],
        totalQuantity: 1,
        totalPrice: 100,
        deliveryType: 'regular',
        deliveryLocation: {
          address: 'Test Address',
          lat: 0,
          lng: 0
        }
      };
      
      console.log('📤 Test order payload:', testOrderPayload);
      console.log('📤 Test order payload JSON:', JSON.stringify(testOrderPayload, null, 2));
      
      // Try to create the order
      const response = await api.post('/users/orders', testOrderPayload);
      console.log('✅ Test order creation response:', response.data);
      
      // Check if order was created
      if (response.data.success) {
        console.log('🎉 Test order created successfully!');
        console.log('📋 Order ID:', response.data.data?.order?._id);
        
        // Try to fetch the order to verify it was saved
        setTimeout(async () => {
          try {
            console.log('🔍 Fetching created order to verify...');
            const orderResponse = await api.get('/users/orders');
            console.log('📊 Orders after creation:', orderResponse.data);
          } catch (fetchError) {
            console.error('❌ Error fetching orders after creation:', fetchError);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Test order creation failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
    }
  };

  const testCartFunctionality = () => {
    try {
      console.log('🧪 Testing cart functionality...');
      
      if (shopProducts.products && shopProducts.products.length > 0) {
        const testProduct = shopProducts.products[0];
        console.log('📦 Test product:', testProduct);
        
        // Test adding to cart
        console.log('🛒 Adding test product to cart...');
        addLocal(testProduct);
        
        // Check if shop details are included
        console.log('🏪 Shop data available:', shopData);
        console.log('🔍 Shop ID:', shopId);
        
        setTimeout(() => {
          console.log('🛒 Cart state after adding product (check console for details)');
        }, 100);
    } else {
        console.log('❌ No products available to test with');
      }
      
    } catch (error) {
      console.error('❌ Error testing cart functionality:', error);
    }
  };

  const checkDatabaseOrders = async () => {
    try {
      console.log('🔍 Checking database for orders...');
      
      // Check active orders
      const activeOrdersResponse = await api.get('/users/orders');
      console.log('📊 Active orders response:', activeOrdersResponse.data);
      console.log('📊 Active orders count:', activeOrdersResponse.data.data?.length || 0);
      
      // Check order history
      const historyResponse = await api.get('/users/order-history');
      console.log('📊 Order history response:', historyResponse.data);
      console.log('📊 Order history count:', historyResponse.data.data?.length || 0);
      
      // Check if there are any orders at all
      const totalOrders = (activeOrdersResponse.data.data?.length || 0) + (historyResponse.data.data?.length || 0);
      console.log('📊 Total orders in database:', totalOrders);
      
      if (totalOrders === 0) {
        console.log('❌ No orders found in database at all');
        console.log('💡 This means either:');
        console.log('   1. No orders have been created yet');
        console.log('   2. Orders are not being saved to database');
        console.log('   3. Orders are in a different collection');
      } else {
        console.log('✅ Orders found in database');
        console.log('📋 Active orders:', activeOrdersResponse.data.data);
        console.log('📋 Order history:', historyResponse.data.data);
      }
      
    } catch (error) {
      console.error('❌ Error checking database for orders:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  const addLocal = (product) => {
    setCart(prev => {
      const existing = prev[product._id];
      if (existing) {
        return { ...prev, [product._id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [product._id]: { ...product, quantity: 1 } };
    });
    
    // Add to cart with shop information
    const productWithShop = {
      ...product,
      shopId: shopId,
      shopName: shopData?.name || 'Unknown Shop',
      shopCity: shopData?.city || 'Unknown City',
      shopState: shopData?.state || 'Unknown State'
    };
    addToCart(productWithShop);
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity
      }
    }));
  };

  const placeOrder = async () => {
    try {
      const orderItems = Object.values(cart).map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderData = {
        shopId,
        items: orderItems,
        totalAmount: cartTotal
      };

      console.log('Placing order:', orderData);
      
      setCart({});
      setCartTotal(0);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const renderProducts = () => {
    // Safety check for component readiness
    if (!isReady) {
      return <div className="text-center py-8">Loading products...</div>;
    }
    
    // Safety check for search variable and component state
    if (typeof search === 'undefined' || search === null) {
      return <div className="text-center py-8">Loading products...</div>;
    }
    
    // Safety check for shopProducts
    if (!Array.isArray(shopProducts)) {
      return <div className="text-center py-8">Loading products...</div>;
    }
    
    const q = search.trim().toLowerCase();
    const visible = shopProducts
      .filter(p => !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-asc':
            return (a.price || 0) - (b.price || 0);
          case 'price-desc':
            return (b.price || 0) - (a.price || 0);
          default:
            return 0;
        }
      });
    
    return (
      <>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visible.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                    product.available 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {product.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{product.description}</p>

                <div className="mb-3">
                  <RatingComponent
                    targetType="product"
                    targetId={product._id}
                    currentRating={product.averageRating || 0}
                    totalRatings={product.totalRatings || 0}
                    totalLikes={product.totalLikes || 0}
                    totalFavorites={product.totalFavorites || 0}
                    totalComments={product.totalComments || 0}
                    showActions={true}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                </div>
                
                {product.available && (
                  <button
                    onClick={() => addLocal(product)}
                    className="w-full btn-primary text-sm py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {visible.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {search ? `No products match "${search}"` : 'No products available in this shop'}
              </p>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderOffers = () => {
    if (offersLoading) {
      return (
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2">Loading offers...</p>
        </div>
      );
    }

    if (!shopOffers || shopOffers.length === 0) {
      return (
    <div className="text-center py-12">
      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
      <p className="text-gray-500">Check back later for special offers and discounts</p>
    </div>
  );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Special Offers</h3>
          <p className="text-gray-600">Exclusive deals and discounts from this shop</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopOffers.map((offer) => (
            <div key={offer._id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `$${offer.discountValue} OFF`}
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
              
              {offer.validUntil && (
                <div className="text-xs text-gray-500 mb-3">
                  Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                </div>
              )}
              
              {offer.applicableProducts && offer.applicableProducts.length > 0 && (
                <div className="text-xs text-gray-600">
                  Applicable to: {offer.applicableProducts.length} product(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShopInfo = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Shop Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Address</p>
                <p className="text-gray-600">{shopData?.location || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Opening Hours</p>
                <p className="text-gray-600">{shopData?.openingHours || 'N/A'} - {shopData?.closingHours || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Contact</p>
                <p className="text-gray-600">{shopData?.contactNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Store className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full ${shopData?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {shopData?.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">City / State</p>
                <p className="text-gray-600">{shopData?.city || 'N/A'}, {shopData?.state || 'N/A'}</p>
              </div>
            </div>

            {(shopData?.averageRating || shopData?.totalRatings) && (
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Rating</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{(shopData?.averageRating || 0).toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({shopData?.totalRatings || 0} ratings)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : !shopData ? (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Shop not found</h3>
          <p className="text-gray-500">The shop you're looking for doesn't exist</p>
        </div>
      ) : (
        <>
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link to="/" className="flex items-center hover:text-primary-600 transition-colors">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/shops" className="hover:text-primary-600 transition-colors">
                Shops
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{shopData.name}</span>
            </div>
            
            {/* Back to Shops Button */}
            <Link
              to="/shops"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Shops
            </Link>
          </nav>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="h-40 md:h-52 bg-gray-100 flex items-center justify-center relative overflow-hidden">
              {shopData.image ? (
                <img src={shopData.image} alt={shopData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Store className="w-16 h-16 mb-2" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${
                  shopData.isActive && shopData.isApproved
                    ? 'bg-green-500 text-white' 
                    : !shopData.isApproved
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {shopData.isActive && shopData.isApproved ? 'Open' : !shopData.isApproved ? 'Pending Approval' : 'Closed'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{shopData.name}</h1>
                  <p className="text-gray-600 text-lg mb-4">{shopData.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{shopData.city}, {shopData.state}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{shopData.openingHours || 'N/A'} - {shopData.closingHours || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <RatingComponent
                      targetType="shop"
                      targetId={shopData._id}
                      currentRating={shopData.averageRating || 0}
                      totalRatings={shopData.totalRatings || 0}
                      totalLikes={shopData.totalLikes || 0}
                      totalFavorites={shopData.totalFavorites || 0}
                      totalComments={shopData.totalComments || 0}
                      showActions={true}
                    />
                  </div>
                  
                  {/* Manual refresh button for testing */}
                  <div className="mt-4">
                    <button
                      onClick={manualRefreshProducts}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm mr-2"
                    >
                      🔄 Refresh Products
                    </button>
                    <button
                      onClick={checkOffersStatus}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      🔍 Check Offers Status
                    </button>
                    <button
                      onClick={createTestOffer}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm ml-2"
                    >
                      🧪 Create Test Offer
                    </button>
                    <button
                      onClick={checkDatabaseForOffers}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
                    >
                      🔍 Check DB Offers
                    </button>
                    <button
                      onClick={checkAllOffersInSystem}
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm ml-2"
                    >
                      🔍 Check All Offers
                    </button>
                    <button
                      onClick={checkOfferDateValidation}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm ml-2"
                    >
                      🔍 Check Offer Dates
                    </button>
                    <button
                      onClick={inspectAPIResponses}
                      className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm ml-2"
                    >
                      🔍 Inspect API Responses
                    </button>
                    <button
                      onClick={testOrderCreation}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm ml-2"
                    >
                      🧪 Test Order Creation
                    </button>
                    <button
                      onClick={testCartFunctionality}
                      className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm ml-2"
                    >
                      🧪 Test Cart Functionality
                    </button>
                    <button
                      onClick={checkDatabaseOrders}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm ml-2"
                    >
                      🔍 Check DB Orders
                    </button>
                  </div>
                </div>
                
                {(shopData.averageRating || shopData.totalRatings) && (
                  <div className="mt-4 lg:mt-0 lg:ml-6 text-center lg:text-right">
                    <div className="flex items-center justify-center lg:justify-end mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(shopData.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{(shopData.averageRating || 0).toFixed(1)}</p>
                    <p className="text-sm text-gray-500">({shopData.totalRatings || 0} ratings)</p>
                  </div>
                )}
              </div>
            </div>
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
              {activeTab === 'products' && renderProducts()}
              {activeTab === 'offers' && renderOffers()}
              {activeTab === 'info' && renderShopInfo()}
            </div>
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Cart</h3>
              
              <div className="space-y-3 mb-4">
                {Object.values(cart).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-primary-600">₹{cartTotal}</span>
                </div>
                
                <button
                  onClick={placeOrder}
                  className="w-full btn-primary py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const tabs = [
  { id: 'products', name: 'Menu', icon: Package },
  { id: 'offers', name: 'Offers', icon: Star },
  { id: 'info', name: 'Shop Info', icon: Store },
];

export default ShopDetails;
