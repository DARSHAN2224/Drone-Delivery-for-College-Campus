import mongoose from 'mongoose';

const droneOrderSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    qrCode: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'preparing', 'drone_dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    droneId: {
        type: String,
        default: null
    },
    estimatedDeliveryTime: {
        type: Date,
        default: null
    },
    actualDeliveryTime: {
        type: Date,
        default: null
    },
    weatherCheck: {
        windSpeed: Number,
        rainProbability: Number,
        visibility: Number,
        weatherCondition: String,
        isSafe: {
            type: Boolean,
            default: true
        },
        checkedAt: Date,
        error: String
    },
    location: {
        pickup: {
            lat: Number,
            lng: Number,
            address: String
        },
        delivery: {
            lat: Number,
            lng: Number,
            address: String
        },
        currentLocation: {
            lat: Number,
            lng: Number,
            timestamp: Date
        }
    },
    adminNotes: String,
    cancelledBy: {
        type: String,
        enum: ['user', 'seller', 'admin', 'system'],
        default: null
    },
    cancellationReason: String
}, {
    timestamps: true
});

// Index for efficient queries
droneOrderSchema.index({ status: 1, createdAt: -1 });
droneOrderSchema.index({ qrCode: 1 });

export const DroneOrder = mongoose.model('DroneOrder', droneOrderSchema);
