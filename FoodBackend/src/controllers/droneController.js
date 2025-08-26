import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { DroneOrder } from '../models/droneOrderModel.js';
import { Drone } from '../models/droneModel.js';
import { Notification } from '../models/notificationModel.js';
import { Admin } from '../models/adminModel.js';
import { DroneAssignment } from '../models/droneAssignmentModel.js';

const createNotification = async ({ userId, userModel, type, title, message, metadata }) => {
    try {
        await Notification.create({ userId, userModel, type, title, message, metadata });
    } catch (e) {
        console.warn('Notification create failed:', e?.message);
    }
};

const notifyAdmins = async (type, title, message, metadata = {}) => {
    const admins = await Admin.find({});
    await Promise.all(admins.map(a => createNotification({ userId: a._id, userModel: 'Admin', type, title, message, metadata })));
};
import { Order } from '../models/ordersModel.js';
import { generateQRCode, verifyQRCode } from '../utils/qrCodeGenerator.js';
import { checkWeatherConditions } from '../utils/weatherAPI.js';
import { logDroneEvent } from '../utils/auditLogger.js';
import { getIo } from '../services/socket.js';

// Create drone delivery order
export const createDroneOrder = asyncHandler(async (req, res) => {
    const { orderId, deliveryLocation, pickupLocation } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!orderId || !deliveryLocation || !pickupLocation) {
        throw new ApiError('Missing required fields', 400, 'Order ID, delivery location, and pickup location are required');
    }
    
    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Order not found', 404, 'The specified order does not exist');
    }
    
    if (order.userId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only create drone orders for your own orders');
    }
    
    // Check if drone order already exists for this order
    const existingDroneOrder = await DroneOrder.findOne({ orderId });
    if (existingDroneOrder) {
        throw new ApiError('Drone order already exists', 400, 'This order already has a drone delivery scheduled');
    }
    
    // Generate unique QR code
    const qrCode = generateQRCode(orderId, userId, Date.now());
    
    // Check weather conditions
    const weatherCheck = await checkWeatherConditions(
        deliveryLocation.lat,
        deliveryLocation.lng
    );
    
    // Create drone order
    const droneOrder = new DroneOrder({
        orderId,
        userId,
        sellerId: order.sellerId,
        qrCode,
        status: weatherCheck.isSafe ? 'pending' : 'weather_blocked',
        weatherCheck,
        location: {
            pickup: pickupLocation,
            delivery: deliveryLocation
        }
    });
    
    await droneOrder.save();
    
    // Log the event
    await logDroneEvent(
        userId,
        'User',
        'drone_order_created',
        req.ip,
        req.get('User-Agent'),
        req.body.deviceId,
        { orderId, qrCode, weatherSafe: weatherCheck.isSafe }
    );
    
    // Emit roomed event for order and potential drone room
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('drone:update', { type: 'created', orderId, droneOrder });
    } catch {}
    res.status(201).json(new ApiResponse(
        201,
        {
            droneOrder: {
                ...droneOrder._doc,
                qrCode
            }
        },
        weatherCheck.isSafe 
            ? 'Drone delivery order created successfully' 
            : 'Drone delivery order created but blocked due to weather conditions'
    ));
});

// Get drone order status
export const getDroneOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const droneOrder = await DroneOrder.findOne({ orderId, userId })
        .populate('orderId', 'items totalAmount status')
        .populate('sellerId', 'name shopName');
    
    if (!droneOrder) {
        throw new ApiError('Drone order not found', 404, 'No drone delivery found for this order');
    }
    
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('drone:update', { type: 'status', orderId, droneOrder });
    } catch {}
    res.status(200).json(new ApiResponse(
        200,
        { droneOrder },
        'Drone order status retrieved successfully'
    ));
});

// Update drone order status (for admin/seller use)
export const updateDroneOrderStatus = asyncHandler(async (req, res) => {
    const { droneOrderId } = req.params;
    const { status, adminNotes, droneId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate status
    const validStatuses = ['preparing', 'drone_dispatched', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new ApiError('Invalid status', 400, 'Invalid drone order status');
    }
    
    const droneOrder = await DroneOrder.findById(droneOrderId);
    if (!droneOrder) {
        throw new ApiError('Drone order not found', 404, 'Drone order not found');
    }
    
    // Check permissions
    if (userRole === 0 && droneOrder.userId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only update your own drone orders');
    }
    
    if (userRole === 1 && droneOrder.sellerId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only update drone orders for your shop');
    }
    
    // Update status
    droneOrder.status = status;
    if (adminNotes) droneOrder.adminNotes = adminNotes;
    if (droneId) droneOrder.droneId = droneId;
    
    // Set timestamps for status changes
    if (status === 'delivered') {
        droneOrder.actualDeliveryTime = new Date();
    } else if (status === 'drone_dispatched') {
        droneOrder.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    }
    
    await droneOrder.save();
    
    // Log the event
    await logDroneEvent(
        userId,
        userRole === 0 ? 'User' : userRole === 1 ? 'Seller' : 'Admin',
        'drone_delivery_status_change',
        req.ip,
        req.get('User-Agent'),
        req.body.deviceId,
        { droneOrderId, oldStatus: droneOrder.status, newStatus: status }
    );
    
    try {
        const io = getIo();
        if (droneOrder.droneId) io?.to(`drone:${droneOrder.droneId}`).emit('drone:update', { type: 'status', droneOrder });
        io?.to(`order:${droneOrder.orderId}`).emit('drone:update', { type: 'status', droneOrder });
    } catch {}
    res.status(200).json(new ApiResponse(
        200,
        { droneOrder },
        'Drone order status updated successfully'
    ));
});

// Verify QR code at delivery
export const verifyQRCodeDelivery = asyncHandler(async (req, res) => {
    const { qrCode } = req.body;
    const userId = req.user._id;
    
    if (!qrCode) {
        throw new ApiError('QR code required', 400, 'QR code is required for delivery verification');
    }
    
    // Verify QR code format
    if (!verifyQRCode(qrCode)) {
        throw new ApiError('Invalid QR code', 400, 'Invalid QR code format');
    }
    
    // Find drone order by QR code
    const droneOrder = await DroneOrder.findOne({ qrCode });
    if (!droneOrder) {
        throw new ApiError('QR code not found', 404, 'No drone order found for this QR code');
    }
    
    // Check if order belongs to user
    if (droneOrder.userId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'This QR code is not for your order');
    }
    
    // Check if order is ready for delivery
    if (droneOrder.status !== 'out_for_delivery') {
        throw new ApiError('Order not ready', 400, `Order is currently in '${droneOrder.status}' status`);
    }
    
    // Mark as delivered
    droneOrder.status = 'delivered';
    droneOrder.actualDeliveryTime = new Date();
    await droneOrder.save();
    
    // Log the event
    await logDroneEvent(
        userId,
        'User',
        'qr_code_verified',
        req.ip,
        req.get('User-Agent'),
        req.body.deviceId,
        { qrCode, orderId: droneOrder.orderId }
    );
    // Notify delivered
    await createNotification({ userId, userModel: 'User', type: 'success', title: 'Order Delivered', message: 'Your order has been delivered. Enjoy!', metadata: { orderId: droneOrder.orderId } });
    await notifyAdmins('info', 'Order Delivered', `Drone ${droneOrder.droneId} delivered order ${droneOrder.orderId}`, { orderId: droneOrder.orderId, droneId: droneOrder.droneId });

    try {
        const io = getIo();
        if (droneOrder.droneId) io?.to(`drone:${droneOrder.droneId}`).emit('drone:update', { type: 'delivered', droneOrder });
        io?.to(`order:${droneOrder.orderId}`).emit('drone:update', { type: 'delivered', droneOrder });
    } catch {}
    res.status(200).json(new ApiResponse(
        200,
        { droneOrder },
        'Delivery verified successfully'
    ));
});

// Get all drone orders for admin dashboard
export const getAllDroneOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const userRole = req.user.role;
    
    // Only admins can view all drone orders
    if (userRole !== 1) {
        throw new ApiError('Unauthorized', 403, 'Only admins can view all drone orders');
    }
    
    const query = {};
    if (status) query.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const droneOrders = await DroneOrder.find(query)
        .populate('userId', 'name email')
        .populate('sellerId', 'name shopName')
        .populate('orderId', 'items totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await DroneOrder.countDocuments(query);
    
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('drone:update', { type: 'assigned', order, drone });
        if (order.droneId) io?.to(`drone:${order.droneId}`).emit('drone:update', { type: 'assigned', order, drone });
    } catch {}
    res.status(200).json(new ApiResponse(
        200,
        {
            droneOrders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        'Drone orders retrieved successfully'
    ));
});

// Cancel drone delivery
export const cancelDroneDelivery = asyncHandler(async (req, res) => {
    const { droneOrderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const droneOrder = await DroneOrder.findById(droneOrderId);
    if (!droneOrder) {
        throw new ApiError('Drone order not found', 404, 'Drone order not found');
    }
    
    // Check permissions
    if (userRole === 0 && droneOrder.userId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only cancel your own drone orders');
    }
    
    if (userRole === 1 && droneOrder.sellerId.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only cancel drone orders for your shop');
    }
    
    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(droneOrder.status)) {
        throw new ApiError('Cannot cancel order', 400, 'This order cannot be cancelled');
    }
    
    // Cancel the order
    droneOrder.status = 'cancelled';
    droneOrder.cancelledBy = userRole === 0 ? 'user' : userRole === 1 ? 'seller' : 'admin';
    droneOrder.cancellationReason = reason;
    await droneOrder.save();
    
    // Log the event
    await logDroneEvent(
        userId,
        userRole === 0 ? 'User' : userRole === 1 ? 'Seller' : 'Admin',
        'order_cancelled',
        req.ip,
        req.get('User-Agent'),
        req.body.deviceId,
        { droneOrderId, reason, cancelledBy: droneOrder.cancelledBy }
    );
    
    res.status(200).json(new ApiResponse(
        200,
        { droneOrder },
        'Drone delivery cancelled successfully'
    ));
});

// Assign a drone to an order (admin only for explicit assignment)
export const assignDrone = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await DroneOrder.findOne({ orderId });
    if (!order) throw new ApiError('Not found', 404, 'Drone order not found');
    // Find an idle drone
    const drone = await Drone.findOneAndUpdate({ status: 'idle' }, { status: 'assigned' }, { new: true });
    if (!drone) throw new ApiError('No drones available', 409, 'No available drones');
    order.droneId = drone.droneId;
    order.status = 'assigned';
    await order.save();
    await DroneAssignment.findOneAndUpdate(
        { orderId },
        { $set: { droneId: drone.droneId, status: 'assigned', releasedAt: null } },
        { new: true, upsert: true }
    );
    return res.status(200).json(new ApiResponse(200, { drone, order }, 'Drone assigned', true));
});

export const launchDrone = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await DroneOrder.findOne({ orderId });
    if (!order || !order.droneId) throw new ApiError('Not found', 404, 'Order not assigned to a drone');
    // Weather safety check before launch
    try {
        const { checkWeatherConditions } = await import('../utils/weatherAPI.js');
        const wx = await checkWeatherConditions(order.location?.delivery?.lat, order.location?.delivery?.lng);
        // Persist latest weather
        order.weatherCheck = wx;
        await order.save();
        if (!wx.isSafe) {
            // Fallback to regular delivery
            const parentOrder = await Order.findById(order.orderId);
            if (parentOrder) {
                parentOrder.deliveryType = 'regular';
                parentOrder.fallbackReason = 'unsafe_weather';
                await parentOrder.save();
            }
            order.status = 'cancelled';
            order.cancelledBy = 'system';
            order.cancellationReason = 'unsafe_weather';
            await order.save();
            await createNotification({ userId: order.userId, userModel: 'User', type: 'warning', title: 'Switched to Regular Delivery', message: 'Drone launch blocked due to unsafe weather. Your order will be delivered by regular courier.', metadata: { orderId } });
            await notifyAdmins('warning', 'Drone Fallback Activated', `Order ${orderId} switched to regular delivery due to weather`, { orderId, weather: wx });
            return res.status(200).json(new ApiResponse(200, { weather: wx, fallback: 'regular' }, 'Drone launch blocked due to unsafe weather conditions. Switched to regular delivery.', true));
        }
    } catch (e) {
        const parentOrder = await Order.findById(order.orderId);
        if (parentOrder) {
            parentOrder.deliveryType = 'regular';
            parentOrder.fallbackReason = 'weather_api_failure';
            await parentOrder.save();
        }
        order.status = 'cancelled';
        order.cancelledBy = 'system';
        order.cancellationReason = 'weather_api_failure';
        await order.save();
        await createNotification({ userId: order.userId, userModel: 'User', type: 'warning', title: 'Switched to Regular Delivery', message: 'Weather data unavailable; switched to regular delivery.', metadata: { orderId } });
        await notifyAdmins('warning', 'Drone Fallback Activated', `Order ${orderId} switched to regular delivery due to weather API failure`, { orderId });
        return res.status(200).json(new ApiResponse(200, { weather: { error: 'Weather API failure' }, fallback: 'regular' }, 'Launch temporarily unavailable. Weather data not available. Switched to regular delivery.', true));
    }

    const drone = await Drone.findOneAndUpdate({ droneId: order.droneId }, { status: 'in_flight', altitude: 50 }, { new: true });
    order.status = 'out_for_delivery';
    await order.save();
    await createNotification({ userId: order.userId, userModel: 'User', type: 'info', title: 'Order In-Flight', message: 'Your order is on the way via drone.', metadata: { orderId } });
    await notifyAdmins('info', 'Drone Launched', `Drone ${order.droneId} launched for order ${orderId}`, { orderId, droneId: order.droneId });
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('drone:update', { type: 'launched', order, drone });
        if (order.droneId) io?.to(`drone:${order.droneId}`).emit('drone:update', { type: 'launched', order, drone });
    } catch {}
    return res.status(200).json(new ApiResponse(200, { drone, order }, 'Drone launched', true));
});

export const landDrone = asyncHandler(async (req, res) => {
    const { droneId } = req.params;
    const drone = await Drone.findOneAndUpdate({ droneId }, { status: 'landed', altitude: 0 }, { new: true });
    if (!drone) throw new ApiError('Not found', 404, 'Drone not found');
    await DroneAssignment.findOneAndUpdate({ droneId, status: 'assigned' }, { $set: { status: 'released', releasedAt: new Date() } });
    try {
        const io = getIo();
        io?.to(`drone:${droneId}`).emit('drone:update', { type: 'landed', drone });
    } catch {}
    return res.status(200).json(new ApiResponse(200, { drone }, 'Drone landed', true));
});

export const returnDrone = asyncHandler(async (req, res) => {
    const { droneId } = req.params;
    const drone = await Drone.findOneAndUpdate({ droneId }, { status: 'returning' }, { new: true });
    if (!drone) throw new ApiError('Not found', 404, 'Drone not found');
    try {
        const io = getIo();
        io?.to(`drone:${droneId}`).emit('drone:update', { type: 'returning', drone });
    } catch {}
    return res.status(200).json(new ApiResponse(200, { drone }, 'Drone returning to base', true));
});

export const emergencyStop = asyncHandler(async (req, res) => {
    const { droneId } = req.params;
    const drone = await Drone.findOneAndUpdate({ droneId }, { status: 'stopped', altitude: 0 }, { new: true });
    if (!drone) throw new ApiError('Not found', 404, 'Drone not found');
    const order = await DroneOrder.findOne({ droneId });
    if (order) {
        await createNotification({ userId: order.userId, userModel: 'User', type: 'error', title: 'Drone Emergency Stop', message: 'Drone experienced an emergency stop. Your order may be delayed.', metadata: { orderId: order.orderId, droneId } });
        await notifyAdmins('error', 'Drone Emergency Stop', `Drone ${droneId} emergency stopped for order ${order.orderId}`, { orderId: order.orderId, droneId });
    }
    try {
        const io = getIo();
        io?.to(`drone:${droneId}`).emit('drone:update', { type: 'emergency_stop', drone });
    } catch {}
    return res.status(200).json(new ApiResponse(200, { drone }, 'Emergency stop executed', true));
});

export const getDroneStatus = asyncHandler(async (req, res) => {
    const { droneId } = req.params;
    const drone = await Drone.findOne({ droneId });
    if (!drone) throw new ApiError('Not found', 404, 'Drone not found');
    if (typeof drone.battery === 'number' && drone.battery <= 15) {
        const order = await DroneOrder.findOne({ droneId });
        if (order) {
            await createNotification({ userId: order.userId, userModel: 'User', type: 'warning', title: 'Low Drone Battery', message: 'Drone battery is low; delivery may be delayed.', metadata: { orderId: order.orderId, droneId } });
            await notifyAdmins('warning', 'Low Drone Battery', `Drone ${droneId} battery low for order ${order.orderId}`, { orderId: order.orderId, droneId });
            // Also surface a GET-level toast per spec (GET notify only when explicitly important)
            return res.status(200).json(new ApiResponse(200, { drone, toastType: 'warning' }, 'Drone battery low; delivery may be delayed.', true));
        }
    }
    return res.status(200).json(new ApiResponse(200, { drone }, 'Drone status'));
});

// User-safe endpoint: get drone status by orderId (must belong to user)
export const getDroneStatusByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user?._id;
    if (!userId) throw new ApiError('Unauthorized', 401, 'User not authenticated');
    const droneOrder = await DroneOrder.findOne({ orderId, userId });
    if (!droneOrder || !droneOrder.droneId) {
        return res.status(200).json(new ApiResponse(200, { drone: null }, 'No drone assigned'));
    }
    const drone = await Drone.findOne({ droneId: droneOrder.droneId });
    if (!drone) {
        return res.status(200).json(new ApiResponse(200, { drone: null }, 'Drone not found'));
    }
    return res.status(200).json(new ApiResponse(200, { drone, droneOrder }, 'Drone status'));
});

// Get all drones for admin dashboard
export const getAllDrones = asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    
    // Only admins can view all drones
    if (userRole !== 1) {
        throw new ApiError('Unauthorized', 403, 'Only admins can view all drones');
    }
    
    const drones = await Drone.find({})
        .sort({ createdAt: -1 });
    
    res.status(200).json(new ApiResponse(
        200,
        { drones },
        'All drones retrieved successfully'
    ));
});

// Call drone to shop for pickup (seller endpoint)
export const callDroneToShop = asyncHandler(async (req, res) => {
    const { orderId, shopId, shopLocation } = req.body;
    const sellerId = req.seller._id;
    
    // Validate required fields
    if (!orderId || !shopId) {
        throw new ApiError('Missing required fields', 400, 'Order ID and shop ID are required');
    }
    
    // Verify the order belongs to this seller
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Order not found', 404, 'The specified order does not exist');
    }
    
    // Check if any shop in the order belongs to this seller
    const sellerShop = order.shops.find(shop => 
        (shop.shopId._id || shop.shopId).toString() === shopId.toString()
    );
    
    if (!sellerShop) {
        throw new ApiError('Unauthorized', 403, 'This order does not belong to your shop');
    }
    
    // Check if order is ready for drone pickup
    if (sellerShop.status !== 'ready') {
        throw new ApiError('Order not ready', 400, 'Order must be marked as ready before calling drone');
    }
    
    // Check if order is drone delivery
    if (order.deliveryType !== 'drone') {
        throw new ApiError('Not drone delivery', 400, 'This order is not a drone delivery');
    }
    
    // Find available drone
    const availableDrone = await Drone.findOne({ 
        status: 'available',
        battery: { $gt: 20 } // Ensure drone has sufficient battery
    });
    
    if (!availableDrone) {
        throw new ApiError('No drones available', 503, 'No drones are currently available for pickup');
    }
    
    // Update drone status and assign to order
    await Drone.findOneAndUpdate(
        { droneId: availableDrone.droneId },
        { 
            status: 'en_route_to_shop',
            currentOrder: orderId,
            destination: shopLocation || 'Shop Location'
        }
    );
    
    // Create or update drone assignment
    await DroneAssignment.findOneAndUpdate(
        { orderId },
        {
            droneId: availableDrone.droneId,
            orderId,
            status: 'en_route_to_shop',
            assignedAt: new Date(),
            shopLocation: shopLocation || 'Shop Location'
        },
        { upsert: true, new: true }
    );
    
    // Update drone order status
    await DroneOrder.findOneAndUpdate(
        { orderId },
        { 
            status: 'drone_en_route_to_shop',
            droneId: availableDrone.droneId,
            shopLocation: shopLocation || 'Shop Location'
        }
    );
    
    // Create notifications
    await createNotification({ 
        userId: order.user, 
        userModel: 'User', 
        type: 'info', 
        title: 'Drone En Route', 
        message: 'Drone is on the way to pick up your order from the shop.', 
        metadata: { orderId, droneId: availableDrone.droneId } 
    });
    
    await notifyAdmins(
        'info', 
        'Drone Called to Shop', 
        `Drone ${availableDrone.droneId} called to shop for order ${orderId}`, 
        { orderId, droneId: availableDrone.droneId, shopId }
    );
    
    // Emit socket events
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('drone:update', { 
            type: 'en_route_to_shop', 
            orderId, 
            droneId: availableDrone.droneId 
        });
        io?.to(`drone:${availableDrone.droneId}`).emit('drone:update', { 
            type: 'en_route_to_shop', 
            orderId, 
            shopLocation 
        });
    } catch {}
    
    // Log the event
    await logDroneEvent(
        sellerId,
        'Seller',
        'drone_called_to_shop',
        req.ip,
        req.get('User-Agent'),
        req.body.deviceId,
        { orderId, droneId: availableDrone.droneId, shopLocation }
    );
    
    res.status(200).json(new ApiResponse(
        200,
        { 
            droneId: availableDrone.droneId,
            orderId,
            status: 'drone_en_route_to_shop'
        },
        'Drone called to shop successfully'
    ));
});
