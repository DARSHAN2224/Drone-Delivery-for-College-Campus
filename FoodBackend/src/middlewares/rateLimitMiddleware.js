import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// Rate limiter for login attempts
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError('Too many login attempts', 429, 'Please try again after 15 minutes');
    }
});

// Rate limiter for signup attempts
export const signupRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 signup requests per hour
    message: {
        success: false,
        message: 'Too many signup attempts from this IP, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError('Too many signup attempts', 429, 'Please try again after 1 hour');
    }
});

// Rate limiter for password reset
export const passwordResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Limit each IP to 2 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts from this IP, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError('Too many password reset attempts', 429, 'Please try again after 1 hour');
    }
});
