import { ApiError } from '../utils/ApiError.js';

// Basic input sanitization
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .replace(/data:/gi, ''); // Remove data: protocol
};

// Sanitize request body
export const sanitizeBody = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }
    
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        });
    }
    
    next();
};

// Validate password strength
export const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    
    if (password.length < minLength) {
        throw new ApiError('Password validation failed', 400, 'Password must be at least 8 characters long');
    }
    
    if (!hasNumber) {
        throw new ApiError('Password validation failed', 400, 'Password must contain at least one number');
    }
    
    if (!hasSpecialChar) {
        throw new ApiError('Password validation failed', 400, 'Password must contain at least one special character');
    }
    
    if (!hasUpperCase) {
        throw new ApiError('Password validation failed', 400, 'Password must contain at least one uppercase letter');
    }
    
    if (!hasLowerCase) {
        throw new ApiError('Password validation failed', 400, 'Password must contain at least one lowercase letter');
    }
    
    return true;
};

// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError('Invalid email format', 400, 'Please provide a valid email address');
    }
    return true;
};

// Validate mobile number
export const validateMobile = (mobile) => {
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
        throw new ApiError('Invalid mobile number', 400, 'Mobile number must be exactly 10 digits');
    }
    return true;
};
