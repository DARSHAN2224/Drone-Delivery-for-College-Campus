import { UAParser } from 'ua-parser-js';

// Centralized device details utility
export const getDeviceDetails = (req, res) => {
    try {
        const userAgent = req.headers['user-agent']; // Get User-Agent from request
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        const deviceInfo = {
            browser: result.browser.name || 'Unknown',
            os: result.os.name || 'Unknown',
            device: result.device.type || 'Desktop', // Default to desktop if not identified
            vendor: result.device.vendor || 'Unknown',
            model: result.device.model || 'Unknown',
        };

        res.status(200).json({
            success: true,
            message: 'Device details retrieved successfully',
            deviceInfo,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving device details',
            error: error.message,
        });
    }
};
