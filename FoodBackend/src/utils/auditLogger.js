import { AuditLog } from '../models/auditLogModel.js';

// Log user action to audit log
export const logAuditEvent = async (userId, userModel, action, ipAddress, userAgent, deviceId, details = {}, success = true, errorMessage = null) => {
    try {
        const auditEntry = new AuditLog({
            userId,
            userModel,
            action,
            ipAddress,
            userAgent,
            deviceId,
            details,
            success,
            errorMessage
        });
        
        await auditEntry.save();
        
    } catch (error) {
        // Don't throw error if audit logging fails - just log to console
        console.error('Audit logging failed:', error.message);
    }
};

// Log successful login
export const logSuccessfulLogin = async (userId, userModel, ipAddress, userAgent, deviceId) => {
    await logAuditEvent(
        userId,
        userModel,
        'login_success',
        ipAddress,
        userAgent,
        deviceId,
        { timestamp: new Date() }
    );
};

// Log failed login attempt
export const logFailedLogin = async (email, ipAddress, userAgent, deviceId, errorMessage) => {
    // For failed logins, we might not have userId yet
    await logAuditEvent(
        null,
        'Unknown',
        'login_failed',
        ipAddress,
        userAgent,
        deviceId,
        { email, timestamp: new Date() },
        false,
        errorMessage
    );
};

// Log logout
export const logLogout = async (userId, userModel, ipAddress, userAgent, deviceId) => {
    await logAuditEvent(
        userId,
        userModel,
        'logout',
        ipAddress,
        userAgent,
        deviceId,
        { timestamp: new Date() }
    );
};

// Log drone-related events
export const logDroneEvent = async (userId, userModel, action, ipAddress, userAgent, deviceId, details = {}) => {
    await logAuditEvent(
        userId,
        userModel,
        action,
        ipAddress,
        userAgent,
        deviceId,
        { ...details, timestamp: new Date() }
    );
};

// Log admin actions
export const logAdminAction = async (adminId, action, ipAddress, userAgent, deviceId, details = {}) => {
    await logAuditEvent(
        adminId,
        'Admin',
        action,
        ipAddress,
        userAgent,
        deviceId,
        { ...details, timestamp: new Date() }
    );
};

// Get audit logs for a specific user
export const getUserAuditLogs = async (userId, limit = 50) => {
    try {
        return await AuditLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Failed to fetch user audit logs:', error.message);
        return [];
    }
};

// Get audit logs for admin dashboard
export const getAdminAuditLogs = async (filters = {}, page = 1, limit = 20) => {
    try {
        const query = {};
        
        if (filters.action) query.action = filters.action;
        if (filters.userModel) query.userModel = filters.userModel;
        if (filters.success !== undefined) query.success = filters.success;
        if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
        if (filters.endDate) query.timestamp = { $lte: new Date(filters.endDate) };
        
        const skip = (page - 1) * limit;
        
        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await AuditLog.countDocuments(query);
        
        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
        
    } catch (error) {
        console.error('Failed to fetch admin audit logs:', error.message);
        return { logs: [], total: 0, page: 1, totalPages: 0 };
    }
};
