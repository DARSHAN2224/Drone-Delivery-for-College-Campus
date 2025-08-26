import { Order } from '../models/ordersModel.js';
import { OrderHistory } from '../models/historyModel.js';

/**
 * Check if an order should be moved to OrderHistory
 * @param {Object} order - The order object
 * @returns {boolean} - True if order should be archived
 */
export const shouldArchiveOrder = (order) => {
  // Archive if delivery status is delivered or cancelled
  if (order.deliveryStatus === 'delivered' || order.deliveryStatus === 'cancelled') {
    return true;
  }
  
  // Archive if all shops are delivered or cancelled
  if (order.shops && order.shops.length > 0) {
    const allShopsCompleted = order.shops.every(shop => 
      shop.status === 'delivered' || shop.status === 'cancelled'
    );
    if (allShopsCompleted) {
      return true;
    }
  }
  
  return false;
};

/**
 * Convert Order model data to OrderHistory format
 * @param {Object} order - The order object from Order model
 * @returns {Object} - Formatted data for OrderHistory model
 */
export const convertOrderToHistory = (order) => {
  return {
    orderToken: order.orderToken,
    user: order.user,
    shopDetails: order.shops.map(shop => ({
      shop: shop.shopId,
      products: shop.products.map(product => ({
        product: product.productId,
        quantity: product.quantity,
        price: product.price
      })),
      status: shop.status,
      cancelReason: shop.cancelReason,
      deliveredAt: shop.deliveredAt,
      totalQuantity: shop.totalQuantity,
      totalPrice: shop.totalPrice
    })),
    totalQuantity: order.totalQuantity,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid
  };
};

/**
 * Archive a completed order to OrderHistory
 * @param {string} orderId - The order ID to archive
 * @returns {Object} - Result of the archiving operation
 */
export const archiveOrder = async (orderId) => {
  try {
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Check if it should be archived
    if (!shouldArchiveOrder(order)) {
      return { success: false, reason: 'Order not ready for archiving' };
    }
    
    // Check if already archived
    const existingHistory = await OrderHistory.findOne({ orderToken: order.orderToken });
    if (existingHistory) {
      return { success: false, reason: 'Order already archived' };
    }
    
    // Convert and save to OrderHistory
    const historyData = convertOrderToHistory(order);
    const orderHistory = await OrderHistory.create(historyData);
    
    // Optionally: Mark the original order as archived
    // order.isArchived = true;
    // await order.save();
    
    return { success: true, orderHistory };
  } catch (error) {
    console.error('Error archiving order:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Archive all completed orders for a user
 * @param {string} userId - The user ID
 * @returns {Object} - Result of the bulk archiving operation
 */
export const archiveUserCompletedOrders = async (userId) => {
  try {
    // Find all orders that should be archived
    const ordersToArchive = await Order.find({ 
      user: userId,
      $or: [
        { deliveryStatus: 'delivered' },
        { deliveryStatus: 'cancelled' }
      ]
    });
    
    let archivedCount = 0;
    let errors = [];
    
    for (const order of ordersToArchive) {
      const result = await archiveOrder(order._id);
      if (result.success) {
        archivedCount++;
      } else {
        errors.push({ orderId: order._id, reason: result.reason });
      }
    }
    
    return {
      success: true,
      totalProcessed: ordersToArchive.length,
      archivedCount,
      errors
    };
  } catch (error) {
    console.error('Error in bulk archiving:', error);
    return { success: false, error: error.message };
  }
};
