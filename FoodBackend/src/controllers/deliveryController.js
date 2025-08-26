import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Delivery } from '../models/deliveryModel.js';
import { Order } from '../models/ordersModel.js';
import { Notification } from '../models/notificationModel.js';
import { getIo } from '../services/socket.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';
import crypto from 'crypto';

// Create notification helper
const createNotification = async ({ userId, userModel, type, title, message, metadata }) => {
    try {
        await Notification.create({ userId, userModel, type, title, message, metadata });
    } catch (e) {
        console.warn('Notification create failed:', e?.message);
    }
};

// Generate secure QR token with expiry
const generateSecureQRToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    return { token, expiry };
};

// Update delivery status with history tracking
export const upsertDelivery = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { shopId, status, location, etaMinutes, rider, deliveryNotes, deliveryMode } = req.body;
    
    if (!shopId) throw new ApiError('shopId is required', 400);

    // Find existing delivery or create new one
    let delivery = await Delivery.findOne({ orderId, shopId });
    
    if (!delivery) {
        // Create new delivery
        const qrData = deliveryMode === 'drone' ? generateSecureQRToken() : {};
        
        delivery = new Delivery({
            orderId,
            shopId,
            deliveryMode: deliveryMode || 'regular',
            status: 'unassigned',
            qrCode: qrData.token || null,
            qrExpiry: qrData.expiry || null,
            qrToken: qrData.token || null
        });
    }

    // Update fields
    if (status) {
        delivery.status = status;
        // Add to status history
        delivery.statusHistory.push({
            status,
            timestamp: new Date(),
            location: delivery.currentLocation,
            notes: deliveryNotes
        });
    }
    
    if (typeof etaMinutes === 'number') delivery.etaMinutes = etaMinutes;
    if (rider) delivery.rider = rider;
    if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;
    
    if (location) {
        delivery.currentLocation = location;
        delivery.route.push({ ...location, timestamp: new Date() });
    }

    await delivery.save();

    // Update order delivery status
    await Order.findByIdAndUpdate(orderId, {
        deliveryStatus: status,
        deliveryPartner: rider,
        estimatedDeliveryTime: etaMinutes ? new Date(Date.now() + etaMinutes * 60 * 1000) : undefined
    });

    // Emit socket update
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('delivery:update', { delivery, orderId });
        io?.to(`shop:${shopId}`).emit('delivery:update', { delivery, orderId });
    } catch {}

    // Create notifications
    if (status === 'delivered') {
        const order = await Order.findById(orderId).populate('user');
        if (order) {
            await createNotification({
                userId: order.user,
                userModel: 'User',
                type: 'success',
                title: 'Order Delivered',
                message: 'Your order has been delivered successfully!',
                metadata: { orderId, shopId }
            });
        }
    }

    return res.status(200).json(new ApiResponse(200, delivery, 'Delivery updated successfully'));
});

// Get delivery status for users
export const getDelivery = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { shopId } = req.query;
    const userId = req.user._id;
    
    // Verify user owns this order
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== userId.toString()) {
        throw new ApiError('Unauthorized', 403, 'You can only view your own orders');
    }
    
    const query = { orderId };
    if (shopId) query.shopId = shopId;

    const deliveries = await Delivery.find(query)
        .populate('shopId', 'name address')
        .lean();
        
    return res.status(200).json(new ApiResponse(200, deliveries, 'Delivery tracking retrieved'));
});

// Admin: Get all active deliveries
export const getAllDeliveries = asyncHandler(async (req, res) => {
    const { status, mode, page = 1, limit = 20 } = req.query;
    
    // Check if admin is authenticated (req.admin is set by verifyAdminJWT)
    if (!req.admin) {
        throw new ApiError('Unauthorized', 403, 'Only admins can view all deliveries');
    }
    
    const query = {};
    if (status) query.status = status;
    if (mode) query.deliveryMode = mode;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const deliveries = await Delivery.find(query)
        .populate('orderId', 'totalPrice deliveryLocation')
        .populate('shopId', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await Delivery.countDocuments(query);
    
    res.status(200).json(new ApiResponse(
        200,
        {
            deliveries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        'All deliveries retrieved successfully'
    ));
});

// Admin: Mark delivery as completed
export const markDeliveryCompleted = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params;
    const { notes } = req.body;
    
    // Check if admin is authenticated (req.admin is set by verifyAdminJWT)
    if (!req.admin) {
        throw new ApiError('Unauthorized', 403, 'Only admins can mark deliveries as completed');
    }
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
        throw new ApiError('Delivery not found', 404, 'Delivery not found');
    }
    
    delivery.status = 'delivered';
    delivery.deliveryNotes = notes || delivery.deliveryNotes;
    delivery.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        location: delivery.currentLocation,
        notes: notes || 'Marked as delivered by admin'
    });
    
    await delivery.save();
    
    // Update order status
    await Order.findByIdAndUpdate(delivery.orderId, {
        deliveryStatus: 'delivered',
        actualDeliveryTime: new Date()
    });
    
    // Emit socket update
    try {
        const io = getIo();
        io?.to(`order:${delivery.orderId}`).emit('delivery:update', { delivery, orderId: delivery.orderId });
        io?.to(`shop:${delivery.shopId}`).emit('delivery:update', { delivery, orderId: delivery.orderId });
    } catch {}
    
    res.status(200).json(new ApiResponse(200, delivery, 'Delivery marked as completed'));
});

// Generate test QR code for development
export const generateTestQR = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Order not found', 404, 'Order not found');
    }
    
    // Generate a test QR code
    const testQRData = generateSecureQRToken();
    
    // Find or create delivery
    let delivery = await Delivery.findOne({ orderId, shopId: order.shops[0]?.shopId });
    
    if (!delivery) {
        delivery = new Delivery({
            orderId,
            shopId: order.shops[0]?.shopId,
            deliveryMode: 'drone',
            status: 'nearby',
            qrCode: testQRData.token,
            qrExpiry: testQRData.expiry,
            qrToken: testQRData.token
        });
    } else {
        delivery.qrCode = testQRData.token;
        delivery.qrExpiry = testQRData.expiry;
        delivery.qrToken = testQRData.token;
        delivery.status = 'nearby';
    }
    
    await delivery.save();
    
    // Update order
    await Order.findByIdAndUpdate(orderId, { 
        deliveryType: 'drone',
        deliveryStatus: 'nearby'
    });
    
    res.status(200).json(new ApiResponse(200, { 
        qrCode: testQRData.token,
        expiry: testQRData.expiry,
        delivery 
    }, 'Test QR code generated successfully'));
});

// Mock endpoint for testing regular delivery updates
export const mockRegularDelivery = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, location, etaMinutes } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Order not found', 404, 'Order not found');
    }
    
    // Find or create delivery
    let delivery = await Delivery.findOne({ orderId, shopId: order.shops[0]?.shopId });
    
    if (!delivery) {
        delivery = new Delivery({
            orderId,
            shopId: order.shops[0]?.shopId,
            deliveryMode: 'regular',
            status: 'unassigned'
        });
    }
    
    // Update status
    if (status) {
        delivery.status = status;
        delivery.statusHistory.push({
            status,
            timestamp: new Date(),
            location: delivery.currentLocation,
            notes: 'Mock update for testing'
        });
    }
    
    if (location) {
        delivery.currentLocation = location;
        delivery.route.push({ ...location, timestamp: new Date() });
    }
    
    if (etaMinutes) delivery.etaMinutes = etaMinutes;
    
    await delivery.save();
    
    // Update order
    await Order.findByIdAndUpdate(orderId, { deliveryStatus: status });
    
    // Emit socket update
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('delivery:update', { delivery, orderId });
    } catch {}
    
    res.status(200).json(new ApiResponse(200, delivery, 'Mock delivery update applied'));
});

// Verify QR code for drone delivery
export const verifyQRDelivery = asyncHandler(async (req, res) => {
    const { qrCode, orderId } = req.body;
    const userId = req.user._id;
    
    if (!qrCode || !orderId) {
        throw new ApiError('Missing required fields', 400, 'QR code and order ID are required');
    }
    
    // Find delivery
    const delivery = await Delivery.findOne({ 
        orderId, 
        qrCode,
        deliveryMode: 'drone'
    });
    
    if (!delivery) {
        throw new ApiError('Invalid QR code', 400, 'QR code not found or invalid');
    }
    
    // Check if QR code is expired
    if (delivery.qrExpiry && new Date() > delivery.qrExpiry) {
        throw new ApiError('QR code expired', 400, 'QR code has expired');
    }
    
    // Check if already delivered
    if (delivery.status === 'delivered') {
        throw new ApiError('Already delivered', 400, 'This delivery has already been completed');
    }
    
    // Mark as delivered
    delivery.status = 'delivered';
    delivery.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        location: delivery.currentLocation,
        notes: 'Delivered via QR verification'
    });
    
    await delivery.save();
    
    // Update order
    await Order.findByIdAndUpdate(orderId, {
        deliveryStatus: 'delivered',
        actualDeliveryTime: new Date()
    });
    
    // Emit socket updates
    try {
        const io = getIo();
        io?.to(`order:${orderId}`).emit('delivery:update', { delivery, orderId });
        io?.to(`shop:${delivery.shopId}`).emit('delivery:update', { delivery, orderId });
    } catch {}
    
    // Create notification
    await createNotification({
        userId,
        userModel: 'User',
        type: 'success',
        title: 'Order Delivered',
        message: 'Your drone delivery has been completed successfully!',
        metadata: { orderId, deliveryId: delivery._id }
    });
    
    res.status(200).json(new ApiResponse(200, delivery, 'Delivery verified successfully'));
});


