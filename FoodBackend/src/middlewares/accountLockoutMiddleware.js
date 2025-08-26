import { ApiError } from '../utils/ApiError.js';

// In-memory store for failed login attempts (in production, use Redis)
const failedAttempts = new Map();

export const accountLockoutMiddleware = async (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return next();
    }

    const attempts = failedAttempts.get(email) || { count: 0, firstAttempt: null };
    const now = Date.now();
    
    // Reset attempts if 15 minutes have passed since first attempt
    if (attempts.firstAttempt && (now - attempts.firstAttempt) > 15 * 60 * 1000) {
        failedAttempts.delete(email);
        attempts.count = 0;
        attempts.firstAttempt = null;
    }

    // Check if account is locked
    if (attempts.count >= 5) {
        const timeSinceFirstAttempt = now - attempts.firstAttempt;
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        const remainingTime = Math.ceil((lockoutDuration - timeSinceFirstAttempt) / 1000 / 60);
        
        if (timeSinceFirstAttempt < lockoutDuration) {
            throw new ApiError(
                'Account temporarily locked', 
                423, 
                `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`
            );
        } else {
            // Reset lockout after duration
            failedAttempts.delete(email);
        }
    }

    // Store attempt info for tracking
    req.failedAttempts = attempts;
    
    next();
};

// Function to record failed login attempt
export const recordFailedAttempt = (email) => {
    const attempts = failedAttempts.get(email) || { count: 0, firstAttempt: null };
    
    if (attempts.count === 0) {
        attempts.firstAttempt = Date.now();
    }
    
    attempts.count++;
    failedAttempts.set(email, attempts);
};

// Function to clear failed attempts on successful login
export const clearFailedAttempts = (email) => {
    failedAttempts.delete(email);
};
