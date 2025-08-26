import crypto from 'crypto';

// Generate unique QR code for drone orders
export const generateQRCode = (orderId, userId, timestamp) => {
    // Create a unique string combining order details
    const uniqueString = `${orderId}-${userId}-${timestamp}-${crypto.randomBytes(8).toString('hex')}`;
    
    // Generate hash for security
    const hash = crypto.createHash('sha256').update(uniqueString).digest('hex');
    
    // Return a shorter, readable format (first 16 characters)
    return `DRONE-${hash.substring(0, 16).toUpperCase()}`;
};

// Verify QR code format
export const verifyQRCode = (qrCode) => {
    const qrRegex = /^DRONE-[A-F0-9]{16}$/;
    return qrRegex.test(qrCode);
};

// Extract order information from QR code (if needed for verification)
export const parseQRCode = (qrCode) => {
    if (!verifyQRCode(qrCode)) {
        throw new Error('Invalid QR code format');
    }
    
    return {
        prefix: qrCode.substring(0, 6),
        hash: qrCode.substring(6)
    };
};
