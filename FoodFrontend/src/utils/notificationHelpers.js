import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

// Helper functions to trigger notifications based on backend responses
export const notificationHelpers = {
  // Order-related notifications
  onOrderPlaced: (orderData) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'success',
      title: 'Order Placed!',
      message: `Your order #${orderData.id} has been placed successfully.`,
      icon: 'check-circle',
      actions: [
        { label: 'View Order', action: '/orders', type: 'link' }
      ]
    });
  },

  onOrderStatusUpdate: (orderData) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      preparing: 'Your order is being prepared by the restaurant.',
      ready: 'Your order is ready for pickup/delivery!',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled.'
    };

    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: orderData.status === 'cancelled' ? 'error' : 'info',
      title: `Order ${orderData.status}`,
      message: statusMessages[orderData.status] || `Order status updated to ${orderData.status}`,
      icon: orderData.status === 'delivered' ? 'check-circle' : 'shopping-bag',
      actions: [
        { label: 'View Order', action: '/orders', type: 'link' }
      ]
    });
  },

  // Seller-related notifications
  onProductStatusUpdate: (productData, isApproved) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user || user.role !== 'seller') return;
    
    if (isApproved) {
      addNotification({
        userId: user._id,
        userModel: 'Seller',
        type: 'success',
        title: 'Product Approved!',
        message: `Your product "${productData.name}" has been approved by admin.`,
        icon: 'check-circle',
        actions: [
          { label: 'View Product', action: '/seller/products', type: 'link' }
        ]
      });
    } else {
      addNotification({
        userId: user._id,
        userModel: 'Seller',
        type: 'error',
        title: 'Product Rejected',
        message: `Your product "${productData.name}" was rejected. Reason: ${productData.rejectionReason || 'No reason provided'}`,
        icon: 'x-circle',
        actions: [
          { label: 'Edit Product', action: `/seller/editproduct/${productData._id}`, type: 'link' }
        ]
      });
    }
  },

  onShopStatusUpdate: (shopData, isApproved) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user || user.role !== 'seller') return;
    
    if (isApproved) {
      addNotification({
        userId: user._id,
        userModel: 'Seller',
        type: 'success',
        title: 'Shop Approved!',
        message: 'Congratulations! Your shop has been approved. You can now start selling.',
        icon: 'check-circle',
        actions: [
          { label: 'Setup Shop', action: '/seller', type: 'link' },
          { label: 'Add Products', action: '/seller/addproducts', type: 'link' }
        ]
      });
    } else {
      addNotification({
        userId: user._id,
        userModel: 'Seller',
        type: 'error',
        title: 'Shop Rejected',
        message: `Your shop application was rejected. Reason: ${shopData.rejectionReason || 'No reason provided'}`,
        icon: 'x-circle',
        actions: [
          { label: 'Edit Shop', action: '/seller/edit-shop', type: 'link' }
        ]
      });
    }
  },

  onNewOrderReceived: (orderData) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user || user.role !== 'seller') return;
    
    addNotification({
      userId: user._id,
      userModel: 'Seller',
      type: 'info',
      title: 'New Order Received',
      message: `You have a new order #${orderData.id} worth ₹${orderData.total}.`,
      icon: 'shopping-bag',
      actions: [
        { label: 'View Order', action: '/seller/orders', type: 'link' }
      ]
    });
  },

  onLowStock: (productData) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user || user.role !== 'seller') return;
    
    addNotification({
      userId: user._id,
      userModel: 'Seller',
      type: 'warning',
      title: 'Low Stock Alert',
      message: `Product "${productData.name}" is running low (${productData.stock} items left).`,
      icon: 'alert-triangle',
      actions: [
        { label: 'Update Stock', action: `/seller/editproduct/${productData._id}`, type: 'link' }
      ]
    });
  },

  // General notifications
  onSuccess: (title, message, actions = []) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'success',
      title,
      message,
      icon: 'check-circle',
      actions
    });
  },

  onError: (title, message, actions = []) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'error',
      title,
      message,
      icon: 'x-circle',
      actions
    });
  },

  onWarning: (title, message, actions = []) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'warning',
      title,
      message,
      icon: 'alert-triangle',
      actions
    });
  },

  onInfo: (title, message, actions = []) => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'info',
      title,
      message,
      icon: 'info',
      actions
    });
  },

  // Network error handling
  onNetworkError: () => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'error',
      title: 'Connection Error',
      message: 'Unable to connect to server. Please check your internet connection.',
      icon: 'x-circle',
      actions: [
        { label: 'Retry', action: () => window.location.reload(), type: 'function' }
      ]
    });
  },

  // Authentication notifications
  onLoginSuccess: (user) => {
    const { addNotification } = useNotificationStore.getState();
    
    const roleMessages = {
      admin: 'Welcome back, Admin! You have full access to the platform.',
      seller: 'Welcome back! Check your shop status and manage your products.',
      user: 'Welcome back! Ready to order some delicious food?'
    };

    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'success',
      title: `Welcome back, ${user.name}!`,
      message: roleMessages[user.role] || 'Welcome back to FoodCourt!',
      icon: 'check-circle',
      actions: [
        { 
          label: 'Dashboard', 
          action: user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/',
          type: 'link'
        }
      ]
    });
  },

  onLogoutSuccess: () => {
    const { addNotification } = useNotificationStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    addNotification({
      userId: user._id,
      userModel: user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'User',
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      icon: 'info'
    });
  }
};

// Hook to use notification helpers in components
export const useNotificationHelpers = () => {
  return notificationHelpers;
};
