import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel',
        required: true
    },
    userModel: {
        type: String,
        enum: ['User', 'Seller', 'Admin'],
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login_success', 'login_failed', 'logout', 'password_reset', 'email_verification', 'drone_assigned', 'drone_delivery_status_change', 'order_cancelled', 'admin_override']
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: String,
    deviceId: String,
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: String
}, {
    timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
