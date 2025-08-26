import { create } from 'zustand';
import { api } from './api.js';

export const useAppStore = create((set, get) => ({
  homeData: { offers: [], shops: [], topProducts: [] },
  shops: [],
  selectedShop: null,
  shopData: null,
  products: [],
  shopProducts: [],
  cart: [],
  cartItemCount: 0,
  cartTotal: 0,
  orders: [],
  orderHistory: [],
  userOrders: [],
  pendingProducts: [],
  pendingShops: [],
  sellers: [],
  isLoading: false,
  error: null,

  getHomeData: async () => {
    if (get().isLoading) return { success: false, error: 'Already loading' };
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users/home');
      const { offers, shops } = response.data.data;
      set({
        homeData: { offers: offers || [], shops: shops || [], topProducts: [] },
        isLoading: false,
        error: null,
      });
      await get().getTopProducts();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load home data';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getTopProducts: async () => {
    try {
      const response = await api.get('/users/topproduct');
      const topProducts = response.data.data?.topProducts || [];
      set(state => ({ homeData: { ...state.homeData, topProducts } }));
      return { success: true };
    } catch (error) {
      console.error('Failed to load top products:', error);
      return { success: false, error: error.message };
    }
  },

  getShops: async (params = {}) => {
    if (get().isLoading) return { success: false, error: 'Already loading' };
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users/shops', { params });
      const data = response.data.data || {};
      const shops = data.shops || [];
      const totalPages = data.totalPages || 1;
      set({ shops, isLoading: false, error: null });
      return { success: true, shops, totalPages };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load shops';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getShopDetails: async (shopId) => {
    if (get().isLoading) return { success: false, error: 'Already loading' };
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/shops/${shopId}`);
      const shop = response.data.data;
      set({ selectedShop: shop, shopData: shop, isLoading: false, error: null });
      return { success: true, shop };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load shop details';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getShopProducts: async (shopId) => {
    if (get().isLoading) return { success: false, error: 'Already loading' };
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/shops/${shopId}/products`);
      const products = response.data.data || [];
      set({ products, shopProducts: products, isLoading: false, error: null });
      return { success: true, products };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load products';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getShopById: async (shopId) => {
    console.log('🔄 Store: getShopById called with shopId:', shopId);
    try {
      const response = await api.get(`/users/shops/${shopId}`);
      const shopData = response.data.data;
      console.log('✅ Store: getShopById success, setting shopData:', shopData);
      set({ selectedShop: shopData, shopData, isLoading: false, error: null });
      return { success: true, shopData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load shop details';
      console.error('❌ Store: getShopById error:', errorMessage);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  getProductsByShop: async (shopId) => {
    console.log('🔄 Store: getProductsByShop called with shopId:', shopId);
    try {
      const response = await api.get(`/users/shops/${shopId}/products`);
      const products = response.data.data || [];
      console.log('✅ Store: getProductsByShop success, setting products:', products);
      set({ products, shopProducts: products, isLoading: false, error: null });
      return { success: true, products };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load products';
      console.error('❌ Store: getProductsByShop error:', errorMessage);
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  toggleFavoriteShop: async (shopId) => {
    try {
      const response = await api.post('/favorites/toggle', {
        targetType: 'shop',
        targetId: shopId
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle favorite shop';
      return { success: false, error: errorMessage };
    }
  },

  checkFavoriteStatus: async (targetType, targetId) => {
    try {
      const response = await api.get(`/favorites/status/${targetType}/${targetId}`);
      return { success: true, isFavorited: response.data.data.isFavorited };
    } catch (error) {
      return { success: false, isFavorited: false };
    }
  },

  addToCart: (product) => {
    set(state => {
      const existingItem = state.cart.find(item => item._id === product._id);
      const newCart = existingItem
        ? state.cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...state.cart, { ...product, quantity: 1 }];
      const cartItemCount = newCart.reduce((c, it) => c + it.quantity, 0);
      const cartTotal = newCart.reduce((t, it) => t + (it.price * it.quantity), 0);
      return { cart: newCart, cartItemCount, cartTotal };
    });
  },

  removeFromCart: (productId) => {
    set(state => {
      const newCart = state.cart.filter(item => item._id !== productId);
      const cartItemCount = newCart.reduce((c, it) => c + it.quantity, 0);
      const cartTotal = newCart.reduce((t, it) => t + (it.price * it.quantity), 0);
      return { cart: newCart, cartItemCount, cartTotal };
    });
  },

  updateCartItemQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set(state => {
      const newCart = state.cart.map(item => item._id === productId ? { ...item, quantity } : item);
      const cartItemCount = newCart.reduce((c, it) => c + it.quantity, 0);
      const cartTotal = newCart.reduce((t, it) => t + (it.price * it.quantity), 0);
      return { cart: newCart, cartItemCount, cartTotal };
    });
  },

  clearCart: () => set({ cart: [], cartItemCount: 0, cartTotal: 0 }),
  getCartItemCount: () => get().cartItemCount,
  getCartTotal: () => get().cartTotal,

  getUserOrders: async () => {
    console.log('🔄 Store: getUserOrders called');
    try {
      set({ isLoading: true, error: null });
      
      // Only fetch active orders from Order model
      const response = await api.get('/users/orders');
      console.log('✅ Store: Active orders fetched:', response.data);
      
      // Ensure userOrders is always an array
      // Backend returns: { statusCode, success, message, data: [orders], ... }
      const actualData = response.data?.data || response.data;
      const ordersArray = Array.isArray(actualData) ? actualData : [];
      
      console.log('🔍 Store: Raw response.data:', response.data);
      console.log('🔍 Store: Actual data extracted:', actualData);
      console.log('🔍 Store: Final ordersArray:', ordersArray);
      
      set({ 
        userOrders: ordersArray,
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Store: getUserOrders error:', error);
      set({ 
        userOrders: [],
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false 
      });
    }
  },

  getOrderHistory: async () => {
    console.log('🔄 Store: getOrderHistory called');
    try {
      set({ isLoading: true, error: null });
      
      // Only fetch historical orders from OrderHistory model
      const response = await api.get('/users/order-history');
      console.log('✅ Store: Order history fetched:', response.data);
      
      // Ensure orderHistory is always an array
      // Backend returns: { statusCode, success, message, data: [orders], ... }
      const actualData = response.data?.data || response.data;
      const historyArray = Array.isArray(actualData) ? actualData : [];
      
      console.log('🔍 Store: Raw response.data:', response.data);
      console.log('🔍 Store: Actual data extracted:', actualData);
      console.log('🔍 Store: Final historyArray:', historyArray);
      
      set({ 
        orderHistory: historyArray,
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Store: getOrderHistory error:', error);
      set({ 
        orderHistory: [],
        error: error.response?.data?.message || 'Failed to fetch order history',
        isLoading: false 
      });
    }
  },

  createOrder: async (deliveryInfo = {}) => {
    try {
      console.log('🔄 Store: createOrder called with deliveryInfo:', deliveryInfo);
      
      const { cart } = get();
      console.log('🛒 Store: Current cart:', cart);
      
      if (!cart || cart.length === 0) {
        console.log('❌ Store: Cart is empty, cannot create order');
        return { success: false, error: 'Cart is empty' };
      }
      
      const shopIdToItems = cart.reduce((acc, item) => {
        const shopId = item.shopId || item.shop?._id;
        console.log('🏪 Store: Processing item:', { itemId: item._id, shopId, item });
        if (!shopId) {
          console.log('❌ Store: Item missing shopId:', item);
          return acc;
        }
        if (!acc[shopId]) acc[shopId] = [];
        acc[shopId].push({ productId: item._id, quantity: item.quantity, price: item.price });
        return acc;
      }, {});
      
      console.log('🏪 Store: Shop ID to items mapping:', shopIdToItems);
      
      const shops = Object.entries(shopIdToItems).map(([shopId, products]) => ({ shopId, products }));
      const totalQuantity = cart.reduce((sum, it) => sum + it.quantity, 0);
      const totalPrice = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
      
      console.log('📊 Store: Order summary:', { shops, totalQuantity, totalPrice });
      
      const payload = { shops, totalQuantity, totalPrice, deliveryType: deliveryInfo.deliveryType || 'regular' };
      
      if (deliveryInfo.deliveryType === 'drone') {
        if (deliveryInfo.deliveryLocation && deliveryInfo.pickupLocation) {
          payload.deliveryLocation = { address: deliveryInfo.deliveryLocation, lat: 0, lng: 0 };
          payload.pickupLocation = { address: deliveryInfo.pickupLocation, lat: 0, lng: 0 };
        }
      } else if (deliveryInfo.deliveryAddress) {
        payload.deliveryLocation = { address: deliveryInfo.deliveryAddress, lat: 0, lng: 0 };
      }
      
      console.log('📤 Store: Sending order payload to backend:', payload);
      console.log('📤 Store: Payload JSON:', JSON.stringify(payload, null, 2));
      
      const response = await api.post('/users/orders', payload);
      console.log('✅ Store: Backend order creation response:', response.data);
      
      set({ cart: [], cartItemCount: 0, cartTotal: 0 });
      console.log('🛒 Store: Cart cleared after successful order');
      
      return { success: true, order: response.data.data };
    } catch (error) {
      console.error('❌ Store: Order creation failed:', error);
      console.error('❌ Store: Error response:', error.response?.data);
      console.error('❌ Store: Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Failed to place order';
      return { success: false, error: errorMessage };
    }
  },

  deliveryTracking: {},
  deliveryPollers: {},

  getDeliveryTracking: async (orderId, shopId) => {
    try {
      const response = await api.get(`/delivery/track/${orderId}`, { params: { shopId } });
      const tracking = response.data.data || {};
      const key = `${orderId}:${shopId || 'all'}`;
      set(state => ({ deliveryTracking: { ...state.deliveryTracking, [key]: tracking } }));
      return { success: true, tracking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch delivery tracking';
      return { success: false, error: errorMessage };
    }
  },

  startDeliveryPolling: (orderId, shopId, intervalMs = 5000) => {
    const key = `${orderId}:${shopId || 'all'}`;
    if (get().deliveryPollers[key]) return;
    const poller = setInterval(() => get().getDeliveryTracking(orderId, shopId), intervalMs);
    set(state => ({ deliveryPollers: { ...state.deliveryPollers, [key]: poller } }));
  },

  stopDeliveryPolling: (orderId, shopId) => {
    const key = `${orderId}:${shopId || 'all'}`;
    const pollers = { ...get().deliveryPollers };
    if (pollers[key]) {
      clearInterval(pollers[key]);
      delete pollers[key];
      set({ deliveryPollers: pollers });
    }
  },

  getPendingProducts: async () => {
    try {
      const response = await api.get('/admin/products/pending');
      const products = response.data.data || [];
      set({ pendingProducts: products });
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load pending products' };
    }
  },

  approveProduct: async (productId, isApproved, rejectionReason = '') => {
    try {
      const response = await api.put(`/admin/products/${productId}/approve`, { isApproved, rejectionReason });
      get().getPendingProducts();
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update product approval' };
    }
  },

  getPendingShops: async () => {
    try {
      console.log('🔍 Frontend: Calling getPendingShops');
      const response = await api.get('/admin/shops/pending');
      console.log('🔍 Frontend: getPendingShops response:', response);
      const shops = response.data.data || [];
      console.log('🔍 Frontend: Extracted shops:', shops);
      set({ pendingShops: shops });
      return { success: true, shops };
    } catch (error) {
      console.error('🔍 Frontend: getPendingShops error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to load pending shops' };
    }
  },

  getAllShops: async (filters = {}) => {
    try {
      console.log('🔍 Frontend: Calling getAllShops with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/admin/shops?${params.toString()}`);
      console.log('🔍 Frontend: getAllShops response:', response);
      const data = response.data.data || { shops: [], pagination: {} };
      console.log('🔍 Frontend: Extracted shops:', data.shops);
      set({ allShops: data.shops, shopsPagination: data.pagination });
      return { success: true, shops: data.shops, pagination: data.pagination };
    } catch (error) {
      console.error('🔍 Frontend: getAllShops error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to load shops' };
    }
  },

  approveShop: async (shopId, isApproved, rejectionReason = '') => {
    try {
      const response = await api.put(`/admin/shops/${shopId}/approve`, { isApproved, rejectionReason });
      get().getPendingShops();
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update shop approval' };
    }
  },

  getSellers: async () => {
    try {
      console.log('🔍 Frontend: Calling getSellers');
      const response = await api.get('/admin/sellers');
      console.log('🔍 Frontend: getSellers response:', response);
      const sellers = response.data.data || [];
      console.log('🔍 Frontend: Extracted sellers:', sellers);
      set({ sellers });
      return { success: true, sellers };
    } catch (error) {
      console.error('🔍 Frontend: getSellers error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to load sellers' };
    }
  },

  toggleSellerStatus: async (sellerId, isActive) => {
    try {
      const response = await api.put(`/admin/sellers/${sellerId}/status`, { isActive });
      get().getSellers();
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to toggle seller status' };
    }
  },

  deleteSeller: async (sellerId) => {
    try {
      await api.delete(`/admin/sellers/${sellerId}`);
      get().getSellers();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),

  getSellerOffers: async () => {
    try {
      const response = await api.get('/seller/offers');
      return { success: true, offers: response.data.data?.offers || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createOffer: async (offerData) => {
    try {
      const response = await api.post('/seller/offers', offerData);
      return { success: true, offer: response.data.data?.offer };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  updateOffer: async (offerId, offerData) => {
    try {
      const response = await api.patch(`/seller/offers/${offerId}`, offerData);
      return { success: true, offer: response.data.data?.offer };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  deleteOffer: async (offerId) => {
    try {
      await api.delete(`/seller/offers/${offerId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  getPendingOffers: async () => {
    try {
      const response = await api.get('/admin/offers/pending');
      return { success: true, offers: response.data.data?.offers || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  approveOffer: async (offerId) => {
    try {
      const response = await api.put(`/admin/offers/${offerId}/approve`);
      return { success: true, offer: response.data.data?.offer };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  getActiveOffers: async () => {
    try {
      const response = await api.get('/users/offers');
      return { success: true, offers: response.data.data?.offers || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getShopOffers: async (shopId) => {
    try {
      const response = await api.get(`/users/shops/${shopId}/offers`);
      return { success: true, offers: response.data.data?.offers || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}));