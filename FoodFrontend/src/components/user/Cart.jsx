import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  ShoppingCart, 
  Package, 
  Trash2, 
  Plus, 
  Minus,
  MapPin,
  Clock,
  Store,
  Zap,
  Truck
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, cartTotal, isLoading, error, updateCartItemQuantity, removeFromCart, createOrder } = useAppStore();
  const [selectedShop, setSelectedShop] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryType, setDeliveryType] = useState('regular');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('🛒 Cart component: cart changed:', cart);
    console.log('🛒 Cart component: cart items with shop details:');
    cart.forEach((item, index) => {
      console.log(`  Item ${index}:`, {
        id: item._id,
        name: item.name,
        shopId: item.shopId,
        shopName: item.shopName,
        shopCity: item.shopCity,
        shopState: item.shopState,
        price: item.price,
        quantity: item.quantity
      });
    });
  }, [cart]);

  useEffect(() => {
    // Group cart items by shop
    if (cart && cart.length > 0) {
      const shopId = cart[0].shopId;
      setSelectedShop(shopId);
    }
  }, [cart]);

  const updateQuantity = async (itemId, newQuantity) => {
    const result = await updateCartItemQuantity(itemId, newQuantity);
    if (!result.success) {
      alert(result.error || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (!result.success) {
      alert(result.error || 'Failed to remove item');
    }
  };

  const placeOrder = async () => {
    try {
      if (!deliveryAddress.trim()) {
        alert('Please enter a delivery address');
        return;
      }

      // Validate drone delivery requirements
      if (deliveryType === 'drone') {
        if (!pickupLocation.trim() || !deliveryLocation.trim()) {
          alert('Please enter both pickup and delivery locations for drone delivery');
          return;
        }
      }

      const result = await createOrder({
        deliveryType,
        deliveryLocation: deliveryType === 'drone' ? deliveryLocation : deliveryAddress,
        pickupLocation: deliveryType === 'drone' ? pickupLocation : null
      });
      
      if (result.success) {
        setDeliveryAddress('');
        setDeliveryInstructions('');
        setPickupLocation('');
        setDeliveryLocation('');
        alert('Order placed successfully! Redirecting to orders page...');
        navigate('/orders');
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          <button className="btn-primary px-6 py-3" onClick={() => navigate('/shops')}>
            Browse Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 text-sm">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item._id} className="p-6 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full text-gray-400 p-2" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.shopName}</p>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">₹{item.price}</div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-gray-900 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Shop Information */}
            {cart.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Store className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Shop Details</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Shop Name: {cart[0]?.shopName || 'Unknown Shop'}</p>
                  <p>Location: {cart[0]?.shopCity || 'Unknown City'}, {cart[0]?.shopState || 'Unknown State'}</p>
                  <p>Items: {cart.length} product{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Delivery Type Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Type</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="regular"
                    checked={deliveryType === 'regular'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Regular Delivery</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="drone"
                    checked={deliveryType === 'drone'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Drone Delivery</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fast</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
              
              <div className="space-y-3">
                {deliveryType === 'drone' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location *
                      </label>
                      <textarea
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="Enter pickup location (shop address)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Location *
                      </label>
                      <textarea
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="2"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Any special instructions for delivery?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryType === 'drone' ? '50' : '0'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{deliveryType === 'drone' ? cartTotal + 50 : cartTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={placeOrder}
              disabled={
                deliveryType === 'drone' 
                  ? (!pickupLocation.trim() || !deliveryLocation.trim())
                  : !deliveryAddress.trim()
              }
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order - ₹{deliveryType === 'drone' ? cartTotal + 50 : cartTotal}
            </button>

            {/* Additional Info */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>By placing this order, you agree to our terms and conditions</p>
              {deliveryType === 'drone' && (
                <p className="mt-2 text-blue-600">
                  🚁 Drone delivery includes weather safety checks and real-time tracking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
